const { sql, getPool } = require("../../config/db");
const PosInventoryService = require("./pos.inventory.service");

class PosOrderService {

    // =======================================
    // 1. CASHIER — LẤY LIST ORDER (pending, waiting, preparing, done, completed)
    // =======================================
    static async getCashierOrders(user) {
        const pool = await getPool();

        // 1. Lấy danh sách order
        const ordersRs = await pool.request().query(`
        SELECT 
            o.Id,
            o.UserId,
            o.Total,
            o.Status,
            o.PaymentStatus,
            o.CreatedAt,
            u.Name AS CustomerName,
            o.FulfillmentMethod
        FROM Orders o
        LEFT JOIN Users u ON o.UserId = u.Id
        WHERE o.Status IN ('pending','waiting','preparing')
        ORDER BY o.CreatedAt DESC
    `);

        const orders = ordersRs.recordset;
        if (orders.length === 0) return [];

        // 2. Lấy items từ OrderItems (KHÔNG phải OrderDetails)
        const itemsRs = await pool.request().query(`
        SELECT 
            oi.OrderId,
            oi.ProductId,
            oi.Quantity,
            oi.Price,
            oi.Size,
            oi.Topping AS Toppings,
            p.Name AS ProductName,
            p.ImageUrl
        FROM OrderItems oi
        JOIN Products p ON oi.ProductId = p.Id
        WHERE oi.OrderId IN (${orders.map(o => o.Id).join(",")})
    `);

        const items = itemsRs.recordset;

        // 3. Ghép items vào order
        const final = orders.map(o => ({
            ...o,
            Items: items
                .filter(i => i.OrderId === o.Id)
                .map(i => ({
                    id: i.ProductId,
                    productId: i.ProductId,
                    quantity: i.Quantity,
                    price: Number(i.Price),
                    name: i.ProductName,
                    image: i.ImageUrl,
                    size: i.Size,
                    toppings: i.Toppings ? i.Toppings.split(",") : [],
                    notes: ""
                })),
            type: o.FulfillmentMethod === "Delivery" ? "delivery" : "atstore"
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
        // Tính tổng tiền dựa trên price FE gửi lên
        let subTotal = 0;
        for (const item of items) {
            const price = Number(item.price) || 0;
            const qty = Number(item.quantity) || 0;
            subTotal += price * qty;
        }
        const totalAmount = subTotal;


        try {
            await transaction.begin();
const empRs = await new sql.Request(transaction)
    .input("EmployeeId", sql.Int, user.id)
    .query(`
        SELECT TOP 1 BranchId AS StoreId
        FROM Employees
        WHERE Id = @EmployeeId
    `);





            const storeId = empRs.recordset[0]?.StoreId;

            if (!storeId) {
                throw new Error("Nhân viên không có StoreId (BranchId).");
            }
            // Insert Order (BỔ SUNG CÁC TRƯỜNG THIẾU)
            const orderResult = await new sql.Request(transaction)
.input("EmployeeId", sql.Int, user.id)
                .input("UserId", sql.Int, user.id)
                .input("StoreId", sql.Int, storeId)
                .input("Status", sql.NVarChar, "pending")
                .input("PaymentStatus", sql.NVarChar, "unpaid")
                .input("Total", sql.Decimal(18, 2), totalAmount.toFixed(2))
                .input("FulfillmentMethod", sql.NVarChar, "AtStore")
                .input("ShippingFee", sql.Decimal(18, 2), 0)
                .input("DeliveryAddress", sql.NVarChar, 'Tại quầy')
                .input("EmpId", sql.Int, user.id)
                .query(`
                -- Order table có StoreId nên phải thêm vào INSERT
INSERT INTO Orders 
(EmployeeId, StoreId, Status, PaymentStatus, Total, FulfillmentMethod, ShippingFee, CreatedAt)
OUTPUT INSERTED.Id
VALUES 
(@EmployeeId, @StoreId, @Status, @PaymentStatus, @Total, @FulfillmentMethod, @ShippingFee, GETDATE())
                `);
            const orderId = orderResult.recordset[0].Id;

            // 3. Insert Items
            // 3. Insert Items — LẤY PRICE + NAME TỪ DB (KHÔNG BAO GIỜ LẤY TỪ FE)
            for (const item of items) {

                // Lấy thông tin sản phẩm từ Product Table
                const pRs = await new sql.Request(transaction)
                    .input("ProductId", sql.Int, item.productId)
                    .query(`
            SELECT Name, Price 
            FROM Products 
            WHERE Id = @ProductId
        `);

                const product = pRs.recordset[0];

                if (!product) {
                    throw new Error(`ProductId ${item.productId} không tồn tại`);
                }

                await new sql.Request(transaction)
                    .input("OrderId", sql.Int, orderId)

                    .input("ProductId", sql.Int, item.productId)
                    .input("ProductName", sql.NVarChar(255), product.Name)
                    .input("Size", sql.NVarChar(20), item.size || null)
                    .input("Topping", sql.NVarChar(255), (item.toppings?.join(",") || null))
                    .input("Quantity", sql.Int, item.quantity)
                    .input("Price", sql.Decimal(18, 2), product.Price)   // ✔ GIÁ CHUẨN TỪ DB
                    .query(`
            INSERT INTO OrderItems 
            (OrderId, ProductId, ProductName, Size, Topping, Quantity, Price)
            VALUES (@OrderId, @ProductId, @ProductName, @Size, @Topping, @Quantity, @Price)
        `);
            }
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
            console.error("========== SQL DEBUG ==========");
            console.error("MESSAGE:", err.message);
            console.error("LINE:", err.lineNumber);
            console.error("STATE:", err.state);
            console.error("CLASS:", err.class);
            console.error("SQL ERROR OBJ:", err);

            // In luôn toàn bộ query SQL cuối cùng mà Request đang giữ
            console.error("RAW PRECEDING ERRORS:", err.precedingErrors);

            await transaction.rollback();
            throw new Error(`Lỗi tạo đơn hàng: ${err.message}`);
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
    // 4. BARISTA — Xem queue (dùng chung POS pipeline)
    // =======================================
    static async getBaristaQueue() {
        const pool = await getPool();

        const rs = await pool.request().query(`
        SELECT 
            o.Id,
            o.UserId,
            o.StoreId, 
            o.Total,
            o.Status,
            o.PaymentStatus,
            o.CreatedAt,
            o.FulfillmentMethod,
            u.Name AS CustomerName,

            oi.Id AS OrderItemId,
            oi.ProductId,
            oi.Quantity,
            oi.Price,
            oi.Size,
            oi.Topping,
            p.Name AS ProductName
        FROM Orders o
        LEFT JOIN Users u ON o.UserId = u.Id
        JOIN OrderItems oi ON oi.OrderId = o.Id
        JOIN Products p ON oi.ProductId = p.Id
        WHERE o.Status IN ('waiting', 'preparing')
        ORDER BY o.CreatedAt ASC, o.Id ASC
    `);

        const rows = rs.recordset;
        if (!rows || rows.length === 0) return [];

        const map = new Map();

        rows.forEach(r => {
            if (!map.has(r.Id)) {
                map.set(r.Id, {
                    id: r.Id,
                    userId: r.UserId,
                    storeId: r.StoreId,
                    total: Number(r.Total) || 0,
                    status: (r.Status || "").toLowerCase(),
                    paymentStatus: r.PaymentStatus,
                    createdAt: r.CreatedAt,

                    fulfillmentMethod: r.FulfillmentMethod,
                    customerName: r.CustomerName || "Khách lẻ",

                    // cho FE Barista: delivery / atstore
                    type:
                        r.FulfillmentMethod === "Delivery"
                            ? "delivery"
                            : "atstore",

                    items: []
                });
            }

            const order = map.get(r.Id);
            order.items.push({
                id: r.OrderItemId,
                productId: r.ProductId,
                name: r.ProductName,
                quantity: r.Quantity,
                size: r.Size || "",
                notes: r.Topping || ""
            });
        });

        return Array.from(map.values());
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
            .input("OldStatus", sql.NVarChar(50), order.Status)
            .query(`
            UPDATE Orders
            SET 
                PaymentMethod = @PaymentMethod,
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