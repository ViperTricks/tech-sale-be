<<<<<<< HEAD
const express = require('express');
const router = express.Router();

const vnpayController = require('../controllers/vnpay.controller');
const momoController = require('../controllers/momo.controller');
const ordersController = require('../controllers/orders.controller');
router.post('/create-vnpay', vnpayController.createVnpayPayment);
router.post('/create-momo', momoController.createMomoPayment);
router.post("/complete", ordersController.completeOrder);
=======
const express = require("express");
const router = express.Router();
const controller = require("../controllers/order.controller");

router.get("/", controller.getOrders);
router.post("/", controller.createOrder);

>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78
module.exports = router;