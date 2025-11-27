// controllers/orderHistory.controller.js
const OrderHistoryService = require("../services/orderHistory.service");

class OrderHistoryController {
  // ✅ Lấy danh sách đơn hàng user
  static async listMyOrders(req, res) {
    try {
      const currentUserId = req.user?.userId; // Lấy ID một cách an toàn
      console.log("DEBUG Order History: Current User ID:", currentUserId); // 🔑 Debug log

      if (!currentUserId) {
        // Trả về lỗi 401 nếu middleware xác thực thành công nhưng không gắn userId
        return res.status(401).json({ ok: false, error: "Unauthorized: Missing user ID in token." });
      }

      // Gọi Service với User ID đã xác nhận
      const data = await OrderHistoryService.getByUser(currentUserId);
      res.json({ ok: true, data });
    } catch (err) {
      console.error("❌ OrderHistoryController.listMyOrders ERROR:", err.message);
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  // ✅ Chi tiết đơn hàng user
  static async detail(req, res) {
    try {
      const orderId = Number(req.params.id);
      const currentUserId = req.user?.userId; // Lấy ID một cách an toàn

      if (!currentUserId) {
        return res.status(401).json({ ok: false, error: "Unauthorized: Missing user ID." });
      }

      const result = await OrderHistoryService.getDetail(orderId, currentUserId);
      res.status(result.ok ? 200 : 404).json(result);
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  // ✅ (Admin) Xem toàn bộ đơn hàng
  static async adminList(req, res) {
    // ... (Giữ nguyên)
    try {
      const data = await OrderHistoryService.getAll();
      res.json({ ok: true, data });
    } catch (err) {
      res.status(500).json({ ok: false, error: err.message });
    }
  }
}

module.exports = OrderHistoryController;