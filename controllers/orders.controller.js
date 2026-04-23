const pool = require("../config/db");

exports.completeOrder = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { orderId, phone, address, method } = req.body;

        const cart_id = 1; // 1 user = 1 cart (theo yêu cầu bạn)

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

        // 2. tạo order
        const total = cartItems.reduce(
            (sum, i) => sum + i.price * i.quantity,
            0
        );

        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_price, status, shipping_address, phone)
             VALUES (?, ?, 'completed', ?, ?)`,
            [1, total, address, phone]
        );

        const newOrderId = orderResult.insertId;

        // 3. insert order_items
        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [newOrderId, item.product_id, item.quantity, item.price]
            );
        }

        // 4. clear cart
        await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cart_id]);

        await connection.commit();

        res.json({
            success: true,
            orderId: newOrderId
        });

    } catch (err) {
        await connection.rollback();
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};