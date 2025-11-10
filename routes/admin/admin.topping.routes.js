const express = require("express");
const { authenticateJWT, authorizeAdmin } = require("../../middleware/auth.middleware");
const AdminToppingController = require("../../controllers/admin/admin.topping.controller");

const router = express.Router();

// Lấy tất cả topping
router.get("/", authenticateJWT, authorizeAdmin, AdminToppingController.getAll);

// Thêm topping
router.post("/", authenticateJWT, authorizeAdmin, AdminToppingController.addItem);

// Cập nhật topping
router.put("/:id", authenticateJWT, authorizeAdmin, AdminToppingController.updateItem);

// Xóa topping
router.delete("/:id", authenticateJWT, authorizeAdmin, AdminToppingController.deleteItem);

module.exports = router;
