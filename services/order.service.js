// ======================================================
// 🧠 services/order.service.js (ĐÃ CẬP NHẬT HÀM CREATE)
// ======================================================
const { sql, getPool } = require("../config/db");

class OrderService {
  // ======================================================
  // 🟢 Tạo đơn hàng mới
  // ======================================================
  async create(userId, orderData, ) {
    // 🔑 CẬP NHẬT: Nhận các giá trị tính toán từ FE
    const {
      items, subtotal, total, shippingFee, serviceFee,
      discountAmount, voucherCode, paymentMethod,
      pickupMethod, shippingAddress, lat, lng, storeId,
      fulfillmentMethod,
      isOnlinePaid
    } = orderData;
    const paidOnline = Boolean(isOnlinePaid);

    // Mặc định: nếu thanh toán online thì đơn vẫn chỉ "Pending" (chưa pha chế xong)
    let finalStatus = "Pending";
    let paymentStatus = paidOnline ? "Paid" : "Unpaid";
    let amountPaid = paidOnline ? total : 0;
    let changeAmount = 0;


    console.log("📦 Dữ liệu sản phẩm đầu vào từ FE (Item mẫu):", items[0]);

    const pool = await getPool();
    const connection = await pool.connect();
    const transaction = new sql.Transaction(connection);

    try {
      await transaction.begin();
      console.log("🚀 [OrderService.create] Transaction bắt đầu...");

      // 1️⃣ Thêm đơn hàng chính (SỬ DỤNG GIÁ TRỊ TỪ FE)
      const insertOrder = await new sql.Request(transaction)
        .input("UserId", sql.Int, userId)
        .input("StoreId", sql.Int, storeId || 1)
        // ✅ Dùng Subtotal, ShippingFee, Total đã tính ở FE
        .input("Subtotal", sql.Decimal(18, 2), subtotal)
        .input("ShippingFee", sql.Decimal(18, 2), shippingFee || 0)
        .input("Total", sql.Decimal(18, 2), total)
        // ----------------------------------------------------
        .input("PaymentMethod", sql.NVarChar(50), paymentMethod || "COD")
        .input("FulfillmentMethod", sql.NVarChar(50), fulfillmentMethod || pickupMethod || "Delivery")
        .input("DeliveryAddress", sql.NVarChar(255), shippingAddress || null)
        .input("DeliveryLat", sql.Float, lat || null)
        .input("DeliveryLng", sql.Float, lng || null)
        .input("Status", sql.NVarChar(50), finalStatus)
        .input("PaymentStatus", sql.NVarChar(50), paymentStatus)
        .input("AmountPaid", sql.Decimal(18, 2), amountPaid)
        .input("ChangeAmount", sql.Decimal(18, 2), changeAmount)
        .query(`
  INSERT INTO dbo.Orders (
    UserId, StoreId, Subtotal, ShippingFee, Total,
    PaymentMethod, PaymentStatus, AmountPaid, ChangeAmount,
    FulfillmentMethod, DeliveryAddress, DeliveryLat, DeliveryLng, 
    Status
  )
  OUTPUT INSERTED.Id
  VALUES (
    @UserId, @StoreId, @Subtotal, @ShippingFee, @Total,
    @PaymentMethod, @PaymentStatus, @AmountPaid, @ChangeAmount,
    @FulfillmentMethod, @DeliveryAddress, @DeliveryLat, @DeliveryLng, 
    @Status
  )
`);



      const orderId = insertOrder.recordset[0].Id;
      console.log("🧾 Đơn hàng mới:", orderId);

      // 🟢 Tạo ProductSummary JSON (LƯU TRỮ CHI TIẾT CÁC KHOẢN PHÍ)
      const summaryPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          productName: i.productName || i.name,
          quantity: i.quantity,
          price: i.price,
          size: i.size || '',
          toppings: i.toppings || []
        })),
        feesAndDiscounts: {
          subtotal: subtotal,
          shippingFee: shippingFee || 0,
          serviceFee: serviceFee || 0,
          discountAmount: discountAmount || 0,
          voucherCode: voucherCode || null,
          finalTotal: total
        }
      };
      const productSummary = JSON.stringify(summaryPayload);

      // 🟢 Lưu ProductSummary vào Orders
await new sql.Request(transaction)
  .input("OrderId", sql.Int, orderId)
.input("ProductSummary", sql.NVarChar(sql.MAX), productSummary)
  .query(`
    UPDATE dbo.Orders
    SET ProductSummary = @ProductSummary
    WHERE Id=@OrderId
  `);




      // 2️⃣ Thêm chi tiết sản phẩm
      for (const item of items) {
        await new sql.Request(transaction)
          .input("OrderId", sql.Int, orderId)
          .input("ProductId", sql.Int, item.productId)
          .input("ProductName", sql.NVarChar(255), item.productName || item.name || "")
          .input("Quantity", sql.Int, item.quantity)
          .input("Price", sql.Decimal(18, 2), item.price)
          .input("Size", sql.NVarChar(20), item.size || null)
          .input("Topping", sql.NVarChar(255), (item.toppings?.join(",") || null))
          .query(`
      INSERT INTO OrderItems (OrderId, ProductId, ProductName, Quantity, Price, Size, Topping)
      VALUES (@OrderId, @ProductId, @ProductName, @Quantity, @Price, @Size, @Topping)
    `);
      }


      // 3️⃣ Ghi vào lịch sử trạng thái (Pending)
      // 3️⃣ Ghi vào lịch sử trạng thái ban đầu (Pending)
      await new sql.Request(transaction)
        .input("OrderId", sql.Int, orderId)
        .input("OldStatus", sql.NVarChar(50), null)
        .input("NewStatus", sql.NVarChar(50), finalStatus) // finalStatus = 'Pending'
        .query(`
  UPDATE dbo.Orders
  SET Status = 'waiting'
  WHERE Id = @OrderId;

  INSERT INTO dbo.OrderHistory (OrderId, OldStatus, NewStatus)
  VALUES (@OrderId, 'Pending', 'waiting');
`);

      // 🔄 AUTO ĐẨY ĐƠN DELIVERY SANG HÀNG ĐỢI PHA (waiting)
      if (fulfillmentMethod === "Delivery") {
        await new sql.Request(transaction)
          .input("OrderId", sql.Int, orderId)
          .query(`
            UPDATE Orders
            SET Status = 'waiting'
            WHERE Id = @OrderId;

            INSERT INTO OrderHistory (OrderId, OldStatus, NewStatus)
            VALUES (@OrderId, 'Pending', 'waiting');
          `);
      }

      await transaction.commit();
      console.log("✅ Transaction commit thành công!");
      return { orderId };

    } catch (err) {
      // ======================================================
      // 🛑 BẮT LỖI CHI TIẾT KHI TẠO ĐƠN HÀNG
      // ======================================================
      console.error("❌ [OrderService.create] Chi tiết lỗi SQL:", {
        message: err.message,
        code: err.code,
        number: err.number,
        lineNumber: err.lineNumber,
        state: err.state,
        class: err.class,
        procName: err.procName,
        stack: err.stack?.split("\n")[0], // in dòng đầu của stack trace
      });

      // ✅ Rollback an toàn
      try {
        if (transaction._aborted !== true) {
          await transaction.rollback();
          console.log("↩️ Transaction rollback hoàn tất");
        }
      } catch (rollbackErr) {
        console.error("⚠️ Rollback lỗi:", rollbackErr.message);
      }

      // 🔥 Ném lỗi chi tiết để controller xử lý (thay vì chuỗi tĩnh)
      throw new Error(err.message || "Lỗi khi tạo đơn hàng");
    } finally {
      // ======================================================
      // 🧹 ĐÓNG KẾT NỐI TRÁNH RÒ RỈ
      // ======================================================
      try {
        if (connection && connection.close) {
          await connection.close();
          console.log("🔒 Đóng kết nối SQL thành công!");
        }
      } catch (closeErr) {
        console.error("⚠️ Lỗi khi đóng connection:", closeErr.message);
      }
    }
  }

  // ======================================================
  // 🟢 Danh sách đơn hàng theo user
  // ======================================================
  async listByUser(userId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(`
  SELECT 
    O.Id,
    O.Total        AS TotalAmount,
    O.Status,
    O.CreatedAt    AS OrderDate,
    O.PaymentMethod,
    O.ProductSummary
  FROM dbo.Orders O
  WHERE O.UserId = @UserId
  ORDER BY O.CreatedAt DESC
`);
    // ✅ FIX: Xử lý dữ liệu sau khi truy vấn để chuyển ProductSummary thành mảng items
    return result.recordset.map(order => {
      let itemsArray = [];
      try {
        // ProductSummary giờ là một object chứa items và feesAndDiscounts
        if (order.ProductSummary && typeof order.ProductSummary === 'string' && order.ProductSummary.length > 0) {
          const summary = JSON.parse(order.ProductSummary);
          // Lấy mảng items từ object summary
          if (summary.items) {
            itemsArray = summary.items;
          }
        }
      } catch (e) {
        console.error("❌ Lỗi parse ProductSummary cho OrderId:", order.Id, e);
      }

      // Mapping các trường để khớp với giao diện FE mong đợi (OrderWithItems interface)
      return {
        id: order.Id,
        total: order.TotalAmount,
        status: order.Status,
        date: order.OrderDate,
        paymentMethod: order.PaymentMethod,
        // 🔑 Trường quan trọng: Frontend cần 'items' là một mảng
        items: itemsArray,
        // Bỏ qua trường ProductSummary (chuỗi JSON) để giữ dữ liệu sạch
        // ProductSummary: undefined 
      };
    });
  }

  // ======================================================
  // 🟢 Chi tiết đơn hàng
  // ======================================================
  async detail(orderId, userId) {
    const pool = await getPool();

    const header = await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .input("UserId", sql.Int, userId)
      .query(`
  SELECT * FROM dbo.Orders
  WHERE Id = @OrderId AND UserId = @UserId
`);


    if (!header.recordset.length) return null;

 const items = await pool
  .request()
  .input("OrderId", sql.Int, orderId)
  .query(`
    SELECT * FROM OrderItems WHERE OrderId = @OrderId
  `);

    return {
      ...header.recordset[0],
      items: items.recordset,
    };
  }

  // ======================================================
  // 🟢 Lịch sử thay đổi trạng thái
  // ======================================================
  async history(orderId) {
    const pool = await getPool();
    const result = await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .query(`
        SELECT * FROM OrderHistory
        WHERE OrderId = @OrderId
        ORDER BY ChangedAt DESC
      `);
    return result.recordset;
  }

  // ======================================================
  // 🟠 Hủy đơn hàng
  // ======================================================
  async cancel(orderId, userId) {
    const pool = await getPool();

    const oldStatusRes = await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .query(`SELECT Status FROM dbo.Orders WHERE Id=@OrderId`); const oldStatus = oldStatusRes.recordset[0]?.Status;

    if (!oldStatus) throw new Error("Đơn hàng không tồn tại");

    // Cập nhật trạng thái
    await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .input("UserId", sql.Int, userId)
      .query(`
        UPDATE Orders SET Status=N'Cancelled'
        WHERE Id=@OrderId AND UserId=@UserId
      `);

    // Ghi lịch sử
    await pool
      .request()
      .input("OrderId", sql.Int, orderId)
      .input("OldStatus", sql.NVarChar(50), oldStatus)
      .input("NewStatus", sql.NVarChar(50), "Cancelled")
      .query(`
        INSERT INTO OrderHistory (OrderId, OldStatus, NewStatus)
        VALUES (@OrderId, @OldStatus, @NewStatus)
      `);

    return { orderId, oldStatus, newStatus: "Cancelled" };
  }
  // ======================================================
// 🟢 Tạo đơn hàng cho POS (Cashier)
// ======================================================
async createFromPOS(employeeId, orderData) {
  return this._createInternal({
    createdBy: employeeId,
    isEmployee: true,
    orderData
  });
}

}

module.exports = new OrderService();