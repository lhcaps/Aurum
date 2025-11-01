import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { Toaster } from "@/components/ui/toaster";
import { testApiConnection } from "@/lib/utils";
import { CartProvider } from "@/contexts/CartContext"; // ✅ thêm dòng này

if (import.meta.env.DEV) {
  testApiConnection();
}

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("❌ Không tìm thấy phần tử #root trong index.html!");
  throw new Error("Root element missing!");
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* ✅ Đặt CartProvider bao quanh toàn app */}
    <CartProvider>
      <App />
      <Toaster />
    </CartProvider>
  </React.StrictMode>
);
