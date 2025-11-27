// =============================================================
// 🧩 Middleware: JWT Authentication & Authorization
// -------------------------------------------------------------
// ✅ Xác thực người dùng qua JWT
// ✅ Hỗ trợ nhiều role: admin, Master
// ✅ Ghi log chi tiết để debug
// =============================================================

require("dotenv").config();
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || JWT_SECRET;

// =============================================================
// 🧱 Middleware xác thực người dùng (authenticateJWT)
// -------------------------------------------------------------
function authenticateJWT(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) {
        console.warn("❌ Auth Failed: No token provided");
        return res.status(401).json({ error: "No token provided" });
    }

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token) {
        console.warn("❌ Auth Failed: Invalid token format");
        return res.status(401).json({ error: "Invalid token format" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    // 🔑 FIX: Chuẩn hóa trường ID từ token (decoded.id) thành req.user.userId
    req.user = { 
        userId: decoded.id || decoded.userId, // Ưu tiên decoded.id (thường là JWT), fallback về decoded.userId
        ...decoded 
    }; 

    console.log(`✅ JWT Auth Success: User ID ${req.user.userId} authenticated.`);

    next();
  } catch (err) {
    // 🔑 FIX: Xử lý lỗi hết hạn token (TokenExpiredError)
    if (err.name === "TokenExpiredError") {
        console.error("❌ Auth Failed: Token expired.");
        return res.status(401).json({ error: "Token expired" });
    }
    
    console.error("❌ Auth Failed: Invalid JWT or other error.", err.message);
    return res.status(401).json({ error: "Unauthorized token" });
  }
}


// =============================================================
// 🧱 Middleware xác thực token dành riêng cho admin
// -------------------------------------------------------------
function authenticateAdminJWT(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ error: "No token provided" });

    const [type, token] = header.split(" ");
    if (type !== "Bearer" || !token)
      return res.status(401).json({ error: "Invalid token format" });

    const decoded = jwt.verify(token, ADMIN_JWT_SECRET);

    if (!decoded?.role) return res.status(401).json({ error: "Invalid admin token" });

    // 🔑 FIX: Chuẩn hóa trường ID
    req.user = { 
        userId: decoded.id || decoded.userId, 
        ...decoded 
    }; 

    console.log(`✅ Admin Auth Success: User ID ${req.user.userId} authenticated.`);

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ error: "Admin token expired" });

    return res.status(401).json({ error: "Unauthorized admin" });
  }
}

// =============================================================
// 🧱 Middleware kiểm tra quyền admin/master (authorizeAdmin)
// -------------------------------------------------------------
function authorizeAdmin(req, res, next) {
  if (!req.user) {
        console.warn("❌ Auth Failed: User object missing in req");
        return res.status(401).json({ error: "Not authenticated" });
    }

  const role = req.user.role?.toLowerCase();

  if (role !== "admin" && role !== "master") {
    console.warn(`❌ Auth Failed: User role '${role}' denied access.`);
    return res.status(403).json({ error: "Require admin or master role" });
  }
    console.log(`✅ Authorization Success: User ID ${req.user.userId} has role ${role}.`);
  next();
}


module.exports = { authenticateJWT, authenticateAdminJWT, authorizeAdmin };