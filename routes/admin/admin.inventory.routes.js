const express = require("express");
const { authenticateJWT, authorizeAdmin } = require("../../middleware/auth.middleware");
const AdminInventoryController = require("../../controllers/admin/admin.inventory.controller");

const router = express.Router();

// =============================
// 📦 ROUTES QUẢN LÝ KHO NGUYÊN LIỆU
// =============================

// ✅ Lấy toàn bộ nguyên liệu / tồn kho
// GET /api/admin/inventory
router.get("/", authenticateJWT, authorizeAdmin, AdminInventoryController.getAll);

// ✅ Thêm nguyên liệu mới
// POST /api/admin/inventory
router.post("/", authenticateJWT, authorizeAdmin, AdminInventoryController.addItem);

// ✅ Cập nhật số lượng tồn kho
// PUT /api/admin/inventory/:id/stock
router.put("/:id/stock", authenticateJWT, authorizeAdmin, AdminInventoryController.updateStock);

// ✅ Xóa nguyên liệu
// DELETE /api/admin/inventory/:id
router.delete("/:id", authenticateJWT, authorizeAdmin, AdminInventoryController.deleteItem);

// ✅ Lấy lịch sử nhập/xuất kho (nếu có bảng InventoryHistory)
// GET /api/admin/inventory/history
router.get("/history", authenticateJWT, authorizeAdmin, AdminInventoryController.getHistory);

module.exports = router;
