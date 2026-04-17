const pool = require('./config/db'); // nhớ đúng tên file chứa createPool của bạn

(async () => {
    try {
        console.log("🔍 Đang kiểm tra bảng products...");

        // Lấy danh sách product
        const [rows] = await pool.query("SELECT * FROM products");

        if (rows.length === 0) {
            console.log("⚠️ Bảng products đang trống");
        } else {
            console.log(`✅ Có ${rows.length} sản phẩm:`);
            console.table(rows);
        }

    } catch (err) {
        console.error("❌ Lỗi khi query products:", err.message);
    } finally {
        process.exit();
    }
})();