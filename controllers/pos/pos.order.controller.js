const PosOrderService = require("../../services/pos/pos.order.service");

class PosOrderController {

    // ===============================
    // GET CASHIER ORDERS
    // ===============================
    static async getCashierOrders(req, res) {
        try {
            console.log(">>> [BACKEND] GET /api/pos/orders HIT");
            const data = await PosOrderService.getCashierOrders(req.user);

            res.json({
                success: true,
                data
            });
        } catch (err) {
            console.error(">>> [BACKEND ERROR]", err.message);
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // CREATE ORDER
    // ===============================
    static async createOrder(req, res) {
        try {
            const data = await PosOrderService.createOrder(req.body, req.user);

            res.json({
                success: true,
                data
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // SEND TO BARISTA
    // ===============================
    static async sendToBarista(req, res) {
        try {
            const data = await PosOrderService.sendToBarista(req.params.orderId);

            res.json({
                success: true,
                data
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // BARISTA QUEUE
    // ===============================
    static async getBaristaQueue(req, res) {
        try {
            const data = await PosOrderService.getBaristaQueue();

            res.json({
                success: true,
                data
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // UPDATE STATUS
    // ===============================
    static async updateStatus(req, res) {
        try {
            const data = await PosOrderService.updateStatus(
                req.params.orderId,
                req.body.status
            );

            res.json({
                success: true,
                data
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // PAY ORDER
    // ===============================
    static async payOrder(req, res) {
        try {
            // 🔑 FIX 1: Khai báo và ÉP KIỂU orderId LÊN ĐẦU
            const orderId = parseInt(req.params.orderId, 10); 
            // 2. Lấy payload
            const { paymentMethod, customerPaid } = req.body; 

            // 🔑 FIX 2: Kiểm tra orderId sau khi đã khai báo
            if (isNaN(orderId)) { 
                return res.status(400).json({ success: false, error: "ID đơn hàng không hợp lệ." });
            }
            
            // 3. Kiểm tra payload (Đã sửa ở bước trước)
            if (!paymentMethod || customerPaid === undefined || customerPaid === null) {
                return res.status(400).json({ success: false, error: "Thiếu phương thức hoặc số tiền thanh toán." });
            }
            
            // 4. Gọi Service
            const data = await PosOrderService.payOrder(
                orderId, 
                paymentMethod,
                customerPaid, 
                req.user
            );

            res.json({
                success: true,
                data
            });
        } catch (err) {
            // ...
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // CANCEL ORDER
    // ===============================
    static async cancelOrder(req, res) {
        try {
            const data = await PosOrderService.cancelOrder(
                req.params.orderId,
                req.user
            );

            res.json({
                success: true,
                data
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }

    // ===============================
    // REFUND ORDER
    // ===============================
    static async refundOrder(req, res) {
        try {
            const data = await PosOrderService.refundOrder(
                req.params.orderId,
                req.user
            );

            res.json({
                success: true,
                data
            });
        } catch (err) {
            res.status(400).json({ success: false, error: err.message });
        }
    }
}

module.exports = PosOrderController;
