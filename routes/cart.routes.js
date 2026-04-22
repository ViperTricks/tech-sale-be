const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");
const auth = require("../middleware/auth");

router.get("/", auth, controller.getCart);
router.post("/", auth, controller.addToCart);
router.post("/update", auth, controller.updateQuantity);
router.delete("/:id", auth, controller.deleteCartItem);

module.exports = router;