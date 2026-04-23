const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");

router.get("/", controller.getProducts);
<<<<<<< HEAD
=======
router.get("/:id", controller.getProductById);
>>>>>>> b14ac5994968fa52c2dc1733ed7b6f0964e28b78
router.post("/", controller.createProduct);
module.exports = router;