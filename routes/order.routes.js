const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

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

// 👉 LẤY DANH SÁCH ĐƠN HÀNG (CẦN AUTH)
router.get("/", auth, ordersController.getOrders);

// 👉 HOÀN TẤT ĐƠN HÀNG
router.post("/complete", auth, ordersController.completeOrder);

module.exports = router;