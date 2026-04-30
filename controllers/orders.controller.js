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
// HELPER: GET CART ID
// ======================
const getCartIdByUserId = async (user_id) => {
    const [rows] = await pool.query(
        "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
        [user_id]
    );
    return rows.length ? rows[0].cart_id : null;
};

// ======================
// COMPLETE ORDER
// ======================
exports.completeOrder = async (req, res) => {
    const connection = await pool.getConnection();

    try {
        const { phone, address, method } = req.body;

        // kiểm tra auth
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Không tìm thấy user" });
        }

        const user_id = req.user.userId;

        // lấy cart thật
        const cart_id = await getCartIdByUserId(user_id);

        if (!cart_id) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }

        await connection.beginTransaction();

        // lock cart items
        const [cartItems] = await connection.query(
            "SELECT * FROM cart_items WHERE cart_id = ? FOR UPDATE",
            [cart_id]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.json({
                success: true,
                message: "Giỏ hàng đã trống"
            });
        }

        // tính tổng tiền
        const total = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        // tạo order
        const [orderResult] = await connection.query(
            `INSERT INTO orders 
            (user_id, total_price, status, shipping_address, phone, payment_method)
            VALUES (?, ?, 'completed', ?, ?, ?)`,
            [user_id, total, address, phone, method]
        );

        const orderId = orderResult.insertId;

        // insert order_items
        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items 
                (order_id, product_id, quantity, price)
                VALUES (?, ?, ?, ?)`,
                [orderId, item.product_id, item.quantity, item.price]
            );
        }

        // clear cart
        await connection.query(
            "DELETE FROM cart_items WHERE cart_id = ?",
            [cart_id]
        );

        await connection.commit();

        res.json({
            success: true,
            message: "Thanh toán thành công",
            orderId
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Order error:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// ======================
// GET ORDERS
// ======================
exports.getOrders = async (req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT * FROM orders ORDER BY created_at DESC"
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};