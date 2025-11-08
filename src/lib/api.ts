// =============================================================
// 🌐 API Configuration - PhucLong Admin Portal
// -------------------------------------------------------------
// ✅ Backend: http://localhost:3000
// ✅ Tích hợp tự động refresh token khi hết hạn
// ✅ Chuẩn hóa tất cả endpoint: /api/admin/...
// =============================================================

const BASE_URL = "http://localhost:3000/api";

interface ApiConfig {
  method: string;
  headers: Record<string, string>;
  body?: string;
}

// =============================================================
// 🧩 Helper: Gọi API có xử lý tự động refresh token
// =============================================================
export const apiCall = async (
  endpoint: string,
  options: ApiConfig = { method: "GET", headers: {} }
) => {
  const token = localStorage.getItem("admin_token");
  const refreshToken = localStorage.getItem("admin_refresh_token");

  const config: RequestInit = {
    method: options.method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  if (options.body) config.body = options.body;

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    // ⚠️ Nếu token hết hạn → thử refresh
    if (response.status === 401) {
      const errorBody = await response.json().catch(() => ({}));
      if (errorBody.error === "Token expired" && refreshToken) {
        const refreshed = await fetch(`http://localhost:3000/api/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        const data = await refreshed.json();

        if (data.ok && data.token) {
          console.info("♻️ Token refreshed successfully");
          localStorage.setItem("admin_token", data.token);
          // Gọi lại request cũ
          const retry = await fetch(`${BASE_URL}${endpoint}`, {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${data.token}`,
            },
          });
          if (!retry.ok) throw new Error("API retry failed");
          return await retry.json();
        } else {
          console.warn("⚠️ Refresh token failed, forcing logout");
          localStorage.removeItem("admin_token");
          localStorage.removeItem("admin_refresh_token");
          window.location.href = "/admin/login";
          throw new Error("Token expired, please login again");
        }
      }
    }

    // Xử lý lỗi khác
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error("❌ API Error Response:", error);
      throw new Error(error.error || error.message || "API call failed");
    }

    return await response.json();
  } catch (error) {
    console.error("🔥 API Error:", error);
    throw error;
  }
};

// =============================================================
// 🔐 AUTH (Admin Login / Logout)
// =============================================================
export const authApi = {
  login: async (email: string, password: string) => {
    const res = await apiCall("/auth/login", {
      method: "POST",
      headers: {},
      body: JSON.stringify({ email, password }),
    });

    if (res.accessToken) {
      localStorage.setItem("admin_token", res.accessToken);
      if (res.refreshToken)
        localStorage.setItem("admin_refresh_token", res.refreshToken);
    }


    return res;
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh_token");
  },
};

// =============================================================
// ☕ PRODUCT MANAGEMENT
// =============================================================
export const productApi = {
  getAll: async () => apiCall("/products", { method: "GET", headers: {} }),
  getById: async (id: string) =>
    apiCall(`/products/${id}`, { method: "GET", headers: {} }),
  create: async (data: any) =>
    apiCall("/products", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {},
    }),
  update: async (id: string, data: any) =>
    apiCall(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      headers: {},
    }),
  delete: async (id: string) =>
    apiCall(`/products/${id}`, { method: "DELETE", headers: {} }),
};

// =============================================================
// 🧾 ORDER MANAGEMENT
// =============================================================
export const orderApi = {
  getAll: async (status?: string) => {
    const query = status && status !== "all" ? `?status=${status}` : "";
    return apiCall(`/orders${query}`, { method: "GET", headers: {} });
  },
  getById: async (id: string) =>
    apiCall(`/orders/${id}`, { method: "GET", headers: {} }),
  updateStatus: async (id: string, status: string) =>
    apiCall(`/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: {},
    }),
};

// =============================================================
// 📊 DASHBOARD / STATS
// =============================================================
export const statsApi = {
  getDashboard: async () =>
    apiCall("/dashboard", { method: "GET", headers: {} }),
  getRevenue: async (period: string = "month") =>
    apiCall(`/revenue?period=${period}`, { method: "GET", headers: {} }),
};
