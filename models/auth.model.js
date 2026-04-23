const pool = require("../config/db");

const auth = {
    // tìm theo email
    findByEmail: async (email) => {
        const [rows] = await pool.query(
            "SELECT * FROM users WHERE email = ?",
            [email]
        );
        return rows[0];
    },

    // tạo user
    create: async (data) => {
        const { name, email, password_hash, phone } = data;

        const [result] = await pool.query(
            `INSERT INTO users (name, email, password_hash, phone)
       VALUES (?, ?, ?, ?)`,
            [name, email, password_hash, phone]
        );

        return result.insertId;
    },

    // tìm theo id (dùng sau này)
    findById: async (id) => {
        const [rows] = await pool.query(
            "SELECT user_id, name, email, phone FROM users WHERE user_id = ?",
            [id]
        );
        return rows[0];
    },
};


module.exports = auth;