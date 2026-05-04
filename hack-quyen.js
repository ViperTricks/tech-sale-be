const pool = require("./config/db");

pool.query("UPDATE users SET role = 'admin' WHERE email = 'quangvinh01@gmail.com'", (err, result) => {
  if (err) console.log("Lỗi rồi:", err);
  else console.log("🎉 Xong! Đã up lên Admin!");
  process.exit(); // Chạy xong tự tắt
});