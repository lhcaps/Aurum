const { sql, getPool } = require("../../config/db");

class AdminToppingController {
  static async getAll(req, res) {
    try {
      const pool = await getPool();
      const result = await pool.request().query(`
        SELECT Id, Name, Category, Price, Unit, Supplier, Quantity, MinStock,
               FORMAT(LastUpdated, 'yyyy-MM-dd') AS LastUpdated
        FROM Toppings
        ORDER BY LastUpdated DESC
      `);
      res.json({ ok: true, data: result.recordset });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  static async addItem(req, res) {
    try {
      const { name, price, unit, supplier, quantity, minStock } = req.body;
      const pool = await getPool();
      await pool.request()
        .input("Name", sql.NVarChar, name)
        .input("Price", sql.Decimal(18, 2), price ?? 0)
        .input("Unit", sql.NVarChar, unit)
        .input("Supplier", sql.NVarChar, supplier)
        .input("Quantity", sql.Decimal(10, 2), quantity ?? 0)
        .input("MinStock", sql.Decimal(10, 2), minStock ?? 0)
        .query(`
          INSERT INTO Toppings (Name, Price, Unit, Supplier, Quantity, MinStock)
          VALUES (@Name, @Price, @Unit, @Supplier, @Quantity, @MinStock)
        `);
      res.json({ ok: true, message: "Đã thêm topping mới" });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  static async updateItem(req, res) {
    try {
      const { id } = req.params;
      const { name, price, unit, supplier, quantity, minStock } = req.body;
      const pool = await getPool();
      await pool.request()
        .input("Id", sql.Int, id)
        .input("Name", sql.NVarChar, name)
        .input("Price", sql.Decimal(18, 2), price)
        .input("Unit", sql.NVarChar, unit)
        .input("Supplier", sql.NVarChar, supplier)
        .input("Quantity", sql.Decimal(10, 2), quantity)
        .input("MinStock", sql.Decimal(10, 2), minStock)
        .query(`
          UPDATE Toppings 
          SET Name=@Name, Price=@Price, Unit=@Unit, Supplier=@Supplier,
              Quantity=@Quantity, MinStock=@MinStock, LastUpdated=GETDATE()
          WHERE Id=@Id
        `);
      res.json({ ok: true, message: "Đã cập nhật topping" });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  static async deleteItem(req, res) {
    try {
      const { id } = req.params;
      const pool = await getPool();
      await pool.request().input("Id", sql.Int, id)
        .query(`DELETE FROM Toppings WHERE Id=@Id`);
      res.json({ ok: true, message: "Đã xóa topping" });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
}

module.exports = AdminToppingController;
