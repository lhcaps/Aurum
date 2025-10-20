const { sql, getPool } = require("../../config/db");

class AdminDashboardService {
  // ✅ Lấy thống kê tổng quan nâng cao
  static async getStats() {
    const pool = await getPool();

    const [
      users,
      orders,
      products,
      vouchers,
      employees,
      stores,
      revenueToday,
      revenueMonth,
      revenueTotal,
      recentOrders,
      topProducts
    ] = await Promise.all([
      pool.request().query("SELECT COUNT(*) AS totalUsers FROM Users"),
      pool.request().query("SELECT COUNT(*) AS totalOrders FROM Orders"),
      pool.request().query("SELECT COUNT(*) AS totalProducts FROM Products"),
      pool.request().query("SELECT COUNT(*) AS totalVouchers FROM Vouchers"),
      pool.request().query("SELECT COUNT(*) AS totalEmployees FROM Employees"),
      pool.request().query("SELECT COUNT(*) AS totalStores FROM Stores"),
      pool.request().query(`
        SELECT ISNULL(SUM(Total),0) AS revenueToday
        FROM Orders
        WHERE CAST(CreatedAt AS DATE) = CAST(GETDATE() AS DATE)
          AND PaymentStatus = 'paid'
      `),
      pool.request().query(`
        SELECT ISNULL(SUM(Total),0) AS revenueMonth
        FROM Orders
        WHERE MONTH(CreatedAt) = MONTH(GETDATE())
          AND YEAR(CreatedAt) = YEAR(GETDATE())
          AND PaymentStatus = 'paid'
      `),
      pool.request().query(`
        SELECT ISNULL(SUM(Total),0) AS revenueTotal
        FROM Orders WHERE PaymentStatus = 'paid'
      `),
      pool.request().query(`
        SELECT TOP 5 Id, CustomerName, Total, PaymentStatus, CreatedAt
        FROM Orders
        ORDER BY CreatedAt DESC
      `),
      pool.request().query(`
        SELECT TOP 5 P.Id, P.Name, SUM(OI.Quantity) AS sold
        FROM OrderItems OI
        JOIN Products P ON P.Id = OI.ProductId
        GROUP BY P.Id, P.Name
        ORDER BY sold DESC
      `)
    ]);

    return {
      totalUsers: users.recordset[0].totalUsers,
      totalOrders: orders.recordset[0].totalOrders,
      totalProducts: products.recordset[0].totalProducts,
      totalVouchers: vouchers.recordset[0].totalVouchers,
      totalEmployees: employees.recordset[0].totalEmployees,
      totalStores: stores.recordset[0].totalStores,
      revenueToday: revenueToday.recordset[0].revenueToday,
      revenueMonth: revenueMonth.recordset[0].revenueMonth,
      revenueTotal: revenueTotal.recordset[0].revenueTotal,
      recentOrders: recentOrders.recordset,
      topProducts: topProducts.recordset
    };
  }
}

module.exports = AdminDashboardService;
