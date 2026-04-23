const pool = require("../config/db");
<<<<<<< HEAD
=======
const Product = require("../models/product.model");
>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78

// GET PRODUCTS
const getProducts = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
<<<<<<< HEAD
=======
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

>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78

// CREATE PRODUCT
const createProduct = async (req, res) => {
  try {
<<<<<<< HEAD
    const { name, price, description, stock, category_id } = req.body;

    await pool.query(
      "INSERT INTO products (name, price, description, stock, category_id) VALUES (?, ?, ?, ?, ?)",
      [name, price, description, stock, category_id]
=======
    const { name, price, stock, category_id } = req.body;

    await pool.query(
      "INSERT INTO products (name, price, stock, category_id) VALUES (?, ?, ?, ?)",
      [name, price, stock, category_id]
>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78
    );

    res.json({ message: "Product created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

<<<<<<< HEAD
module.exports = { getProducts, createProduct };
=======
module.exports = { getProducts, createProduct, getProductById };
>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78
