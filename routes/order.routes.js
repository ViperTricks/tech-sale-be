const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const vnpayController = require('../controllers/vnpay.controller');
const momoController = require('../controllers/momo.controller');
const ordersController = require('../controllers/orders.controller');

// Thanh toán
router.post('/create-vnpay', vnpayController.createVnpayPayment);
router.post('/create-momo', momoController.createMomoPayment);

// Hoàn tất đơn hàng: Cần middleware 'auth' để lấy thông tin user xóa giỏ
router.post("/complete", auth, ordersController.completeOrder);

// Lấy danh sách: Nên dùng '/' vì app.use("/orders") đã có tiền tố rồi
router.get("/", auth, ordersController.getOrders);

module.exports = router;