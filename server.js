const express = require("express");
const axios = require("axios");
const cors = require("cors");

const app = express();
app.use(cors());

const PORT = 3000;

// API lấy users từ MockAPI
app.get("/users", async (req, res) => {
  try {
    const response = await axios.get(
      " "
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
  }
});

app.listen(PORT, () => {
  console.log("Server chạy tại http://localhost:3000");
});