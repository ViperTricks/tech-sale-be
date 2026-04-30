const express = require("express");
const router = express.Router();

const vnpayController = require("../controllers/vnpay.controller");
const momoController = require("../controllers/momo.controller");
const ordersController = require("../controllers/orders.controller");

// ======================
// PAYMENT ROUTES
// ======================
router.post("/create-vnpay", vnpayController.createVnpayPayment);
router.post("/create-momo", momoController.createMomoPayment);

// ======================
// ORDERS ROUTES
// ======================

// 👉 LẤY DANH SÁCH ĐƠN HÀNG (QUAN TRỌNG)
router.get("/", async (req, res) => {
  try {
    const orders = await ordersController.getAllOrders?.();

    // fallback an toàn nếu controller chưa viết
    if (!orders) return res.json([]);

    return res.json(orders);
  } catch (err) {
    return res.status(500).json([]);
  }
});

// 👉 TẠO / HOÀN TẤT ORDER
router.post("/complete", ordersController.completeOrder);

module.exports = router;