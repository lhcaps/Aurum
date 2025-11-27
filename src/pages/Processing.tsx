import { useEffect } from "react";
import { useOrders } from "@/contexts/OrderContext";
import { Badge } from "@/components/ui/badge";

export default function Processing() {
  const { orders, refreshOrders } = useOrders();

  // 🚀 FIX QUAN TRỌNG: Tải dữ liệu ngay khi mở trang
  useEffect(() => {
    refreshOrders();
  }, []);

const processingOrders = orders.filter((order) =>
  ["preparing", "brewing"].includes(order.status)
);

  const formatTime = (timeString: string) => {
    if (!timeString) return "—";
    return timeString;
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Đang pha</h1>
        <p className="text-sm text-muted-foreground">Các đơn hàng đang được thực hiện</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {processingOrders.map((order) => (
          <div
            key={order.id}
            className="p-5 bg-card border border-border rounded-xl"
          >
            <div className="flex items-center justify-between mb-3">
              <Badge className="bg-status-brewing text-white">Đang pha</Badge>
              <span className="text-accent font-semibold">#{order.orderNumber}</span>
            </div>
            <div className="space-y-1 mb-3">
              {order.items.map((item, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium">
                    {item.name} ({item.size})
                  </p>
                  {item.toppings && item.toppings.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      + {item.toppings.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between items-center pt-3 border-t border-border text-sm">
              <span className="text-muted-foreground">
                {formatTime(order.time as unknown as string)}
              </span>
              <span className="text-accent font-semibold">
                {order.total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>
        ))}
      </div>

      {processingOrders.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Không có đơn hàng đang pha</p>
        </div>
      )}
    </div>
  );
}
