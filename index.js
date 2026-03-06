const express = require("express");

const app = express();
const port = 3000;

// route trang chủ
app.get("/", (req, res) => {
  res.send("Backend API is running");
});

// route users
const axios = require("axios");

app.get("/users", async (req, res) => {
  try {
    const response = await axios.get(
      "https://69aa70bbe051e9456fa157d1.mockapi.io/users"
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy dữ liệu" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});