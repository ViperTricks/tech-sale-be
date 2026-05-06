const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller.js');

// Dẹp luôn cái hàm requireAuth ngáo ngơ kia đi
// Chạy thẳng vô lấy data luôn cho giống mấy trang kia
router.get('/', getDashboardStats);

module.exports = router;