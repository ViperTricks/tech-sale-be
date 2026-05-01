// File: routes/dashboard.routes.js

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller.js');

// Định nghĩa API: GET http://localhost:3000/api/dashboard
router.get('/', getDashboardStats);

module.exports = router;