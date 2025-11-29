// services/admin/admin.voucher.service.js
const { sql, poolPromise } = require("../../config/db");
const { getPool } = require("../../config/db");

class AdminVoucherService {
  // ✅ Danh sách tất cả vouchers (kèm thống kê lượt dùng)
  static async getAll() {
    const pool = await getPool();
    const result = await pool.request().query(`
    SELECT 
      v.Id, v.Code, v.Type, v.Value, v.MaxDiscount, v.MinOrder,
      v.UsageLimit, v.UsedCount, v.IsActive,
      v.StartAt, v.EndAt,
      COUNT(r.Id) AS RedemptionCount
    FROM Vouchers v
    LEFT JOIN VoucherRedemptions r ON v.Id = r.VoucherId
    GROUP BY 
      v.Id, v.Code, v.Type, v.Value, v.MaxDiscount, v.MinOrder,
      v.UsageLimit, v.UsedCount, v.IsActive, 
      v.StartAt, v.EndAt
    ORDER BY v.Id DESC
  `);
    return result.recordset;
  }


  // ✅ Tạo mới voucher
  static async create(data) {
    const {
      Code,
      Type,
      DiscountPercent,
      Value,
      MaxDiscount,
      MinOrder,
      RequiredPoints,
      StartAt,
      EndAt,
      ExpiryDate,
      IsActive = true
    } = data;

    const discountPercentSafe = Type.toUpperCase() === "PERCENT" ? DiscountPercent : 0;
    const valueSafe = Type.toUpperCase() === "PERCENT"
      ? DiscountPercent
      : Value;

    const pool = await getPool();

    await pool.request()
      .input("Code", sql.NVarChar, Code)
      .input("Type", sql.NVarChar, Type.toUpperCase())
      .input("DiscountPercent", sql.Int, discountPercentSafe)
      .input("Value", sql.Decimal(18, 2), valueSafe)
      .input("MaxDiscount", sql.Decimal(18, 2), MaxDiscount || 0)
      .input("MinOrder", sql.Decimal(18, 2), MinOrder || 0)
      .input("RequiredPoints", sql.Int, RequiredPoints || 0)
      .input("StartAt", sql.DateTime2, StartAt || null)
      .input("EndAt", sql.DateTime2, EndAt || null)
      .input("ExpiryDate", sql.DateTime2, ExpiryDate || StartAt || EndAt)
      .input("IsActive", sql.Bit, IsActive ? 1 : 0)
      .query(`
    INSERT INTO Vouchers
    (Code, Type, DiscountPercent, Value, MaxDiscount, MinOrder,
     RequiredPoints, UsedCount, IsActive, StartAt, EndAt, ExpiryDate)
    VALUES 
    (@Code, @Type, @DiscountPercent, @Value, @MaxDiscount, @MinOrder,
     @RequiredPoints, 0, @IsActive, @StartAt, @EndAt, @ExpiryDate)
  `);

    return { message: "Tạo voucher thành công" };
  }


  // ✅ Cập nhật voucher
  static async update(id, data) {
    if (!id) throw new Error("Thiếu voucher ID");

    const pool = await getPool();
    const request = pool.request()
      .input("Id", sql.Int, id)
      .input("Code", sql.NVarChar, data.code)
      .input("Type", sql.NVarChar, data.type.toUpperCase())
      .input("Value", sql.Decimal(18, 2),
        data.type.toUpperCase() === "PERCENT"
          ? data.discountPercent
          : data.value
      )
      .input("MaxDiscount", sql.Decimal(18, 2), data.maxDiscount || null)
      .input("MinOrder", sql.Decimal(18, 2), data.minOrder || null)
      .input("RequiredPoints", sql.Int, data.requiredPoints || 0)
      .input("UsageLimit", sql.Int, data.usageLimit || null)
      .input("IsActive", sql.Bit, data.isActive ? 1 : 0)
      .input("StartAt", sql.DateTime2, data.startAt || null)
      .input("EndAt", sql.DateTime2, data.endAt || null)
      .input("ExpiryDate", sql.DateTime2, data.expiryDate || data.startAt || data.endAt)
      .query(`
        UPDATE Vouchers
        SET Code=@Code, Type=@Type, Value=@Value, MaxDiscount=@MaxDiscount,
            MinOrder=@MinOrder, UsageLimit=@UsageLimit, IsActive=@IsActive,
            StartAt=@StartAt, EndAt=@EndAt, ExpiryDate=@ExpiryDate
        WHERE Id=@Id
      `);

    return { message: "✅ Cập nhật voucher thành công" };
  }

  // ✅ Vô hiệu hoá hoặc bật lại voucher
  static async toggleActive(id, isActive) {
    const pool = await getPool();
    await pool.request()
      .input("Id", sql.Int, id)
      .input("IsActive", sql.Bit, isActive ? 1 : 0)
      .query("UPDATE Vouchers SET IsActive=@IsActive, UpdatedAt=SYSUTCDATETIME() WHERE Id=@Id");

    return { message: isActive ? "Đã kích hoạt lại voucher" : "Đã vô hiệu hóa voucher" };
  }

  // ✅ Xoá voucher (nếu chưa có redemption)
  static async delete(id) {
    const pool = await getPool();
    const redemption = await pool.request()
      .input("Id", sql.Int, id)
      .query("SELECT COUNT(*) AS Cnt FROM VoucherRedemptions WHERE VoucherId=@Id");
    if (redemption.recordset[0].Cnt > 0)
      throw new Error("Voucher đã được sử dụng, không thể xoá");

    await pool.request().input("Id", sql.Int, id)
      .query("DELETE FROM Vouchers WHERE Id=@Id");

    return { message: "🗑️ Đã xoá voucher" };
  }

  // ✅ Thống kê tổng quan (dashboard)
  static async getStats() {
    const pool = await getPool();
    const stats = await pool.request().query(`
      SELECT
        COUNT(*) AS TotalVouchers,
        SUM(CASE WHEN IsActive=1 THEN 1 ELSE 0 END) AS ActiveVouchers,
        SUM(UsedCount) AS TotalUsed,
        SUM(CASE WHEN UsageLimit IS NOT NULL THEN UsageLimit ELSE 0 END) AS TotalLimit
      FROM Vouchers
    `);
    return stats.recordset[0];
  }
}

module.exports = AdminVoucherService;
