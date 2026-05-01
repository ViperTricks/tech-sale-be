const pool = require("../config/db");

// Hàm phụ trợ để tìm cart_id từ user_id
const getCartIdByUserId = async (user_id) => {
    const [rows] = await pool.query(
        "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
        [user_id]
    );
    return rows.length ? rows[0].cart_id : null;
};
// --- HOÀN TẤT ĐƠN HÀNG VÀ XÓA GIỎ (FIX BUG CONNECTION CỦA VINH) ---
exports.completeOrder = async (req, res) => {
    let connection; // Khai báo ở ngoài để block finally nhìn thấy
    
    try {
        // 1. Lấy connection bỏ vô try cho an toàn tuyệt đối
        connection = await pool.getConnection();
        
        const { orderId, phone, address, method } = req.body;

        // 2. Kiểm tra Auth
        if (!req.user || !req.user.userId) {
            return res.status(401).json({ message: "Không tìm thấy thông tin đăng nhập" });
        }
        const user_id = req.user.userId;

        // 3. Tìm đúng cart_id của user
        const cart_id = await getCartIdByUserId(user_id);
        if (!cart_id) {
            return res.status(404).json({ message: "Giỏ hàng không tồn tại" });
        }

        // BẮT ĐẦU TRANSACTION
        await connection.beginTransaction();

        // 4. LẤY SẢN PHẨM VÀ KHÓA DÒNG (SELECT FOR UPDATE)
        const [cartItems] = await connection.query(
            "SELECT * FROM cart_items WHERE cart_id = ? FOR UPDATE", 
            [cart_id]
        );

        // 5. KIỂM TRA GIỎ HÀNG
        if (cartItems.length === 0) {
            await connection.rollback();
            return res.json({ 
                success: true, 
                message: "Đơn hàng đã được xử lý (Giỏ hàng đã trống)" 
            });
        }

        // 6. Tính tổng tiền
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 7. Tạo đơn hàng vào bảng orders
        const [orderResult] = await connection.query(
            `INSERT INTO orders (user_id, total_price, status, shipping_address, phone)
             VALUES (?, ?, 'completed', ?, ?)`,
            [user_id, total, address, phone]
        );

        const newOrderId = orderResult.insertId;

        // 8. Chuyển sản phẩm sang bảng order_items
        for (const item of cartItems) {
            await connection.query(
                `INSERT INTO order_items (order_id, product_id, quantity, price)
                 VALUES (?, ?, ?, ?)`,
                [newOrderId, item.product_id, item.quantity, item.price]
            );
        }

        // 9. XÓA SẠCH GIỎ HÀNG
        await connection.query("DELETE FROM cart_items WHERE cart_id = ?", [cart_id]);

        // HOÀN TẤT
        await connection.commit();
        res.json({ 
            success: true, 
            message: "Thanh toán hoàn tất, giỏ hàng đã được xóa", 
            orderId: newOrderId 
        });

    } catch (err) {
        console.error("Lỗi Transaction:", err.message);
        
        // FIX LỖI "CLOSED STATE" Ở ĐÂY
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackErr) {
                console.error("Lỗi khi rollback (connection có thể đã bị đóng):", rollbackErr.message);
            }
        }
        res.status(500).json({ error: "Lỗi hệ thống khi xử lý thanh toán" });
        
    } finally {
        // LUÔN LUÔN GIẢI PHÓNG KẾT NỐI
        if (connection) {
            connection.release();
        }
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