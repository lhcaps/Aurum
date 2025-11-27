import { OrderCard } from "@/components/OrderCard";
import { useState } from "react";
import { OrderDetailModal } from "@/components/OrderDetailModal";

// 1. FIX: Thêm onStatusChange vào danh sách props (Signature)
export function OrderBoard({ orders, onUpdateStatus, onStatusChange }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            // 2. FIX: Truyền hàm onStatusChange chính xác xuống OrderCard
            onStatusChange={onStatusChange}
            onViewDetails={(o) => {
              setSelectedOrder(o);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </>
  );
}