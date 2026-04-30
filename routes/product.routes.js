const express = require("express");
const router = express.Router();
const controller = require("../controllers/product.controller");
const pool = require("../config/db");

// =======================
// FIX DB (optional)
// =======================
router.get("/fix-db", async (req, res) => {
  try {
    const [columns] = await pool.query(`
      SHOW COLUMNS FROM products LIKE 'status'
    `);

    if (columns.length > 0) {
      return res.send("⚠️ status already exists");
    }

    await pool.query(`
      ALTER TABLE products 
      ADD COLUMN status VARCHAR(20) DEFAULT 'active'
    `);

    res.send("✅ status added");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// =======================
// PRODUCTS
// =======================

// GET (CHỈ LẤY ACTIVE -> FIX LỖI HIỆN LẠI SAU KHI XÓA)
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM products WHERE status = 'active'"
    );

    res.json(rows);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// CREATE
router.post("/", controller.createProduct);

// UPDATE
router.put("/:id", controller.updateProduct);

// SOFT DELETE
router.put("/:id/delete", async (req, res) => {
  try {
    await pool.query(
      "UPDATE products SET status = 'deleted' WHERE product_id = ?",
      [req.params.id]
    );

    res.json({ message: "deleted" });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// DETAIL
router.get("/:id", controller.getProductById);

module.exports = router;
 

