const express = require("express");
const router = express.Router();

const { authenticateJWT } = require("../../middleware/auth.middleware");
const { authorizeEmployee } = require("../../middleware/employee.middleware");
const WorkflowController = require("../../controllers/admin/order.workflow.controller");

// Bắt buộc login bằng JWT
router.use(authenticateJWT);

// ==========================================================
// 📦 CÁC ROUTES DÀNH CHO QUY TRÌNH LÀM VIỆC (WORKFLOW ROUTES)
// ==========================================================

// 1. BARISTA: Lấy danh sách đơn hàng chờ (GET /api/admin/workflow/barista-orders)
router.get(
  "/barista-orders",
  authorizeEmployee(["barista", "admin", "cashier"]),
  WorkflowController.getBaristaOrders
);

// 2. CASHIER: Gửi đơn hàng sang hàng đợi pha chế (Chuyển sang trạng thái 'waiting')
// PATCH /api/admin/workflow/:id/send-to-barista
router.patch(
  "/:id/send-to-barista", // 🔑 FIX: Đổi tên route sang send-to-barista
  authorizeEmployee(["cashier", "admin", "barista"]),
  WorkflowController.toMaking // (Hàm Controller vẫn giữ nguyên)
);

// 3. BARISTA: Bắt đầu pha chế (Chuyển sang trạng thái 'preparing')
// PATCH /api/admin/workflow/:id/start-making
router.patch(
  "/:id/start-making", // 🔑 FIX: Đổi tên route sang start-making
  authorizeEmployee(["barista", "admin", "cashier"]),
  WorkflowController.completeByBarista // Giữ nguyên hàm Controller (cần đổi tên thành startMaking)
);

// 4. BARISTA: Hoàn tất pha chế (Chuyển sang trạng thái 'done')
// PATCH /api/admin/workflow/:id/complete-making
router.patch(
  "/:id/complete-making", // 🔑 FIX: Đổi tên route sang complete-making
  authorizeEmployee(["barista", "admin", "cashier"]),
  WorkflowController.completeByBarista
);

// 5. CASHIER: Chốt đơn/Thanh toán xong (Chuyển sang trạng thái 'completed' và trừ kho)
// PATCH /api/admin/workflow/:id/finalize
router.patch(
  "/:id/finalize", // 🔑 FIX: Đổi tên route sang finalize (Hành động cuối cùng)
  authorizeEmployee(["cashier", "admin", "barista"]),
  WorkflowController.done 
);

module.exports = router;