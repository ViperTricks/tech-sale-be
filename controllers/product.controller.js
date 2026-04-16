const pool = require("../config/db");

// GET PRODUCTS
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, price, stock, category_id } = req.body;

    await pool.query(
      "INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)",
      [name, price, stock, category_id]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, createProduct };