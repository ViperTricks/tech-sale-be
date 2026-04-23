const pool = require("./config/db");

(async () => {
    try {
        const [rows] = await pool.query(`
            SELECT * FROM orders ORDER BY order_id DESC
        `);

        console.log("📦 ORDERS:");
        console.table(rows);

        // xem chi tiết luôn order_items
        const [items] = await pool.query(`
            SELECT * FROM order_items ORDER BY order_id DESC
        `);

        console.log("📦 ORDER ITEMS:");
        console.table(items);

        process.exit();

    } catch (err) {
        console.error("❌ ERROR:", err.message);
    }
})();