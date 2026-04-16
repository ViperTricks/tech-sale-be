const pool = require("../config/db");

// GET ORDERS
const getOrders = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE ORDER
const createOrder = async (req, res) => {
  try {
    const { user_id, shipping_address, phone } = req.body;

    await pool.query(
      "INSERT INTO orders (user_id, shipping_address, phone) VALUES (?, ?, ?)",
      [user_id, shipping_address, phone]
    );

    res.json({ message: "Order created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getOrders, createOrder };