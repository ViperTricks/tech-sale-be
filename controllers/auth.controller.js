const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/auth.model");

const SECRET = process.env.JWT_SECRET;


// REGISTER
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    const existingUser = await Auth.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userId = await Auth.create({
      name,
      email,
      password_hash: hashedPassword, // ✔️ đúng DB
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

    const user = await Auth.findByEmail(email);
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
        phone: user.phone,
        address: user.address
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
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// GET PROFILE
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await Auth.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// UPDATE PROFILE
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address } = req.body;

    // validate đơn giản
    if (!name) {
      return res.status(400).json({ message: "Tên không được để trống" });
    }

    await Auth.updateProfile(userId, { name, phone, address });

    res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
module.exports = { register, login, getProfile, updateProfile };