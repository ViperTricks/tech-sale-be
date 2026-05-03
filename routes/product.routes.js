const express=require("express");
const router=express.Router();
const controller=require("../controllers/product.controller");
const pool=require("../config/db");

// FIX DB
router.get("/fix-db",async(req,res)=>{
try{
const [columns]=await pool.query(`SHOW COLUMNS FROM products LIKE 'status'`);
if(columns.length>0)return res.send("status already exists");

await pool.query(`ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT 'active'`);
res.send("status added");
}catch(err){
res.status(500).send(err.message);
}
});

// PRODUCTS
router.get("/",controller.getProducts);
router.post("/",controller.createProduct);
router.put("/:id",controller.updateProduct);
router.put("/:id/delete",controller.softDeleteProduct);
router.get("/:id",controller.getProductById);

module.exports=router;