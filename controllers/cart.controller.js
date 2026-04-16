const pool = require("../config/db");

// GET CART
const getCart = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM cart_items");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ADD TO CART
const addToCart = async (req, res) => {
  try {
    const { cart_id, product_id, quantity } = req.body;

    await pool.query(
      "INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)",
      [cart_id, product_id, quantity]
    );

    res.json({ message: "Added to cart" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getCart, addToCart };