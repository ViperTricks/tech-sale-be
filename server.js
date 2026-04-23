require('dotenv').config({ override: true });
  const express = require("express");
  const cors = require("cors");

  const app = express();

  // middleware
  app.use(cors());
  app.use(express.json());

  // routes
  const productRoutes = require("./routes/product.routes");
  const cartRoutes = require("./routes/cart.routes");
  const userRoutes = require("./routes/user.routes");

  app.use("/users", userRoutes);
  app.use("/products", productRoutes);
  app.use("/cart", cartRoutes);
  app.get("/kiemtra", (req, res) => {
    res.send("<h1>Chào Nguyễn! Server đã nhận code mới rồi nhé!</h1>");
  });
  const orderRoutes = require("./routes/order.routes");
  app.use("/orders", orderRoutes);
  // start server
  app.listen(3000, () => {
    console.log("Server running at http://localhost:3000");
  });
