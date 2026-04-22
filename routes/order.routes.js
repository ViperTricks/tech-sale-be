const express = require('express');
const router = express.Router();

const vnpayController = require('../controllers/vnpay.controller');
const momoController = require('../controllers/momo.controller');
const ordersController = require('../controllers/orders.controller');
router.post('/create-vnpay', vnpayController.createVnpayPayment);
router.post('/create-momo', momoController.createMomoPayment);
router.post("/complete", ordersController.completeOrder);
module.exports = router;