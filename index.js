const express = require("express");
const cors = require("cors");
const path = require("path"); // Thêm module path để xử lý đường dẫn file

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Thêm trường email vào data mẫu để khớp với Frontend
let users = [
  { id: 1, name: "Nguyen Van A", email: "nva@gmail.com" },
  { id: 2, name: "Tran Thi B", email: "ttb@gmail.com" },
  { id: 3, name: "Le Van C", email: "lvc@gmail.com" }
];

// Lấy danh sách users (GET)
app.get("/users", (req, res) => {
  res.json(users);
});

// Lấy user theo id (GET)
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);
  res.json(user);
});

// Thêm user (POST)
app.post("/users", (req, res) => {
  const newUser = {
    id: Date.now(), // Dùng Date.now() để ID không bị trùng khi xóa đi thêm lại
    name: req.body.name,
    email: req.body.email // Nhận thêm email
  };

  users.push(newUser);
  res.json(newUser);
});

// Sửa user (PUT)
app.put("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (user) {
    user.name = req.body.name;
    user.email = req.body.email; // Cập nhật thêm email
  }

  res.json(user);
});

// Xóa user (DELETE)
app.delete("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  users = users.filter(u => u.id !== id);

  res.json({ message: "User deleted" });
});

// --- PHẦN CẤU HÌNH PHỤC VỤ FRONTEND ---

// 1. Chỉ định thư mục chứa các file tĩnh (HTML, CSS, JS) là thư mục 'dist'
app.use(express.static(path.join(__dirname, "dist")));

// 2. Catch-all route: Bất kỳ request nào KHÔNG phải là API thì sẽ trả về file index.html của React.
// Điều này rất quan trọng để React Router (nếu sau này bạn dùng) hoạt động mà không bị lỗi 404 khi người dùng F5 tải lại trang.
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

// ---------------------------------------

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});