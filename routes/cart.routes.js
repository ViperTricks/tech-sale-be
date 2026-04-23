const express = require("express");
const router = express.Router();
const controller = require("../controllers/cart.controller");
<<<<<<< HEAD

router.get("/", controller.getCart);
router.post("/", controller.addToCart);
router.post("/update", controller.updateQuantity); 
router.delete("/:id", controller.deleteCartItem);
=======
const auth = require("../middleware/auth");

router.get("/", auth, controller.getCart);
router.post("/", auth, controller.addToCart);
router.post("/update", auth, controller.updateQuantity);
router.delete("/:id", auth, controller.deleteCartItem);
>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78

module.exports = router;