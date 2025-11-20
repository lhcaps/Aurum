const { sql, getPool } = require("../../config/db");

class OrderWorkflowService {

  async updateStatus(orderId, status) {
    const pool = await getPool();

    // Cập nhật trạng thái đơn
    await pool.request()
      .input("Id", sql.Int, orderId)
      .input("Status", sql.NVarChar(50), status)
      .query(`
        UPDATE Orders
        SET Status = @Status
        WHERE Id = @Id
      `);

    // Ghi vào lịch sử trạng thái
    await pool.request()
      .input("OrderId", sql.Int, orderId)
      .input("NewStatus", sql.NVarChar(50), status)
      .query(`
        INSERT INTO OrderHistory (OrderId, NewStatus)
        VALUES (@OrderId, @NewStatus)
      `);

    return true;
  }

  // Tự động trừ kho nguyên liệu khi hoàn thành đơn
  async autoDeductIngredients(orderId) {
    const pool = await getPool();

    // Lấy danh sách sản phẩm trong đơn
    const items = await pool.request()
      .input("OrderId", sql.Int, orderId)
      .query(`
        SELECT ProductId, Quantity
        FROM OrderDetails
        WHERE OrderId = @OrderId
      `);

    for (const item of items.recordset) {
      const recipe = await pool.request()
        .input("ProductId", sql.Int, item.ProductId)
        .query(`
          SELECT IngredientId, Amount
          FROM DrinkRecipes
          WHERE ProductId = @ProductId
        `);

      for (const ing of recipe.recordset) {
        await pool.request()
          .input("IngredientId", sql.Int, ing.IngredientId)
          .input("Used", sql.Float, ing.Amount * item.Quantity)
          .query(`
            UPDATE Inventory
            SET Stock = Stock - @Used
            WHERE IngredientId = @IngredientId
          `);
      }
    }

    return true;
  }
}

module.exports = new OrderWorkflowService();
