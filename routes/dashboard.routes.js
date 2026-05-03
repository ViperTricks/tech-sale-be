// File: routes/dashboard.routes.js

const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboard.controller.js');

function requireAuth(req, res, next) {
    if (typeof req.isAuthenticated === 'function' && req.isAuthenticated()) {
        return next();
    }

    if (req.user) {
        return next();
    }

    return res.status(401).json({ message: 'Unauthorized' });
}

// Định nghĩa API: GET http://localhost:3000/api/dashboard
router.get('/', requireAuth, getDashboardStats);

module.exports = router;