import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "@/lib/api";

/**
 * =============================================================
 * 🧩 ProtectedRoute (Stable Production Version)
 * -------------------------------------------------------------
 * ✅ Kiểm tra accessToken & refreshToken
 * ✅ Tự refresh token khi hết hạn
 * ✅ Chỉ redirect nếu refresh thật sự thất bại
 * ✅ Không logout khi chỉ lỗi mạng tạm thời
 * =============================================================
 */

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");

      // ❌ Không có token → redirect về login
      if (!accessToken && !refreshToken) {
        setAuthorized(false);
        return;
      }

      try {
        // 🟢 Kiểm tra token hợp lệ bằng /auth/profile
        await api.get("/auth/profile");
        setAuthorized(true);
      } catch (err: any) {
        const status = err.response?.status;

        // ⚠️ Nếu token hết hạn → thử refresh
        if (status === 401 && refreshToken) {
          try {
            const res = await api.post("/auth/refresh", { refreshToken });
            const newAccessToken = res.data?.accessToken;

            if (newAccessToken) {
              localStorage.setItem("accessToken", newAccessToken);
              console.log("🔄 Token refreshed thành công");
              setAuthorized(true);
              return;
            }
          } catch (refreshErr) {
            console.warn("🚫 Refresh token failed:", refreshErr);
          }
        }

        // ❌ Nếu refresh cũng fail → xoá dữ liệu & redirect
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        setAuthorized(false);
      }
    };

    checkAuth();
  }, []);

  // 🕓 Loading khi đang xác thực
  if (authorized === null) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang xác thực phiên đăng nhập...
      </div>
    );
  }

  // 🚪 Chưa đăng nhập → redirect
  if (!authorized) {
    return <Navigate to="/auth/login" replace />;
  }

  // ✅ Token hợp lệ → render children
  return <>{children}</>;
}
