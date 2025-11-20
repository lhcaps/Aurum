const { sql, getPool } = require("../../config/db");

class AdminCategoryService {

  // Lấy tất cả
  static async getAll() {
    const pool = await getPool();
    const rs = await pool.request().query(`
      SELECT Id, Name 
      FROM Categories 
      ORDER BY Name
    `);
    return rs.recordset;
  }

  // Lấy theo ID
  static async getById(id) {
    const pool = await getPool();
    const rs = await pool.request()
      .input("Id", sql.Int, id)
      .query(`SELECT Id, Name FROM Categories WHERE Id = @Id`);

    return rs.recordset[0] || null;
  }

  // Tạo danh mục
  static async create(name) {
    const pool = await getPool();

    // Kiểm tra trùng tên
    const exists = await pool.request()
      .input("Name", sql.NVarChar(255), name)
      .query(`SELECT 1 FROM Categories WHERE Name = @Name`);

    if (exists.recordset.length > 0) {
      throw new Error("Tên danh mục đã tồn tại");
    }

    const rs = await pool.request()
      .input("Name", sql.NVarChar(255), name)
      .query(`
        INSERT INTO Categories (Name)
        OUTPUT INSERTED.Id, INSERTED.Name
        VALUES (@Name)
      `);

    return rs.recordset[0];
  }

  // Cập nhật danh mục
  static async update(id, newName) {
    const pool = await getPool();

    // Kiểm tra tồn tại ID
    const oldData = await this.getById(id);
    if (!oldData) throw new Error("Không tìm thấy danh mục");

    const oldName = oldData.Name;

    // Kiểm tra trùng tên
    const duplicated = await pool.request()
      .input("Name", sql.NVarChar(255), newName)
      .input("Id", sql.Int, id)
      .query(`
        SELECT 1 
        FROM Categories 
        WHERE Name = @Name AND Id <> @Id
      `);

    if (duplicated.recordset.length > 0) {
      throw new Error("Tên danh mục đã tồn tại");
    }

    // Cập nhật bảng Categories
    await pool.request()
      .input("Id", sql.Int, id)
      .input("Name", sql.NVarChar(255), newName)
      .query(`
        UPDATE Categories 
        SET Name = @Name 
        WHERE Id = @Id
      `);

    // Đồng bộ Products.CategoryName
    await pool.request()
      .input("OldName", sql.NVarChar(255), oldName)
      .input("NewName", sql.NVarChar(255), newName)
      .query(`
        UPDATE Products
        SET CategoryName = @NewName
        WHERE CategoryName = @OldName
      `);

    return { message: "Cập nhật danh mục thành công" };
  }

  // Xoá danh mục
  static async delete(id) {
    const pool = await getPool();

    const category = await this.getById(id);
    if (!category) throw new Error("Không tìm thấy danh mục để xóa");

    const name = category.Name;

    // Kiểm tra Products có dùng CategoryName không
    const checkUse = await pool.request()
      .input("Name", sql.NVarChar(255), name)
      .query(`SELECT TOP 1 1 FROM Products WHERE CategoryName = @Name`);

    if (checkUse.recordset.length > 0) {
      throw new Error("Danh mục đang được sử dụng bởi sản phẩm, không thể xóa");
    }

    await pool.request()
      .input("Id", sql.Int, id)
      .query(`DELETE FROM Categories WHERE Id = @Id`);

    return { message: "Xóa danh mục thành công" };
  }
}

module.exports = AdminCategoryService;
