require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const app = express();

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
// ROUTES
// =======================
const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const userRoutes = require("./routes/user.routes");

// mount routes
const userRoutes = require("./routes/user.routes"); 
const dashboardRoutes = require("./routes/dashboard.routes");

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);

// =======================
// HEALTH CHECK
// =======================
app.get("/health", (req, res) => {
  res.send("✅ SERVER OK");
});

// =======================
// SIMPLE TEST ROUTE
// =======================
app.use("/dashboard", dashboardRoutes);

app.get("/kiemtra", (req, res) => {
  res.send("<h1>Server OK - Backend running</h1>");
});

// =======================
// DB CHECK (DEV ONLY)
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
// WHO AM I DEBUG
// =======================
app.get("/whoami", (req, res) => {
  res.json({
    file: __filename,
    dir: __dirname,
  });
});

// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
// start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});