import axios from "axios";

// ============================================================
// 🌐 API CONFIG
// ============================================================
const baseURL =
  import.meta.env.VITE_API_BASE_URL?.trim() || "http://localhost:3000/api";

console.log("🌍 API Base URL:", baseURL);

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// ============================================================
// 🔐 Request Interceptor - tự động chèn JWT token
// ============================================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// ♻️ Refresh Token Handler
// ============================================================
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("Missing refresh token");

  const response = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
  const newAccessToken = response.data?.accessToken;

  if (newAccessToken) {
    localStorage.setItem("accessToken", newAccessToken);
    console.log("🔄 Access token refreshed!");
    return newAccessToken;
  } else {
    throw new Error("Invalid refresh response");
  }
};

// ============================================================
// ⚠️ Response Interceptor - xử lý lỗi & refresh token tự động
// ============================================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    // Nếu token hết hạn (401 Unauthorized)
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        try {
          const newToken = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();
        processQueue(null, newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        console.warn("🚫 Refresh token failed, logging out...");

        // ✅ Logout dứt khoát, không delay
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/auth/login";

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    // 🚨 Lỗi mạng hoặc backend
    if (!error.response) {
      console.error("🚫 Không thể kết nối server. Kiểm tra backend!");
    } else {
      const message = error.response?.data?.error || error.message;
      console.error(`❌ API Error [${status}]: ${message}`);
    }

    return Promise.reject(error);
  }
);

// ============================================================
// 📤 Export Axios Instance
// ============================================================
export default api;
