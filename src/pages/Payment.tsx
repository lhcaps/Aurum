import { useState } from "react";
import { useOrders } from "@/contexts/OrderContext";
import { PaymentScreen } from "@/components/cashier/PaymentScreen";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

export default function Payment() {
  const { orders, completePayment } = useOrders();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const pendingPaymentOrders = orders.filter((order) => order.status === "processing");
  const selectedOrder = orders.find((order) => order.id === selectedOrderId);

  const handleCompletePayment = (paymentMethod: any, customerPaid: number) => {
    if (selectedOrderId) {
      completePayment(selectedOrderId, paymentMethod, customerPaid);
      setSelectedOrderId(null);
      toast.success("Thanh toán thành công!");
    }
  };

  if (selectedOrder) {
    return (
      <div className="p-6">
        <PaymentScreen
          order={selectedOrder}
          onComplete={handleCompletePayment}
          onCancel={() => setSelectedOrderId(null)}
        />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Chờ thanh toán</h1>
        <p className="text-sm text-muted-foreground">Chọn đơn hàng để thanh toán</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pendingPaymentOrders.map((order) => (
          <button
            key={order.id}
            onClick={() => setSelectedOrderId(order.id)}
            className="text-left p-5 bg-card border border-border rounded-xl hover:border-accent transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-warning text-white">Chờ thanh toán</Badge>
              <span className="text-accent font-semibold">#{order.orderNumber}</span>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map((item, idx) => (
                <p key={idx} className="text-sm">
                  {item.name} ({item.size})
                </p>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border">
              <span className="text-muted-foreground text-sm">Tổng:</span>
              <span className="text-accent text-lg font-bold">
                {order.total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </button>
        ))}
      </div>

      {pendingPaymentOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có đơn hàng chờ thanh toán</p>
        </div>
      )}
    </div>
  );
}
