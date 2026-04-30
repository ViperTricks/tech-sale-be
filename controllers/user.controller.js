const pool = require("../config/db");
const bcrypt = require("bcrypt");

// ======================
// GET USERS
// ======================
const getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// CREATE USER
// ======================
const createUser = async (req, res) => {
  try {
    let { name, email, phone, role, address, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    if (password.trim().length < 6) {
      return res.status(400).json({
        message: "Mật khẩu phải >= 6 ký tự"
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (name,email,phone,role,address,password_hash,status)
       VALUES (?,?,?,?,?,?,?,'active')`,
      [
        name,
        email,
        phone || "",
        role || "customer",
        address || "",
        hashed
      ]
    );

    res.json({ message: "User created" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// UPDATE USER (FIX TRIỆT ĐỂ)
// ======================
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, email, phone, role, address, password, status } = req.body;

    if (!name || !email) {
      return res.status(400).json({ message: "Thiếu dữ liệu" });
    }

    phone = phone || "";
    role = role || "customer";
    address = address || "";

    const allowed = ["active", "suspended", "deleted"];
    status = allowed.includes(status) ? status : "active";

    let sql, params;

    // ======================
    // CÓ PASSWORD
    // ======================
    if (typeof password === "string" && password.trim() !== "") {

      if (password.trim().length < 6) {
        return res.status(400).json({
          message: "Mật khẩu phải >= 6 ký tự"
        });
      }

      const hashed = await bcrypt.hash(password, 10);

      sql = `
        UPDATE users 
        SET name=?, email=?, phone=?, role=?, address=?, password_hash=?, status=?, updated_at=NOW()
        WHERE user_id=?
      `;

      params = [
        name,
        email,
        phone,
        role,
        address,
        hashed,
        status,
        id
      ];

    } 
    // ======================
    // KHÔNG PASSWORD
    // ======================
    else {
      sql = `
        UPDATE users 
        SET name=?, email=?, phone=?, role=?, address=?, status=?, updated_at=NOW()
        WHERE user_id=?
      `;

      params = [name, email, phone, role, address, status, id];
    }

    await pool.query(sql, params);

    res.json({ message: "Update success" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// DELETE USER
// ======================
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "UPDATE users SET status='deleted' WHERE user_id=?",
      [id]
    );

    res.json({ message: "Deleted" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};