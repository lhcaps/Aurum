import { useState, useEffect } from "react";
import { NewOrderCard } from "@/components/cashier/NewOrderCard";
import { OrderDetailsModal } from "@/components/cashier/OrderDetailsModal";
import { Order } from "@/types/order";
import { toast } from "sonner";
import { fetchNewOrders } from "@/services/order.service";
import api from "@/lib/api"; // để gọi send-to-barista

export default function NewOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // ================================
  // LOAD DỮ LIỆU TỪ BACKEND
  // ================================
  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchNewOrders(); // GET /api/pos/orders
      setOrders(data);
    } catch (err) {
      console.log("Lỗi load orders:", err);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();

    const interval = setInterval(loadOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  // ================================
  // GỬI ĐƠN HÀNG SANG BARISTA
  // ================================
  const handleConfirmOrder = async (orderId: number | string) => {
    try {
      await api.post(`/api/pos/send/${orderId}`);
      toast.success("Đơn hàng đã được gửi sang Barista!");

      loadOrders(); // refresh danh sách
    } catch (err) {
      console.log("SEND ERROR:", err);
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

      {/* LIST */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {orders.map((order) => (
            <NewOrderCard
              key={order.id}
              order={order}
              onConfirm={() => handleConfirmOrder(Number(order.id))}
              onViewDetails={() => handleViewDetails(order)}
            />
          ))}
        </div>

      )}

      {/* EMPTY */}
      {!loading && orders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có đơn hàng mới</p>
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
