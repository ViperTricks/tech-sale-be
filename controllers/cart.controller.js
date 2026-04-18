const pool = require("../config/db");

// 1. LẤY GIỎ HÀNG
exports.getCart = async (req, res) => {
  try {
    const [rows] = await pool.execute(`
            SELECT
                cart_item_id, product_id, name, image_url, price, quantity,
                (price * quantity) as total_price
            FROM cart_items
            WHERE cart_id = 1
        `);
    res.json(rows);
  } catch (error) {
    console.error("Lỗi GET CART:", error.message);
    res.status(500).json({ error: error.message });
  }
};
exports.addToCart = async (req, res) => {
  try {
    const { cart_id, product_id, quantity } = req.body;
    if (!product_id) return res.status(400).json({ error: "Missing product_id" });

    const [existing] = await pool.query(
      "SELECT cart_item_id FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cart_id || 1, Number(product_id)]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?",
        [Number(quantity || 1), existing[0].cart_item_id]
      );
      return res.json({ message: "Updated" });
    }

    const [product] = await pool.query(
      "SELECT name, price, image_url FROM products WHERE product_id = ?",
      [product_id]
    );

    // ĐÂY LÀ CHỖ GÂY LỖI 500: Phải check độ dài mảng
    if (!product || product.length === 0) {
      return res.status(404).json({ error: "Product not found" });
    }

    await pool.query(
      "INSERT INTO cart_items (cart_id, product_id, name, image_url, price, quantity) VALUES (?, ?, ?, ?, ?, ?)",
      [cart_id || 1, product_id, product[0].name, product[0].image_url, product[0].price, Number(quantity || 1)]
    );

    res.json({ message: "Added" });
  } catch (err) {
    console.error(err); // Xem lỗi cụ thể ở terminal nodejs
    res.status(500).json({ error: err.message });
  }
};
// 3. CẬP NHẬT SỐ LƯỢNG
exports.updateQuantity = async (req, res) => {
  const { product_id, change } = req.body;
  try {
    await pool.execute(
      "UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ? AND cart_id = 1",
      [change, product_id]
    );
    await pool.execute("DELETE FROM cart_items WHERE quantity <= 0");
    res.json({ message: "Updated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. XÓA MỤC
exports.deleteCartItem = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.execute("DELETE FROM cart_items WHERE cart_item_id = ?", [id]);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};