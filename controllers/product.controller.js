const pool=require("../config/db");
const Product=require("../models/product.model");

// GET PRODUCTS
const getProducts=async(req,res)=>{
try{
const [rows]=await pool.query("SELECT * FROM products WHERE status='active'");
res.json(rows);
}catch(err){
res.status(500).json({error:err.message});
}
};

// GET DETAIL
const getProductById=async(req,res)=>{
try{
const product=await Product.getById(req.params.id);
if(!product)return res.status(404).json({message:"Không tìm thấy sản phẩm"});
res.json(product);
}catch(err){
res.status(500).json({error:err.message});
}
};

// CREATE
const createProduct=async(req,res)=>{
try{
const{name,price,description,stock,category_id,image_url}=req.body;

await pool.query(
`INSERT INTO products(name,price,description,stock,category_id,image_url,status)
VALUES (?,?,?,?,?,?,?)`,
[
name,
price,
description||"",
stock||0,
category_id||1,
image_url||"https://via.placeholder.com/150",
"active"
]
);

res.json({message:"Product created"});
}catch(err){
res.status(500).json({error:err.message});
}
};

// SOFT DELETE
const softDeleteProduct=async(req,res)=>{
try{
await pool.query(
"UPDATE products SET status='deleted' WHERE product_id=?",
[req.params.id]
);
res.json({message:"Đã xoá mềm"});
}catch(err){
res.status(500).json({error:err.message});
}
};

// UPDATE
const updateProduct=async(req,res)=>{
try{
const{id}=req.params;
const{name,price,image_url,stock,description,category_id}=req.body;

const[result]=await pool.query(
`UPDATE products 
SET name=?,price=?,image_url=?,stock=?,description=?,category_id=?
WHERE product_id=? AND status='active'`,
[name,price,image_url,stock,description,category_id,id]
);

if(result.affectedRows===0){
return res.status(404).json({message:"Không tìm thấy sản phẩm"});
}

res.json({message:"Update success"});
}catch(err){
res.status(500).json({error:err.message});
}
};

module.exports={
getProducts,
createProduct,
getProductById,
softDeleteProduct,
updateProduct
};