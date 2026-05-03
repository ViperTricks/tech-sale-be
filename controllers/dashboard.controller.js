// File: controllers/dashboard.controller.js
const pool = require("../config/db");

const getDashboardStats = async (req, res) => {
  try {
    const { range } = req.query; // 'day', 'week', 'month'
    const allowedRanges = new Set(["day", "week", "month"]);

    if (!allowedRanges.has(range)) {
      return res.status(400).json({
        message: "Invalid range. Allowed values are 'day', 'week', or 'month'.",
      });
    }

    // ==========================================
    // 1. HÀM TẠO ĐIỀU KIỆN THỜI GIAN
    // ==========================================
    const getCond = (prefix = "") => {
      const col = prefix ? `${prefix}.created_at` : "created_at";
      if (range === "day")   return `DATE(${col}) = CURDATE()`;
      if (range === "month") return `YEAR(${col}) = YEAR(CURDATE()) AND MONTH(${col}) = MONTH(CURDATE())`;
      return `YEARWEEK(${col}, 1) = YEARWEEK(CURDATE(), 1)`;
    };

    const getPrevCond = (prefix = "") => {
      const col = prefix ? `${prefix}.created_at` : "created_at";
      if (range === "day")   return `DATE(${col}) = DATE_SUB(CURDATE(), INTERVAL 1 DAY)`;
      if (range === "month") return `YEAR(${col}) = YEAR(DATE_SUB(CURDATE(), INTERVAL 1 MONTH)) AND MONTH(${col}) = MONTH(DATE_SUB(CURDATE(), INTERVAL 1 MONTH))`;
      return `YEARWEEK(${col}, 1) = YEARWEEK(DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 1)`;
    };

    const condNormal     = getCond();
    const condAlias      = getCond("o");
    const prevCondNormal = getPrevCond();

    // ==========================================
    // 2. BUILD QUERY DOANH THU
    // ✅ SELECT và GROUP BY dùng CÙNG expression
    // ==========================================
    let revenueQuery = "";
    if (range === "day") {
  revenueQuery = `
    SELECT CONCAT(HOUR(created_at), 'h') AS name,
           SUM(total_price)              AS doanhThu
    FROM orders
    WHERE ${condNormal}
    GROUP BY CONCAT(HOUR(created_at), 'h')
    ORDER BY MIN(created_at)
  `;
} else if (range === "month") {
  revenueQuery = `
    SELECT DATE_FORMAT(created_at, '%d/%m') AS name,
           SUM(total_price)                 AS doanhThu
    FROM orders
    WHERE ${condNormal}
    GROUP BY DATE_FORMAT(created_at, '%d/%m')
    ORDER BY MIN(created_at)
  `;
} else {
  revenueQuery = `
    SELECT DATE_FORMAT(created_at, 'Tuần %u') AS name,
           SUM(total_price)                   AS doanhThu
    FROM orders
    WHERE ${condNormal}
    GROUP BY DATE_FORMAT(created_at, 'Tuần %u')
    ORDER BY MIN(created_at)
  `;
}

    // ==========================================
    // 3. CHẠY TẤT CẢ QUERY SONG SONG
    // ==========================================
    const [
      [[curStats]],
      [[prevStats]],
      [[usersResult]],
      [revenueData],
      [topProductsData],
      [orderStatusData],
      [categoryRevenueData],
    ] = await Promise.all([

      // A. Thống kê kỳ hiện tại
      pool.query(`
        SELECT COUNT(*) as totalOrders,
               COALESCE(SUM(total_price), 0) as totalRevenue
        FROM orders
        WHERE ${condNormal}
      `),

      // B. Thống kê kỳ trước
      pool.query(`
        SELECT COUNT(*) as totalOrders,
               COALESCE(SUM(total_price), 0) as totalRevenue
        FROM orders
        WHERE ${prevCondNormal}
      `),

      // C. Tổng khách hàng
      pool.query(`
        SELECT COUNT(*) as totalUsers
        FROM users
        WHERE role = 'customer'
      `),

      // D. Biểu đồ doanh thu
      pool.query(revenueQuery),

      // E. Top 5 sản phẩm bán chạy
      pool.query(`
        SELECT p.name, SUM(oi.quantity) as banRa
        FROM order_items oi
        JOIN products p ON oi.product_id = p.product_id
        JOIN orders o   ON oi.order_id   = o.order_id
        WHERE ${condAlias}
        GROUP BY p.product_id, p.name
        ORDER BY banRa DESC
        LIMIT 5
      `),

      // F. Trạng thái đơn hàng
      pool.query(`
        SELECT status as name, COUNT(*) as value
        FROM orders
        WHERE ${condNormal}
        GROUP BY status
      `),

      // G. Doanh thu theo danh mục
      pool.query(`
        SELECT c.name as category, SUM(oi.quantity * oi.price) as revenue
        FROM order_items oi
        JOIN products p   ON oi.product_id = p.product_id
        JOIN categories c ON p.category_id = c.category_id
        JOIN orders o     ON oi.order_id   = o.order_id
        WHERE ${condAlias}
        GROUP BY c.category_id, c.name
        ORDER BY revenue DESC
      `),
    ]);

    // ==========================================
    // 4. TÍNH TREND %
    // ==========================================
    const calcTrend = (cur, prev) => {
      if (!prev || prev === 0) return null;
      const pct = (((cur - prev) / prev) * 100).toFixed(1);
      return pct > 0 ? `▲ ${pct}%` : `▼ ${Math.abs(pct)}%`;
    };

    const trendOrder = calcTrend(curStats.totalOrders, prevStats.totalOrders);
    const trendRev   = calcTrend(Number(curStats.totalRevenue), Number(prevStats.totalRevenue));

    // ==========================================
    // 5. FORMAT TRẠNG THÁI ĐƠN HÀNG
    // ==========================================
    const statusMap = {
      completed : "Đã giao",
      pending   : "Đang xử lý",
      confirmed : "Đã xác nhận",
      shipping  : "Đang giao",
      cancelled : "Đã hủy",
    };

    const formattedStatusData = orderStatusData.map((item) => ({
      name : statusMap[item.name] || item.name,
      value: Number(item.value),
    }));

    // ==========================================
    // 6. TRẢ VỀ FRONTEND
    // ==========================================
    return res.status(200).json({
      stats: {
        totalOrders  : curStats.totalOrders         || 0,
        totalUsers   : usersResult.totalUsers        || 0,
        totalRevenue : Number(curStats.totalRevenue) || 0,
        trendOrder,
        trendRev,
      },
      revenueData,
      topProductsData,
      orderStatusData : formattedStatusData,
      categoryRevenue : categoryRevenueData,
    });

  } catch (error) {
    console.error("❌ Lỗi Dashboard:", error.message);
    console.error("SQL:", error.sql || "");

    const errorResponse = {
      message: "Lỗi máy chủ nội bộ",
    };

    if (process.env.NODE_ENV === "development") {
      errorResponse.detail = error.message;
    }

    return res.status(500).json(errorResponse);
  }
};

module.exports = { getDashboardStats };