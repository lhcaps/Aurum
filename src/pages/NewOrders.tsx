import { useState, useEffect } from "react";
import { NewOrderCard } from "@/components/cashier/NewOrderCard";
import { OrderDetailsModal } from "@/components/cashier/OrderDetailsModal";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { fetchNewOrders } from "@/services/order.service";
import api from "@/lib/api";

export default function NewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true); // chỉ dùng cho lần đầu
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ================================
  // LOAD ORDERS (NO LOADING AFTER FIRST TIME)
  // ================================
  const loadOrders = async (isInitial = false) => {
    if (isInitial) setLoading(true);

    try {
      const data = await fetchNewOrders();

      if (!Array.isArray(data)) {
        console.warn("Invalid data format from API", data);
        setOrders([]);
        return;
      }

      setOrders(data);
    } catch (err) {
      console.error("Lỗi load orders:", err);
      toast.error("Không thể tải danh sách đơn hàng");
      setOrders([]);
    } finally {
      if (isInitial) setLoading(false);
    }
  };

  // Chỉ loading lần đầu
  useEffect(() => {
    loadOrders(true);
  }, []);

  // ================================
  // SEND TO BARISTA (NO UI RELOAD)
  // ================================
  const handleConfirmOrder = async (orderId: number | string) => {
    try {
      await api.post(`/api/pos/orders/send/${orderId}`);
      toast.success("Đơn hàng đã được gửi sang Barista!");

      // Refresh nhưng không bật loading
      loadOrders();
    } catch (err: any) {
      console.error("SEND ERROR:", err);
      toast.error("Không thể gửi đơn hàng");
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Đơn hàng mới</h1>
        <p className="text-sm text-muted-foreground">
          Các đơn hàng đang chờ xử lý tại quầy thu ngân
        </p>
      </div>

      {/* LOADING */}
      {loading && (
        <div className="text-center py-10 text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      )}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có đơn hàng mới</p>
        </div>
      )}

      {/* LIST */}
      {!loading && orders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <NewOrderCard
              key={order.id}
              order={order}
              onConfirm={() => handleConfirmOrder(order.id)}
              onViewDetails={() => handleViewDetails(order)}
            />
          ))}
        </div>
      )}

      {/* MODAL */}
      <OrderDetailsModal
        order={selectedOrder}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={() =>
          selectedOrder && handleConfirmOrder(selectedOrder.id)
        }
      />
    </div>
  );
}
