const pool = require("../config/db");

// ======================
// GET ALL ORDERS
// ======================
exports.getAllOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT * 
            FROM orders 
            ORDER BY created_at DESC
        `);

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ======================
// COMPLETE ORDER
// ======================
exports.completeOrder = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { phone, address, method } = req.body;

        // ⚠️ FIX SAU: lấy user từ token (tạm thời hardcode)
        const user_id = req.user?.userId || 1;

        // ⚠️ FIX SAU: cart theo user (tạm hardcode)
        const cart_id = 1;

        await connection.beginTransaction();

        // 1. lấy cart items
        const [cartItems] = await connection.query(
            "SELECT * FROM cart_items WHERE cart_id = ?",
            [cart_id]
        );

        if (!cartItems.length) {
            await connection.rollback();
            return res.status(400).json({ message: "Cart empty" });
        }

        // 2. tính total
        const total = cartItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
        );

        // 3. tạo order
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (user_id, total_price, status, shipping_address, phone, payment_method)
            VALUES (?, ?, 'completed', ?, ?, ?)`,
            [user_id, total, address, phone, method]
        );

        const orderId = orderResult.insertId;

        // 4. insert order_items
        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)`,
                [
                    orderId,
                    item.product_id,
                    item.quantity,
                    item.price
                ]
            );
        }

        // 5. clear cart
        await connection.query(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [cart_id]
        );

        await connection.commit();

        res.json({
            success: true,
            orderId
        });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};