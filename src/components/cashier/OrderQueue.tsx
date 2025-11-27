import { useOrders } from "@/contexts/OrderContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, Check, Coffee } from "lucide-react";

export function OrderQueue() {
  const { orders } = useOrders();

  // Dùng cùng dữ liệu với Processing.tsx
  const workflowOrders = orders.filter((order) =>
    ["waiting", "preparing", "brewing", "processing"].includes(order.status)
  );

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "waiting":
        return { label: "Chờ pha", color: "bg-blue-500 text-white" };
      case "preparing":
        return { label: "Chuẩn bị", color: "bg-yellow-500 text-white" };
      case "brewing":
        return { label: "Đang pha", color: "bg-amber-600 text-white" };
      case "processing":
        return { label: "Đang xử lý", color: "bg-lime-600 text-white" };
      default:
        return { label: status, color: "bg-gray-500 text-white" };
    }
  };

  return (
    <aside className="w-72 border-l border-border bg-card">
      <div className="p-4 border-b">
        <h2 className="font-bold text-lg flex justify-between items-center">
          Đang pha chế
          <Badge className="bg-amber-600 text-white">
            {workflowOrders.length}
          </Badge>
        </h2>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-3">
          {workflowOrders.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Không có đơn đang pha
            </p>
          )}

          {workflowOrders.map((order) => {
            const config = getStatusConfig(order.status);

            return (
              <div
                key={order.id}
                className="p-3 bg-secondary rounded-lg border space-y-2"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold">#{order.orderNumber}</span>
                  <Badge className={config.color}>{config.label}</Badge>
                </div>

                <div className="space-y-1">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {item.quantity}x {item.name}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </aside>
  );
}
