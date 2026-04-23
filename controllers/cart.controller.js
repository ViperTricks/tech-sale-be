const pool = require("../config/db");

const getCartId = async (user_id) => {
  const [rows] = await pool.query(
    "SELECT cart_id FROM carts WHERE user_id = ? LIMIT 1",
    [user_id]
  );

  return rows.length ? rows[0].cart_id : null;
};

// ✅ tạo cart nếu chưa có
const getOrCreateCartId = async (user_id) => {
  const cart_id = await getCartId(user_id);

  if (cart_id) return cart_id;

  const [result] = await pool.query(
    "INSERT INTO carts (user_id) VALUES (?)",
    [user_id]
  );

  return result.insertId;
};
// 1. LẤY GIỎ HÀNG
exports.getCart = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Chưa đăng nhập" });
    }

    const user_id = req.user.userId;
    const cart_id = await getCartId(user_id);

    // ✅ nếu chưa có cart → trả về giỏ rỗng
    if (!cart_id) {
      return res.json([]);
    }

    const [rows] = await pool.query(`
      SELECT
        cart_item_id, product_id, name, image_url, price, quantity,
        (price * quantity) as total_price
      FROM cart_items
      WHERE cart_id = ?
    `, [cart_id]);

    res.json(rows);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
//2. THÊM VÀO GIỎ HÀNG
exports.addToCart = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { product_id, quantity = 1 } = req.body;

    if (!product_id) {
      return res.status(400).json({ error: "Thiếu product_id" });
    }

    const cart_id = await getOrCreateCartId(user_id);

    // check đã có sản phẩm chưa
    const [existing] = await pool.query(
      "SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?",
      [cart_id, product_id]
    );

    if (existing.length > 0) {
      await pool.query(
        "UPDATE cart_items SET quantity = quantity + ? WHERE cart_item_id = ?",
        [quantity, existing[0].cart_item_id]
      );
      return res.json({ message: "Cập nhật số lượng thành công" });
    }

    // lấy info product
    const [product] = await pool.query(
      "SELECT name, price, image_url FROM products WHERE product_id = ?",
      [product_id]
    );

    if (product.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy sản phẩm" });
    }

    await pool.query(
      `INSERT INTO cart_items
      (cart_id, product_id, name, image_url, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cart_id,
        product_id,
        product[0].name,
        product[0].image_url,
        product[0].price,
        quantity,
      ]
    );

    res.json({ message: "Thêm vào giỏ hàng thành công" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// 3. CẬP NHẬT SỐ LƯỢNG
exports.updateQuantity = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { product_id, change } = req.body;

    if (!product_id || !change) {
      return res.status(400).json({ error: "Thiếu dữ liệu" });
    }

    const cart_id = await getCartId(user_id);

    if (!cart_id) {
      return res.status(404).json({ error: "Giỏ hàng chưa tồn tại" });
    }

    // update số lượng
    await pool.query(
      "UPDATE cart_items SET quantity = quantity + ? WHERE product_id = ? AND cart_id = ?",
      [change, product_id, cart_id]
    );

    // nếu <= 0 thì xoá
    await pool.query(
      "DELETE FROM cart_items WHERE quantity <= 0 AND cart_id = ?",
      [cart_id]
    );

    res.json({ message: "Cập nhật thành công" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. XÓA MỤC
exports.deleteCartItem = async (req, res) => {
  try {
    const user_id = req.user.userId;
    const { id } = req.params;

    const cart_id = await getCartId(user_id);

    if (!cart_id) {
      return res.status(404).json({ error: "Giỏ hàng không tồn tại" });
    }

    const [result] = await pool.query(
      "DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?",
      [id, cart_id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Không tìm thấy item" });
    }

    res.json({ message: "Xoá thành công" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};