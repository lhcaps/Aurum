import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// ===============================
// ADD TOKEN AUTOMATICALLY
// ===============================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  console.log("[AXIOS] Sending request:");
  console.log("URL:", config.baseURL + config.url);
  console.log("Method:", config.method);
  console.log("Token found:", token ? "YES" : "NO");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
