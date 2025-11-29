const { sql, getPool } = require("../../config/db");
const PosInventoryService = require("./pos.inventory.service");

class PosOrderService {

    // =======================================
    // 1. CASHIER — LẤY LIST ORDER (pending, waiting, preparing, done, completed)
    // =======================================
    static async getCashierOrders(user) {
        const pool = await getPool();

        // 1. Lấy danh sách đơn
        const ordersRs = await pool.request().query(`
            SELECT 
                o.Id,
                o.UserId,
                o.Total,
                o.Status,
                o.PaymentStatus,
                o.CreatedAt,
                u.Name AS CustomerName
            FROM Orders o
            LEFT JOIN Users u ON o.UserId = u.Id
            -- Lấy các trạng thái active của quy trình POS
            WHERE o.Status IN ('pending','waiting','preparing', 'delivery', 'completed', 'done') 
            ORDER BY o.CreatedAt DESC
        `);

        const orders = ordersRs.recordset;

        if (orders.length === 0) return [];

        // 2. Lấy danh sách items của tất cả order
        const itemsRs = await pool.request().query(`
            SELECT 
                od.OrderId,
                od.ProductId,
                od.Quantity,
                od.UnitPrice AS Price,
                od.Size,
                od.Toppings,
                od.Sugar,
                od.Ice,
                p.Name AS ProductName,
                p.ImageUrl
            FROM OrderDetails od
            JOIN Products p ON od.ProductId = p.Id
            WHERE od.OrderId IN (${orders.map(o => o.Id).join(",")})
        `);

        const items = itemsRs.recordset;

        // 3. Gắn items vào đúng order
        const final = orders.map(o => ({
            ...o,
            Items: items.filter(i => i.OrderId === o.Id)
        }));

        return final;
    }

    // =======================================
    // 2. CASHIER — Tạo order
    // =======================================
    static async createOrder(payload, user) {
        const { items, voucherCode } = payload;

        console.log("DEBUG: 📦 [createOrder] Payload nhận được:", JSON.stringify(payload));

        if (!Array.isArray(items) || items.length === 0) {
            throw new Error("Danh sách sản phẩm trống");
        }

        const pool = await getPool();
        const connection = await pool.connect();
        const transaction = new sql.Transaction(connection);

        // Tính tổng tiền
        let subTotal = 0;
        for (const item of items) {
            const pId = parseInt(item.productId, 10);
            const price = parseFloat(item.price);
            const qty = parseFloat(item.quantity);

            if (!pId || isNaN(qty) || isNaN(price)) {
                throw new Error(`Dữ liệu sản phẩm không hợp lệ: ID=${item.productId}`);
            }
            subTotal += price * qty;
        }
        const totalAmount = subTotal;

        try {
            await transaction.begin();

            // 1. Lấy StoreId (Mặc định là 1 nếu không tìm thấy)
            const empRs = await new sql.Request(transaction)
                .input("UserId", sql.Int, user.id)
                .query(`SELECT TOP 1 StoreId FROM Employees WHERE UserId = @UserId`);

            const storeId = empRs.recordset[0]?.StoreId || 1;

            // 2. Insert Order (BỔ SUNG CÁC TRƯỜNG THIẾU)
            const orderResult = await new sql.Request(transaction)
                .input("UserId", sql.Int, user.id)
                .input("StoreId", sql.Int, storeId)
                .input("VoucherCode", sql.NVarChar, voucherCode || null)
                .input("Status", sql.NVarChar, "pending")
                .input("PaymentStatus", sql.NVarChar, "unpaid")
                .input("Total", sql.Decimal(18, 2), totalAmount.toFixed(2))
                .input("FulfillmentMethod", sql.NVarChar, "AtStore")
                .input("ShippingFee", sql.Decimal(18, 2), 0)
                .input("DeliveryAddress", sql.NVarChar, 'Tại quầy')
                .query(`
                    INSERT INTO Orders 
                    (UserId, StoreId, VoucherCode, Status, PaymentStatus, Total, FulfillmentMethod, ShippingFee, DeliveryAddress, CreatedAt)
                    OUTPUT INSERTED.Id
                    VALUES 
                    (@UserId, @StoreId, @VoucherCode, @Status, @PaymentStatus, @Total, @FulfillmentMethod, @ShippingFee, @DeliveryAddress, GETDATE())
                `);

            const orderId = orderResult.recordset[0].Id;
            console.log("DEBUG: ✅ [createOrder] Created Order ID:", orderId);

            // 3. Insert Items
            for (const item of items) {
                await new sql.Request(transaction)
                    .input("OrderId", sql.Int, orderId)
                    .input("ProductId", sql.Int, parseInt(item.productId))
                    .input("Quantity", sql.Int, item.quantity)
                    .input("Price", sql.Decimal(18, 2), item.price)
                    .query(`
                        INSERT INTO OrderItems (OrderId, ProductId, Quantity, Price)
                        VALUES (@OrderId, @ProductId, @Quantity, @Price)
                    `);
            }

            // 4. Ghi lịch sử tạo đơn
            await new sql.Request(transaction)
                .input("OrderId", sql.Int, orderId)
                .input("NewStatus", sql.NVarChar(50), "pending")
                .query(`
                    INSERT INTO OrderHistory (OrderId, OldStatus, NewStatus, ChangedAt)
                    VALUES (@OrderId, NULL, @NewStatus, GETDATE())
                `);

            await transaction.commit();

            return {
                message: "Tạo order thành công",
                orderId,
                totalAmount
            };

        } catch (err) {
            await transaction.rollback();
            console.error("❌ [createOrder] SQL Error:", err);
            throw new Error(`Lỗi tạo đơn hàng: ${err.message}`);
        } finally {
            if (connection) connection.close();
        }
    }

    // =======================================
    // 3. CASHIER — Gửi order sang Barista
    // =======================================
    static async sendToBarista(orderId) {
        const pool = await getPool();

        // Cập nhật Status và ghi lịch sử
        await pool.request()
            .input("OrderId", sql.Int, orderId)
            .query(`
                UPDATE Orders SET Status = 'waiting' WHERE Id = @OrderId;
                INSERT INTO OrderHistory (OrderId, OldStatus, NewStatus, ChangedAt)
                VALUES (@OrderId, 'pending', 'waiting', GETDATE());
            `);

        return { message: "Đã gửi order sang Barista", orderId };
    }

    // =======================================
    // 4. BARISTA — Xem queue
    // =======================================
    static async getBaristaQueue() {
        const pool = await getPool();
        // Barista cần thấy các đơn đang chờ (waiting), đang pha (preparing)
        const rs = await pool.request().query(`
            SELECT 
                Id, UserId, StoreId, Total, Status, PaymentStatus, CreatedAt
            FROM Orders
            WHERE Status IN ('waiting', 'preparing')
            ORDER BY CreatedAt ASC
        `);
        return rs.recordset;
    }

    // =======================================
    // 5. BARISTA — Update status
    // =======================================
    static async updateStatus(orderId, status) {
        const valid = ["preparing", "done"];
        if (!valid.includes(status)) throw new Error("Trạng thái không hợp lệ");

        const pool = await getPool();

        await pool.request()
            .input("OrderId", sql.Int, orderId)
            .input("Status", sql.NVarChar, status)
            .query(`
                DECLARE @OldStatus NVARCHAR(50);
                SELECT @OldStatus = Status FROM Orders WHERE Id = @OrderId;

                UPDATE Orders SET Status = @Status WHERE Id = @OrderId;

                INSERT INTO OrderHistory (OrderId, OldStatus, NewStatus, ChangedAt)
                VALUES (@OrderId, @OldStatus, @Status, GETDATE());
            `);

        return { message: "Cập nhật trạng thái thành công", orderId, status };
    }

    // =======================================
    // 6. CASHIER — Thanh toán
    // =======================================
    static async payOrder(orderId, paymentMethod, customerPaid, user) {
        const pool = await getPool();

        // 1. Lấy thông tin đơn hàng
        // 1. Lấy thông tin đơn hàng
        const rs = await pool.request()
            .input("OrderId", sql.Int, orderId)
            .query(`
        SELECT Id, Total, PaymentStatus, Status, FulfillmentMethod
        FROM Orders
        WHERE Id = @OrderId
    `);

        const order = rs.recordset[0];
        if (!order) throw new Error("Order không tồn tại");

        // CHẶN DELIVERY ORDER → KHÔNG CHO PAYMENT PHÁ DỮ LIỆU
        if (order.FulfillmentMethod !== "AtStore") {
            throw new Error("Không thể thanh toán đơn Delivery tại POS.");
        }

        // 2. Kiểm tra số tiền
        const total = Number(order.Total);
        const paid = Number(customerPaid);

        if (isNaN(total) || isNaN(paid)) {
            throw new Error("Dữ liệu thanh toán không hợp lệ.");
        }
        if (paid < total) {
            throw new Error("Khách đưa thiếu tiền");
        }

        const change = paid - total;

        // 3. UPDATE trạng thái thanh toán + trạng thái order
        await pool.request()
            .input("OrderId", sql.Int, orderId)
            .input("PaymentMethod", sql.NVarChar, paymentMethod || "cash")
            .input("AmountPaid", sql.Decimal(18, 2), paid)
            .input("ChangeAmount", sql.Decimal(18, 2), change)
            .input("OldStatus", sql.NVarChar(50), order.Status)
            .query(`
            UPDATE Orders
            SET 
                PaymentMethod = @PaymentMethod,
                AmountPaid = @AmountPaid,
                ChangeAmount = @ChangeAmount,
                PaymentStatus = 'paid',
                Status = 'completed'   -- ✔ QUAN TRỌNG
            WHERE Id = @OrderId;

            INSERT INTO OrderHistory (OrderId, OldStatus, NewStatus, ChangedAt)
            VALUES (@OrderId, @OldStatus, 'completed', GETDATE());
        `);

        // 4. Gọi inventory
        await PosInventoryService.handleOrderPaid(orderId);

        return {
            message: "Thanh toán thành công",
            orderId,
            totalAmount: total,
            amountPaid: paid,
            changeAmount: change
        };
    }
    static async getHistory(user) {
        const pool = await getPool();

        const rs = await pool.request().query(`
     SELECT 
        o.Id,
        o.Total,
        o.PaymentMethod,
        o.PaymentStatus,
        o.Status,
        o.CreatedAt,
        p.Name AS ProductName,
        oi.Quantity,
        oi.Size
     FROM Orders o
     JOIN OrderItems oi ON o.Id = oi.OrderId
     JOIN Products p ON oi.ProductId = p.Id
     WHERE o.Status IN ('completed','done','paid')
     ORDER BY o.CreatedAt DESC
  `);

        // Gom nhóm theo OrderId
        const map = new Map();
        rs.recordset.forEach(row => {
            if (!map.has(row.Id)) {
                map.set(row.Id, {
                    id: row.Id,
                    total: row.Total,
                    paymentMethod: row.PaymentMethod,
                    time: row.CreatedAt,
                    status: row.Status,
                    items: []
                });
            }
            map.get(row.Id).items.push({
                name: row.ProductName,
                size: row.Size,
                quantity: row.Quantity
            });
        });

        return Array.from(map.values());
    }

}

module.exports = PosOrderService;