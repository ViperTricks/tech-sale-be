const pool = require('./config/db'); // Đảm bảo đường dẫn này đúng với file db của bạn

const products = [
    // --- CATEGORY 1: LAPTOP & MACBOOK ---
    ['Bàn Phím Cơ Rapoo V500S Backlit', 'Bàn phím cơ không dây, có đèn led', 990000, 0, 'https://3.bp.blogspot.com/-mqYOgqLF4bY/V1kgT38LkZI/AAAAAAAAA2g/CicxGrv0BgMXN1x1xUMjYlPyFlw7TSPNACLcB/w1200-h630-p-k-no-nu/V500s_v500s-w.png', 3],
    ];

(async () => {
    try {
        console.log("🔍 Đang kết nối database...");
        
        // 1. Kiểm tra số lượng sản phẩm hiện tại
        const [oldRows] = await pool.query("SELECT COUNT(*) as total FROM products");
        console.log(`📊 Số lượng sản phẩm hiện có: ${oldRows[0].total}`);

        console.log("🚀 Đang thêm mới sản phẩm...");

        // 2. Sử dụng vòng lặp để chèn dữ liệu
        const insertQuery = `
            INSERT INTO products (name, description, price, stock, image_url, category_id)
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        for (const p of products) {
            await pool.query(insertQuery, p);
            console.log(`✅ Đã thêm: ${p[0]}`);
        }

        // 3. Hiển thị lại bảng kết quả cuối cùng
        const [newRows] = await pool.query("SELECT product_id, name, price, category_id FROM products ORDER BY category_id");
        console.log("\n✨ DANH SÁCH SẢN PHẨM SAU KHI CẬP NHẬT:");
        console.table(newRows);

    } catch (err) {
        console.error("❌ Lỗi thực thi:", err.message);
    } finally {
        console.log("\n👋 Đã đóng kết nối.");
        process.exit();
    }
})();