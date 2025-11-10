const AdminInventoryService = require("../../services/admin/admin.inventory.service");

class AdminInventoryController {
  // GET /api/admin/inventory
  static async getAll(req, res) {
    try {
      const data = await AdminInventoryService.getAll();
      res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  // POST /api/admin/inventory
  static async addItem(req, res) {
    try {
      const result = await AdminInventoryService.addItem(req.body);
      res.json({ ok: true, message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  // PUT /api/admin/inventory/:id/stock
  static async updateStock(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const { quantity } = req.body;
      const result = await AdminInventoryService.updateStock(id, quantity);
      res.json({ ok: true, message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  // DELETE /api/admin/inventory/:id
  static async deleteItem(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await AdminInventoryService.deleteItem(id);
      res.json({ ok: true, message: result.message });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }

  // GET /api/admin/inventory/history
  static async getHistory(req, res) {
    try {
      const data = await AdminInventoryService.getHistory();
      res.json({ ok: true, data });
    } catch (err) {
      console.error(err);
      res.status(500).json({ ok: false, error: err.message });
    }
  }
}

module.exports = AdminInventoryController;
