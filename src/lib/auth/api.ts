// =============================================================
// 🔐 Axios API Instance - Phúc Long App
// -------------------------------------------------------------
// ✅ Tự động gắn Bearer token cho mỗi request
// ✅ Tự động thử refresh token khi gặp 401 Unauthorized
// ✅ Dùng chung cho ProtectedRoute và toàn bộ app
// =============================================================

import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

// 🧩 Request Interceptor: thêm Authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🛡 Response Interceptor: tự refresh khi 401
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function onRefreshed(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh → chờ token mới
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("Không có refreshToken!");

        const res = await axios.post("http://localhost:3000/api/auth/refresh", {
          refreshToken,
        });

        const newAccessToken = res.data?.accessToken;
        if (!newAccessToken) throw new Error("Refresh thất bại");

        // Lưu lại token mới
        localStorage.setItem("accessToken", newAccessToken);
        onRefreshed(newAccessToken);
        isRefreshing = false;

        // Thử lại request cũ
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        console.error("🚫 Refresh token thất bại:", err);
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        isRefreshing = false;
        window.location.href = "/auth/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
