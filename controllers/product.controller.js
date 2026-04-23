const pool = require("../config/db");
const Product = require("../models/product.model");

// GET PRODUCTS
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET DETAIL
const getProductById = async (req, res) => {
  try {
    const product = await Product.getById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
    const { name, price, description, stock, category_id } = req.body;

    await pool.query(
      "INSERT INTO products (name, price, description, stock, category_id) VALUES (?, ?, ?, ?, ?)",
      [name, price, description, stock, category_id]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProducts, createProduct, getProductById };
