const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");

router.get("/", controller.getCart);
router.post("/", controller.addToCart);
router.post("/update", controller.updateQuantity); 
router.delete("/:id", controller.deleteCartItem);

module.exports = router;