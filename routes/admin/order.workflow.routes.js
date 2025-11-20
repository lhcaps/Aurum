const express = require("express");
const router = express.Router();
const { authenticateJWT, authorizeAdmin } = require("../../middleware/auth.middleware");
const WorkflowController = require("../../controllers/admin/order.workflow.controller");

// Bảo vệ route
router.use(authenticateJWT);
router.use(authorizeAdmin);

// Cashier nhận đơn
router.patch("/:id/accept", WorkflowController.accept);

// Cashier gửi sang barista
router.patch("/:id/to-making", WorkflowController.toMaking);

// Barista hoàn thành pha chế
router.patch("/:id/complete-by-barista", WorkflowController.completeByBarista);

// Cashier chốt đơn & trừ kho
router.patch("/:id/done", WorkflowController.done);

module.exports = router;
