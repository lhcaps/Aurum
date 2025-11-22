import { OrderCard } from "@/components/OrderCard";
import { useState } from "react";
import { OrderDetailModal } from "@/components/OrderDetailModal";

export function OrderBoard({ orders, onUpdateStatus }) {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {orders.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            onStatusChange={onUpdateStatus}
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
