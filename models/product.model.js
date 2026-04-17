const { sql, pool } = require("../config/db");
const { update } = require("../controllers/product.controller");

const Product = {
    getAll: async () => {
        const p = await pool;
        const result = await p.request().query(`
            SELECT p.*, c.name AS category_name
            FROM products p
            JOIN categories c ON p.category_id = c.category_id
        `);
        return result.recordset;
    },

    getById: async (id) => {
        const p = await pool;
        const result = await p.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM products WHERE product_id=@id");
        return result.recordset[0];
    },

    create: async (data) => {
        const p = await pool;

        await p.request()
            .input("name", sql.NVarChar, data.name)
            .input("description", sql.NVarChar, data.description)
            .input("price", sql.Decimal(12, 2), data.price)
            .input("stock", sql.Int, data.stock)
            .input("image_url", sql.NVarChar, data.image_url)
            .input("category_id", sql.Int, data.category_id)
            .query(`
                INSERT INTO products
                (name, description, price, stock, image_url, category_id)
                VALUES (@name, @description, @price, @stock, @image_url, @category_id)
            `);
    },

    update: async (id, data) => {
        const p = await pool;

        let query = `
            UPDATE products SET
            name=@name,
            description=@description,
            price=@price,
            stock=@stock,
            category_id=@category_id
        `;

        if (data.image_url) query += ", image_url=@image_url";

        query += " WHERE product_id=@id";

        const request = p.request();

        request.input("id", sql.Int, id);
        request.input("name", sql.NVarChar, data.name);
        request.input("description", sql.NVarChar, data.description);
        request.input("price", sql.Decimal(12, 2), data.price);
        request.input("stock", sql.Int, data.stock);
        request.input("category_id", sql.Int, data.category_id);

        if (data.image_url) {
            request.input("image_url", sql.NVarChar, data.image_url);
        }

        await request.query(query);
    },

    delete: async (id) => {
        const p = await pool;
        await p.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM products WHERE product_id=@id");
    }
};

module.exports = Product;