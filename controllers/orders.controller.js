const pool = require("../config/db");

// Hàm phụ trợ để tìm cart_id từ user_id
const getCartIdByUserId = async (user_id) => {
    const [rows] = await pool.query(
        "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
        [user_id]
    );
    return rows.length ? rows[0].cart_id : null;
};// --- HOÀN TẤT ĐƠN HÀNG VÀ XÓA GIỎ (FIX: SELECT FOR UPDATE) ---
exports.completeOrder = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { orderId, phone, address, method } = req.body;

        // 1. Kiểm tra Auth
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Không tìm thấy thông tin đăng nhập" });
        }
        const user_id = req.user.userId;

        // 2. Tìm đúng cart_id của user
        const cart_id = await getCartIdByUserId(user_id);
        if (!cart_id) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }

        // BẮT ĐẦU TRANSACTION
        await connection.beginTransaction();

        // 3. LẤY SẢN PHẨM VÀ KHÓA DÒNG (SELECT FOR UPDATE)
        // Dòng này sẽ khóa các item trong giỏ của user này lại. 
        // Request thứ 2 bay vào đây sẽ phải đợi cho đến khi Request 1 Commit hoặc Rollback.
        const [cartItems] = await connection.query(
            "SELECT * FROM cart_items WHERE cart_id = ? FOR UPDATE", 
            [cart_id]
        );

        // 4. KIỂM TRA GIỎ HÀNG
        // Khi Request 2 "hết lệnh chờ" và được vào đây, 
        // thì Request 1 đã thực hiện xong lệnh DELETE ở dưới rồi, nên cartItems lúc này sẽ rỗng.
        if (cartItems.length === 0) {
            await connection.rollback();
            // Trả về success true vì thực tế đơn hàng đã được xử lý xong ở request trước đó
            return res.json({ 
                success: true, 
                message: "Đơn hàng đã được xử lý (Giỏ hàng đã trống)" 
            });
        }

        // 5. Tính tổng tiền
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 6. Tạo đơn hàng vào bảng orders
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_price, status, shipping_address, phone)
             VALUES (?, ?, 'completed', ?, ?)`,
            [user_id, total, address, phone]
        );

        const newOrderId = orderResult.insertId;

        // 7. Chuyển sản phẩm sang bảng order_items
        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [newOrderId, item.product_id, item.quantity, item.price]
            );
        }

        // 8. XÓA SẠCH GIỎ HÀNG (Lệnh này sẽ giải phóng khóa sau khi Commit)
        await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cart_id]);

        // HOÀN TẤT
        await connection.commit();
        res.json({ 
            success: true, 
            message: "Thanh toán hoàn tất, giỏ hàng đã được xóa", 
            orderId: newOrderId 
        });

    } catch (err) {
        if (connection) await connection.rollback();
        console.error("Lỗi Transaction:", err.message);
        res.status(500).json({ error: err.message });
    } finally {
        connection.release();
    }
};

// --- LẤY DANH SÁCH ĐƠN HÀNG ---
exports.getOrders = async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM orders ORDER BY created_at DESC");
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};