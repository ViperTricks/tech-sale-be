const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");

router.get("/", controller.getCart);
router.post("/", controller.addToCart);

module.exports = router;