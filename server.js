const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());


// dữ liệu user
const users = [
  { id: 1, name: "Nguyen Van A" },
  { id: 2, name: "Tran Thi B" },
  { id: 3, name: "Le Van C" }
];

// API lấy tất cả users
app.get("/users", (req, res) => {
  res.json(users);
});

// API lấy user theo id
app.get("/users/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const user = users.find(u => u.id === id);

  if (!user) {
    return res.status(404).json({ message: "User không tồn tại" });
  }

  res.json(user);
});

app.listen(PORT, () => {
  console.log(`Server chạy tại port ${PORT}`);
});
