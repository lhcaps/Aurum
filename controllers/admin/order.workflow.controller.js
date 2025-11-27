const WorkflowService = require("../../services/admin/order.workflow.service");

class OrderWorkflowController {

  // ============================
  // CASHIER / BARISTA ACTIONS
  // ============================

  // CASHIER: Xác nhận đơn → waiting
  async accept(req, res) {
    try {
      const id = req.params.id;
      const result = await WorkflowService.updateStatus(id, "waiting");

      return res.json({
        ok: true,
        status: "accepted",
        data: result
      });
    } catch (error) {
      console.error("[accept] ERROR:", error);
      return res.status(500).json({
        ok: false,
        message: "Không thể cập nhật trạng thái."
      });
    }
  }

  // BARISTA: Nhận pha → preparing
  async toMaking(req, res) {
    try {
      const id = req.params.id;
      const result = await WorkflowService.updateStatus(id, "preparing");

      return res.json({
        ok: true,
        status: "preparing",
        data: result
      });
    } catch (error) {
      console.error("[toMaking] ERROR:", error);
      return res.status(500).json({
        ok: false,
        message: "Không thể cập nhật trạng thái."
      });
    }
  }

  // BARISTA: Hoàn tất pha → done (nhưng chưa auto deduct)
  async completeByBarista(req, res) {
    try {
      const id = req.params.id;

      const result = await WorkflowService.updateStatus(id, "done");

      return res.json({
        ok: true,
        status: "completed",
        data: result
      });
    } catch (error) {
      console.error("[completeByBarista] ERROR:", error);
      return res.status(500).json({
        ok: false,
        message: "Không thể cập nhật trạng thái."
      });
    }
  }

  // CASHIER: Hoàn tất đơn + trừ nguyên liệu
  async done(req, res) {
    try {
      const id = req.params.id;

      await WorkflowService.updateStatus(id, "done");
      await WorkflowService.autoDeductIngredients(id);

      return res.json({
        ok: true,
        status: "done"
      });
    } catch (error) {
      console.error("[done] ERROR:", error);
      return res.status(500).json({
        ok: false,
        message: "Không thể hoàn thành đơn."
      });
    }
  }

  // ============================
  // BARISTA: LẤY DANH SÁCH ĐƠN
  // ============================
  async getBaristaOrders(req, res) {
    try {
      const storeId = req.user?.StoreId || null;

      // TRẢ FULL ITEM DATA — SIZE, TOPPING, QUANTITY, PRICE
      const orders = await WorkflowService.getBaristaOrders(storeId);

      return res.json({
        ok: true,
        data: orders,
      });

    } catch (error) {
      console.error("[getBaristaOrders] ERROR:", error);
      return res.status(500).json({
        ok: false,
        message: "Lỗi server khi lấy danh sách đơn cho Barista",
      });
    }
  }
}

module.exports = new OrderWorkflowController();
