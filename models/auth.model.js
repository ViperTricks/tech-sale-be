const pool = require("../config/db");

const auth = {
  // ======================
  // FIND BY EMAIL
  // ======================
  findByEmail: async (email) => {
    const [rows] = await pool.query(
      `SELECT 
        user_id,
        name,
        email,
        password_hash,
        phone,
        address,
        role
      FROM users 
      WHERE email = ?`,
      [email]
    );

    return rows[0];
  },

  // ======================
  // CREATE USER
  // ======================
  create: async (data) => {
    const { name, email, password_hash, phone } = data;

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone)
       VALUES (?, ?, ?, ?)`,
      [name, email, password_hash, phone || null]
    );

    return result.insertId;
  },

  // ======================
  // FIND BY ID
  // ======================
  findById: async (id) => {
    const [rows] = await pool.query(
      `SELECT 
        user_id,
        name,
        email,
        phone,
        address,
        role
      FROM users 
      WHERE user_id = ?`,
      [id]
    );

    return rows[0];
  },

  // ======================
  // UPDATE PROFILE
  // ======================
  updateProfile: async (userId, data) => {
    const { name, phone, address } = data;

    const [result] = await pool.query(
      `UPDATE users
       SET name = ?, phone = ?, address = ?
       WHERE user_id = ?`,
      [
        name,
        phone || null,
        address || null,
        userId,
      ]
    );

    return result.affectedRows;
  },

  // 🔥 FIX: PHẢI nằm trong object
  setAdminByEmail: async (email) => {
    const [result] = await pool.query(
      "UPDATE users SET role = 'admin' WHERE email = ?",
      [email]
    );

    return result.affectedRows;
  }
};

module.exports = auth;