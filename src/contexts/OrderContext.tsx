import { createContext, useContext, useEffect, useState } from "react";
import api from "@/lib/api";

interface OrderContextType {
  orders: any[];
  loadOrders: () => void;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  loadOrders: () => {},
});

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<any[]>([]);

  // ============================================
  // HÀM LOAD ĐƠN HÀNG TỪ BACKEND
  // ============================================
  const loadOrders = async () => {
    try {
      const res = await api.get("/api/pos/orders/");
      setOrders(res.data.data);
    } catch (err) {
      console.log("LOAD ORDER ERROR:", err);
    }
  };

  // ============================================
  // AUTO-REFRESH 3 GIÂY
  // ============================================
  useEffect(() => {
    loadOrders(); // load ngay lần đầu
    const timer = setInterval(loadOrders, 3000);
    return () => clearInterval(timer);
  }, []);

  return (
    <OrderContext.Provider value={{ orders, loadOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
