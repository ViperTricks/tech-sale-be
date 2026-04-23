const pool = require("../config/db");

const Product = {
    // LẤY TẤT CẢ
    getAll: async () => {
        const [rows] = await pool.query(`
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.category_id
    `);
        return rows;
    },

    // LẤY CHI TIẾT
    getById: async (id) => {
        const [rows] = await pool.query(
            `SELECT p.*, c.name AS category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.category_id
       WHERE p.product_id = ?`,
            [id]
        );
        return rows[0]; // trả về 1 object
    },

    // TẠO PRODUCT
    create: async (data) => {
        const { name, description, price, stock, image_url, category_id } = data;

        const [result] = await pool.query(
            `INSERT INTO products
       (name, description, price, stock, image_url, category_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, description, price, stock, image_url, category_id]
        );

        return result.insertId;
    },

    // UPDATE
    update: async (id, data) => {
        const { name, description, price, stock, image_url, category_id } = data;

        await pool.query(
            `UPDATE products SET
        name = ?,
        description = ?,
        price = ?,
        stock = ?,
        image_url = ?,
        category_id = ?
       WHERE product_id = ?`,
            [name, description, price, stock, image_url, category_id, id]
        );
    },

    // DELETE
    delete: async (id) => {
        await pool.query(
            "DELETE FROM products WHERE product_id = ?",
            [id]
        );
    },
};

module.exports = Product;