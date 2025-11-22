import { useOrders } from "@/contexts/OrderContext";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function OrderQueue() {
  const { orders } = useOrders();

  const processingOrders = orders.filter((order) => order.status === "processing");

  return (
    <aside className="w-72 border-l border-border bg-card">
      <div className="p-4 border-b border-border">
        <h2 className="font-semibold text-sm text-success">Đơn đang xử lý</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="p-4 space-y-3">
          {processingOrders.map((order) => (
            <div
              key={order.id}
              className="p-3 bg-secondary rounded-lg border border-border space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-accent font-semibold">#{order.orderNumber}</span>
                <Badge variant="outline" className="border-accent text-accent text-xs">
                  {order.status === "processing" ? "Đang pha" : "Chờ thanh toán"}
                </Badge>
              </div>
              <div className="space-y-1">
                {order.items.map((item, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    {item.quantity}x {item.name} ({item.size})
                  </p>
                ))}
              </div>
            </div>
          ))}
          {processingOrders.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              Không có đơn đang xử lý
            </p>
          )}
        </div>
      </ScrollArea>
    </aside>
  );
}
