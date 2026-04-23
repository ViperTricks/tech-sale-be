const { sql, pool } = require("../config/db");

const Category = {
    getAll: async () => {
        const p = await pool;
        const result = await p.request().query("SELECT * FROM categories");
        return result.recordset;
    },

    getById: async (id) => {
        const p = await pool;
        const result = await p.request()
            .input("id", sql.Int, id)
            .query("SELECT * FROM categories WHERE category_id=@id");
        return result.recordset[0];
    },

    create: async (name) => {
        const p = await pool;
        await p.request()
            .input("name", sql.NVarChar, name)
            .query("INSERT INTO categories (name) VALUES (@name)");
    },

    update: async (id, name) => {
        const p = await pool;
        await p.request()
            .input("id", sql.Int, id)
            .input("name", sql.NVarChar, name)
            .query("UPDATE categories SET name=@name WHERE category_id=@id");
    },

    delete: async (id) => {
        const p = await pool;
        await p.request()
            .input("id", sql.Int, id)
            .query("DELETE FROM categories WHERE category_id=@id");
    }
};

module.exports = Category;