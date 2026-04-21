const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const SECRET = process.env.JWT_SECRET;


// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await User.create({
      name,
      email,
      password_hash: hashedPassword, // ✔️ đúng DB
      phone,
    });

    res.json({
      message: "Đăng ký thành công",
      userId,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// LOGIN (FIX CHUẨN)
const login = async (req, res) => {
  try {
    const { email, password } = req.body; // ✔️ sửa lại

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    // ✔️ so password thường với hash
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
      },
      SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Đăng nhập thành công",
      token,
      user: {
        id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { register, login };