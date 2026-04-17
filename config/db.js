const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config({ path: path.join(process.cwd(), '.env') });

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 20000,
    ssl: {
        rejectUnauthorized: true,
        ca: fs.readFileSync(path.join(process.cwd(), 'ca.pem')),
        key: fs.readFileSync(path.join(process.cwd(), 'key.pem')),
        cert: fs.readFileSync(path.join(process.cwd(), 'cert.pem')),
    },
});

(async () => {
    try {
        console.log(`--- Đang kết nối tới DB: ${process.env.DB_DATABASE} ---`);
        const connection = await pool.getConnection();
        console.log('✅ Connected to Aiven MySQL thành công!');
        connection.release();
    } catch (err) {
        console.error('❌ Lỗi hệ thống:', err.message);
    }
})();

module.exports = pool;
