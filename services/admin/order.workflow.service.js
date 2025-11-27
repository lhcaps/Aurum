const { sql, getPool } = require("../../config/db");

class WorkflowService {
  async updateStatus(orderId, status) {
    const pool = await getPool();

    await pool.request()
      .input("orderId", orderId)
      .input("status", status)
      .query(`
        UPDATE Orders
        SET Status = @status
        WHERE Id = @orderId
      `);

    return { orderId, status };
  }

  async autoDeductIngredients(orderId) {
    const pool = await getPool();
    await pool.request()
      .input("orderId", orderId)
      .query("EXEC AutoDeductIngredients @orderId");
  }

  async getBaristaOrders(storeId) {
    const pool = await getPool();

    const rs = await pool.request()
      .input("storeId", storeId)
      .query(`
        SELECT 
          o.Id,
          o.OrderNumber,
          o.Total,
          o.Status,
          o.CreatedAt,

          od.Id AS DetailId,
          od.Quantity,
          od.UnitPrice,

          p.Name AS ProductName,
          -- od.SizeName AS SizeName, -- nếu trong OrderDetails có field này thì dùng

          (
            SELECT t.Name
            FROM OrderToppings ot
            JOIN Toppings t ON ot.ToppingId = t.Id
            WHERE ot.OrderDetailId = od.Id
            FOR JSON PATH
          ) AS Toppings

        FROM Orders o
        JOIN OrderDetails od ON o.Id = od.OrderId
        JOIN Products p ON od.ProductId = p.Id
        -- JOIN ProductSizes s ON od.SizeId = s.Id  -- ❌ BỎ ĐI

        WHERE o.Status IN ('waiting', 'preparing', 'brewing')
          AND (@storeId IS NULL OR o.StoreId = @storeId)

        ORDER BY o.CreatedAt DESC
      `);

    const raw = rs.recordset;
    const orders = {};

    raw.forEach(r => {
      if (!orders[r.Id]) {
        orders[r.Id] = {
          id: r.Id,
          orderNumber: r.OrderNumber,
          total: r.Total,
          status: r.Status.toLowerCase(),
          createdAt: r.CreatedAt,
          items: []
        };
      }

      orders[r.Id].items.push({
        name: r.ProductName,
        size: null, // hoặc r.SizeName nếu bạn có cột này
        quantity: r.Quantity,
        price: r.UnitPrice,
        toppings: r.Toppings
          ? JSON.parse(r.Toppings).map(t => t.Name)
          : []
      });
    });

    return Object.values(orders);
  }
}

module.exports = new WorkflowService();
