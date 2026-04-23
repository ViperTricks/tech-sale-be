const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express(); // Khởi tạo app trước khi sử dụng
const port = process.env.PORT || 3000;

// 1. Cấu hình Middleware
app.use(cors());
app.use(express.json());

// 2. Chỉ định thư mục chứa các file tĩnh (Frontend đã build)
// Phải khai báo sau khi đã khởi tạo 'app'
app.use(express.static(path.join(__dirname, "dist")));

// Dữ liệu mẫu
let users = [
  { id: 1, name: "Nguyen Van A", email: "nva@gmail.com" },
  { id: 2, name: "Tran Thi B", email: "ttb@gmail.com" },
  { id: 3, name: "Le Van C", email: "lvc@gmail.com" }
];

// --- 3. CÁC ROUTE API (Đặt trên cùng để tránh bị route '*' đè lên) ---

// Lấy danh sách users
app.get("/users", (req, res) => {
  res.json(users);
});

// Lấy user theo id
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Thêm user
let currentId = users.length
  ? Math.max(...users.map(u => u.id))
  : 0;

app.post("/users", (req, res) => {
  currentId++;

  const newUser = {
    id: currentId,
    name: req.body.name,
    email: req.body.email
  };

  users.push(newUser);
  res.json(newUser);
});

// Sửa user
app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (user) {
    user.name = req.body.name;
    user.email = req.body.email;
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
});

// Xóa user
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter(u => u.id !== id);
  res.json({ message: "User deleted" });
});

// --- 4. CẤU HÌNH PHỤC VỤ FRONTEND (Catch-all route) ---
// Route này phải luôn nằm cuối cùng của các app.get
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// Khởi chạy Server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});