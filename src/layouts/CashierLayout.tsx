import { Outlet } from "react-router-dom";
import { CashierHeader } from "@/components/cashier/CashierHeader";
import { CashierSidebar } from "@/components/cashier/CashierSidebar";
import { OrderQueue } from "@/components/cashier/OrderQueue";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/contexts/OrderContext";

import { useState, useEffect } from "react";

// Kiểu employee
interface EmployeeInfo {
  name: string;
}

export function CashierLayout() {
  const { signOut } = useAuth();
  const { refreshOrders } = useOrders();

  const [cashierName, setCashierName] = useState("Đang tải...");
  const [ordersLoaded, setOrdersLoaded] = useState(false); // ⬅ quan trọng

  // -------------------------------------------------------
  // 1. Lấy tên nhân viên từ localStorage
  // -------------------------------------------------------
  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("user") ||
        localStorage.getItem("employee");

      if (stored) {
        const obj: EmployeeInfo = JSON.parse(stored);
        setCashierName(obj.name || "Không tìm thấy tên");
      } else {
        setCashierName("Chưa đăng nhập");
      }
    } catch (err) {
      console.error("Lỗi đọc employee:", err);
      setCashierName("Lỗi dữ liệu");
    }
  }, []);

  // -------------------------------------------------------
  // 2. Load danh sách orders TRƯỚC KHI render layout
  // -------------------------------------------------------
  useEffect(() => {
    const load = async () => {
      await refreshOrders();     // ⬅ tải đơn từ POS + Barista
      setOrdersLoaded(true);     // ⬅ sau khi có đơn → cho phép render
    };
    load();
  }, []);

  // -------------------------------------------------------
  // 3. Chặn render khi chưa load orders
  // -------------------------------------------------------
  if (!ordersLoaded) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Đang tải dữ liệu đơn hàng...
      </div>
    );
  }

  // -------------------------------------------------------
  // 4. Render Layout đầy đủ sau khi data có mặt
  // -------------------------------------------------------
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      
      <CashierHeader
        onLogout={signOut}
        cashierName={cashierName}
      />

      <div className="flex-1 flex overflow-hidden">

        <CashierSidebar />

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>

        <OrderQueue />
      </div>
    </div>
  );
}
