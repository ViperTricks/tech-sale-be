const pool = require("../config/db");

// GET USERS
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// CREATE USER
const createUser = async (req, res) => {
  try {
    const { name, email } = req.body;

    await pool.query(
      "INSERT INTO users (name, email, password_hash) VALUES (?, ?, '123')",
      [name, email]
    );

    res.json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  createUser
};