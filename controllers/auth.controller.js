const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Auth = require("../models/auth.model");

const SECRET = process.env.JWT_SECRET;

// ======================
// REGISTER
// ======================
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
      password_hash: hashedPassword,
    });

    res.json({
      message: "Đăng ký thành công",
      userId,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// LOGIN
// ======================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Thiếu email hoặc password" });
    }

    const user = await Auth.findByEmail(email);

    if (!user) {
      return res.status(400).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Sai mật khẩu" });
    }

    const role = user.role || "user";

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role: role,
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
        role: role,
      },
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// GET PROFILE
// ======================
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
      address: user.address,
      role: user.role || "user",
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// UPDATE PROFILE
// ======================
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, phone, address } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Tên không được để trống" });
    }

    await Auth.updateProfile(userId, { name, phone, address });

    res.json({ message: "Cập nhật thành công" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ======================
// 🔥 SET ADMIN (FIX CHUẨN)
// ======================
const setAdminByEmail = async (req, res) => {
  try {
    // 👉 hỗ trợ cả GET (query) và POST (body)
    const email = req.query.email || req.body.email;

    if (!email) {
      return res.status(400).json({ message: "Thiếu email" });
    }

    const result = await Auth.setAdminByEmail(email);

    if (result === 0) {
      return res.status(404).json({ message: "Không tìm thấy user" });
    }

    res.json({
      success: true,
      message: `Đã set admin cho ${email}`,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  setAdminByEmail
};