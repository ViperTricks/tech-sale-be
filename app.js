const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/categories", require("./routes/category.routes"));
app.use("/api/products", require("./routes/product.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
// ✅ Render sẽ cấp PORT
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server chạy cổng ${PORT}`);
});