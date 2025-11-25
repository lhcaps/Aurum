// services/review.service.js
// ============================================================
// 🧩 ReviewService - Xử lý nghiệp vụ đánh giá sản phẩm
// ------------------------------------------------------------
// - upsert: User tạo / cập nhật 1 review cho 1 sản phẩm
// - listByProduct: Lấy danh sách review theo sản phẩm
// - delete: User xóa review của mình hoặc Admin xóa review bất kỳ
// - listAll: Admin xem tất cả review
// - updateByAdmin: Admin chỉnh sửa / ẩn hiện review
// ============================================================

const { sql, getPool } = require("../config/db");

class ReviewService {
  // 🟢 1. Upsert review (create hoặc update)
  static async upsert(
    userId,
    productId,
    rating,
    comment,
    extra = {}
  ) {
    const { serviceRating, deliveryRating, driverRating, tags, images } = extra || {};

    try {
      const pool = await getPool();

      // 🧱 Đảm bảo rating hợp lệ
      if (rating < 1 || rating > 5) {
        return {
          ok: false,
          error: "INVALID_RATING",
          message: "Rating phải từ 1 đến 5",
        };
      }

      // 🧾 Kiểm tra đã có review của user cho product chưa
      const checkReq = pool.request();
      checkReq.input("UserId", sql.Int, userId);
      checkReq.input("ProductId", sql.Int, productId);

      const checkResult = await checkReq.query(`
        SELECT Id
        FROM ProductReviews
        WHERE UserId = @UserId AND ProductId = @ProductId
      `);

      const hasExisting = checkResult.recordset.length > 0;

      if (hasExisting) {
        // 🔁 UPDATE review
        const existingId = checkResult.recordset[0].Id;

        const updateReq = pool.request();
        updateReq.input("Id", sql.Int, existingId);
        updateReq.input("Rating", sql.Int, rating);
        updateReq.input("Comment", sql.NVarChar(1000), comment || null);

        const updateResult = await updateReq.query(`
          UPDATE ProductReviews
          SET Rating = @Rating,
              Comment = @Comment,
              UpdatedAt = SYSUTCDATETIME()
          WHERE Id = @Id;

          SELECT r.Id,
                 r.ProductId,
                 r.UserId,
                 r.Rating,
                 r.Comment,
                 r.IsVisible,
                 r.CreatedAt,
                 r.UpdatedAt
          FROM ProductReviews r
          WHERE r.Id = @Id;
        `);

        const updated = updateResult.recordset[0];

        // 📝 TODO: Lưu các field mở rộng (serviceRating, tags, images)
        // Hiện tại bảng ProductReviews chưa có cột tương ứng
        // -> Có thể lưu ở bảng phụ hoặc cột JSON trong tương lai
        console.log("ℹ️ [ReviewService.upsert] Extra fields (ignored for now):", {
          serviceRating,
          deliveryRating,
          driverRating,
          tags,
          images,
        });

        return {
          ok: true,
          message: "REVIEW_UPDATED",
          data: updated,
        };
      } else {
        // 🆕 INSERT review mới
        const insertReq = pool.request();
        insertReq.input("UserId", sql.Int, userId);
        insertReq.input("ProductId", sql.Int, productId);
        insertReq.input("Rating", sql.Int, rating);
        insertReq.input("Comment", sql.NVarChar(1000), comment || null);

        const insertResult = await insertReq.query(`
          INSERT INTO ProductReviews (UserId, ProductId, Rating, Comment)
          OUTPUT INSERTED.Id,
                 INSERTED.ProductId,
                 INSERTED.UserId,
                 INSERTED.Rating,
                 INSERTED.Comment,
                 INSERTED.IsVisible,
                 INSERTED.CreatedAt,
                 INSERTED.UpdatedAt
          VALUES (@UserId, @ProductId, @Rating, @Comment);
        `);

        const created = insertResult.recordset[0];

        console.log("ℹ️ [ReviewService.upsert] Extra fields (ignored for now):", {
          serviceRating,
          deliveryRating,
          driverRating,
          tags,
          images,
        });

        return {
          ok: true,
          message: "REVIEW_CREATED",
          data: created,
        };
      }
    } catch (err) {
      console.error("❌ Lỗi trong ReviewService.upsert:", err);
      return {
        ok: false,
        error: "UPSERT_FAILED",
        message: err.message,
      };
    }
  }

  // 🟢 2. Lấy danh sách review của 1 sản phẩm (public)
  static async listByProduct(productId) {
    try {
      const pool = await getPool();
      const req = pool.request();
      req.input("ProductId", sql.Int, productId);

      const result = await req.query(`
        SELECT 
          r.Id,
          r.ProductId,
          r.UserId,
          r.Rating,
          r.Comment,
          r.IsVisible,
          r.CreatedAt,
          r.UpdatedAt,
          u.Name      AS UserName,
          u.AvatarUrl AS UserAvatar
        FROM ProductReviews r
        JOIN Users u ON u.Id = r.UserId
        WHERE r.ProductId = @ProductId
          AND r.IsVisible = 1
        ORDER BY r.CreatedAt DESC;
      `);

      return {
        ok: true,
        data: result.recordset,
      };
    } catch (err) {
      console.error("❌ Lỗi trong ReviewService.listByProduct:", err);
      return {
        ok: false,
        error: "LIST_FAILED",
        message: err.message,
      };
    }
  }

  // 🟠 3. Xóa review
  // - Nếu isAdmin = true -> xóa theo Id
  // - Nếu isAdmin = false -> chỉ xóa nếu Id thuộc về userId
  static async delete(id, userId = null, isAdmin = false) {
    try {
      const pool = await getPool();
      const req = pool.request();
      req.input("Id", sql.Int, id);

      let query = "";

      if (isAdmin) {
        query = `
          DELETE FROM ProductReviews
          WHERE Id = @Id;
        `;
      } else {
        if (!userId) {
          return {
            ok: false,
            error: "UNAUTHORIZED",
            message: "Không xác định được userId khi xóa review",
          };
        }

        req.input("UserId", sql.Int, userId);
        query = `
          DELETE FROM ProductReviews
          WHERE Id = @Id AND UserId = @UserId;
        `;
      }

      const result = await req.query(query);
      const rows = result.rowsAffected?.[0] || 0;

      if (rows === 0) {
        return {
          ok: false,
          error: "NOT_FOUND_OR_FORBIDDEN",
          message: isAdmin
            ? "Không tìm thấy review để xóa"
            : "Review không tồn tại hoặc không thuộc về người dùng hiện tại",
        };
      }

      return {
        ok: true,
        message: "REVIEW_DELETED",
      };
    } catch (err) {
      console.error("❌ Lỗi trong ReviewService.delete:", err);
      return {
        ok: false,
        error: "DELETE_FAILED",
        message: err.message,
      };
    }
  }

  // 🟣 4. Admin: List tất cả review
  static async listAll() {
    try {
      const pool = await getPool();
      const req = pool.request();

      const result = await req.query(`
        SELECT 
          r.Id,
          r.ProductId,
          r.UserId,
          r.Rating,
          r.Comment,
          r.IsVisible,
          r.CreatedAt,
          r.UpdatedAt,
          u.Name      AS UserName,
          u.Email     AS UserEmail,
          p.Name      AS ProductName
        FROM ProductReviews r
        JOIN Users u    ON u.Id = r.UserId
        JOIN Products p ON p.Id = r.ProductId
        ORDER BY r.CreatedAt DESC;
      `);

      return {
        ok: true,
        data: result.recordset,
      };
    } catch (err) {
      console.error("❌ Lỗi trong ReviewService.listAll:", err);
      return {
        ok: false,
        error: "LIST_ALL_FAILED",
        message: err.message,
      };
    }
  }

  // 🟣 5. Admin: Update review (rating/comment/isVisible)
  static async updateByAdmin(id, updateData = {}) {
    try {
      const { rating, comment, isVisible } = updateData;

      const pool = await getPool();
      const req = pool.request();
      req.input("Id", sql.Int, id);

      // Build dynamic SET
      const setParts = [];
      if (typeof rating === "number") {
        req.input("Rating", sql.Int, rating);
        setParts.push("Rating = @Rating");
      }
      if (typeof comment === "string") {
        req.input("Comment", sql.NVarChar(1000), comment);
        setParts.push("Comment = @Comment");
      }
      if (typeof isVisible === "boolean") {
        req.input("IsVisible", sql.Bit, isVisible ? 1 : 0);
        setParts.push("IsVisible = @IsVisible");
      }

      if (setParts.length === 0) {
        return {
          ok: false,
          error: "NO_FIELDS_TO_UPDATE",
          message: "Không có trường hợp lệ để cập nhật",
        };
      }

      // Luôn cập nhật UpdatedAt
      setParts.push("UpdatedAt = SYSUTCDATETIME()");

      const query = `
        UPDATE ProductReviews
        SET ${setParts.join(", ")}
        WHERE Id = @Id;

        SELECT 
          r.Id,
          r.ProductId,
          r.UserId,
          r.Rating,
          r.Comment,
          r.IsVisible,
          r.CreatedAt,
          r.UpdatedAt
        FROM ProductReviews r
        WHERE r.Id = @Id;
      `;

      const result = await req.query(query);
      const updated = result.recordset[0];

      if (!updated) {
        return {
          ok: false,
          error: "NOT_FOUND",
          message: "Không tìm thấy review để cập nhật",
        };
      }

      return {
        ok: true,
        message: "REVIEW_UPDATED_BY_ADMIN",
        data: updated,
      };
    } catch (err) {
      console.error("❌ Lỗi trong ReviewService.updateByAdmin:", err);
      return {
        ok: false,
        error: "ADMIN_UPDATE_FAILED",
        message: err.message,
      };
    }
  }
}

module.exports = ReviewService;
