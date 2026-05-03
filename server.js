require("dotenv").config({ override: true });
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());

const pool = require("./config/db");

const productRoutes = require("./routes/product.routes");
const cartRoutes = require("./routes/cart.routes");
const authRoutes = require("./routes/auth.routes");
const orderRoutes = require("./routes/order.routes");
const userRoutes = require("./routes/user.routes");
const dashboardRoutes = require("./routes/dashboard.routes");

app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);
app.use("/users", userRoutes);
app.use("/dashboard", dashboardRoutes);


app.get("/kiemtra", (req, res) => {
  res.send("<h1>Server OK - Backend running</h1>");
});


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at port ${PORT}`);
});
