require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");

const app = express();

console.log("🔥 SERVER START:", __filename);

// =======================
// MIDDLEWARE
// =======================
app.use(cors());
app.use(express.json());

// =======================
// DATABASE
// =======================
const pool = require("./config/db");

// =======================
// ROUTES API CHÍNH
// =======================
app.use("/auth", require("./routes/auth.routes"));
app.use("/products", require("./routes/product.routes"));
app.use("/cart", require("./routes/cart.routes"));
app.use("/orders", require("./routes/order.routes"));

// =======================
// HEALTH CHECK
// =======================
app.get("/health", (req, res) => {
  res.send("✅ SERVER OK");
});

// =======================
// CHECK DB STRUCTURE
// =======================
app.get("/check-db", async (req, res) => {
  try {
    const [rows] = await pool.query("DESCRIBE products");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =======================
// ADD STATUS COLUMN (SAFE)
// =======================
app.get("/add-status", async (req, res) => {
  try {
    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN status VARCHAR(20) DEFAULT 'active'
    `);

    res.send("✅ Added status column");
  } catch (err) {
    res.send("❌ " + err.message);
  }
});

// =======================
// DEBUG INFO
// =======================
app.get("/whoami", (req, res) => {
  res.json({
    file: __filename,
    dir: __dirname,
  });
});

// =======================
// TEST USERS
// =======================
app.get("/users-test", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.json(err.message);
  }
});

// =======================
// SET ADMIN (LINH HOẠT)
// =======================
// dùng: /set-admin?email=abc@gmail.com
app.get("/set-admin/:email", async (req, res) => {
  const { email } = req.params;

  try {
    await pool.query(`
      UPDATE users 
      SET role = 'admin' 
      WHERE email = ?
    `, [email]);

    res.send(`Đã set admin cho ${email}`);
  } catch (err) {
    res.send(err.message);
  }
});

// =======================
// REMOVE ADMIN (OPTIONAL)
// =======================
app.get("/remove-admin", async (req, res) => {
  const { email } = req.query;

  if (!email) {
    return res.send("❌ Thiếu email");
  }

  try {
    await pool.query(
      "UPDATE users SET role = 'user' WHERE email = ?",
      [email]
    );

    res.send(`✅ Đã gỡ admin của ${email}`);
  } catch (err) {
    res.send("❌ " + err.message);
  }
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
