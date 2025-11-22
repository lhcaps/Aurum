const WorkflowService = require("../../services/admin/order.workflow.service");

class OrderWorkflowController {

  // ============================
  // CASHIER / BARISTA ACTIONS
  // ============================
  async accept(req, res) {
    try {
      const id = req.params.id;
const result = await WorkflowService.updateStatus(id, "waiting");

      return res.json({
        ok: true,
        status: "Accepted",
        data: result
      });
    } catch (error) {
      console.error("[accept] ERROR:", error);
      return res.status(500).json({ ok: false, message: "Không thể cập nhật trạng thái." });
    }
  }

  async toMaking(req, res) {
    try {
      const id = req.params.id;
const result = await WorkflowService.updateStatus(id, "preparing");

      return res.json({
        ok: true,
        status: "Making",
        data: result
      });
    } catch (error) {
      console.error("[toMaking] ERROR:", error);
      return res.status(500).json({ ok: false, message: "Không thể cập nhật trạng thái." });
    }
  }

  async completeByBarista(req, res) {
    try {
      const id = req.params.id;
const result = await WorkflowService.updateStatus(id, "done");

      return res.json({
        ok: true,
        status: "CompletedByBarista",
        data: result
      });
    } catch (error) {
      console.error("[completeByBarista] ERROR:", error);
      return res.status(500).json({ ok: false, message: "Không thể cập nhật trạng thái." });
    }
  }

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
      return res.status(500).json({ ok: false, message: "Không thể hoàn thành đơn." });
    }
  }

  // ============================
  // BARISTA: LẤY DANH SÁCH ĐƠN
  // ============================
  async getBaristaOrders(req, res) {
    try {
      const storeId = req.user?.StoreId || null;

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
