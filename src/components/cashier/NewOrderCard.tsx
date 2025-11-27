import { Order } from "@/types/order";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

interface NewOrderCardProps {
  order: Order;
  onConfirm: (orderId: number) => void;
  onViewDetails: (order: Order) => void;
}

export function NewOrderCard({ order, onConfirm, onViewDetails }: NewOrderCardProps) {
  const formatTime = (timeString?: string) => {
    if (!timeString) return "—";

    const d = new Date(timeString);
    if (isNaN(d.getTime())) return "—";

    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-card hover:shadow-lg transition-all">
      <div className="flex items-start justify-between mb-4 pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge className="bg-status-new text-white">Trạng thái: Đơn mới</Badge>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground mb-1">Order #{order.orderNumber}</p>
          <div className="flex items-center gap-1 text-accent text-sm">
            <Clock className="h-3 w-3" />
            <span className="font-medium">{formatTime(order.time as unknown as string)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-3 text-sm">
        <span className="font-medium">
          {order.type ?? "Take-away"}
        </span>
      </div>

<div className="space-y-2 mb-4">
  {order.items.length === 0 && (
    <p className="text-xs text-muted-foreground">Không có sản phẩm</p>
  )}

  {order.items.map((item, idx) => (
    <div key={idx} className="text-sm">
      <p className="font-medium">
        {item.name ?? "Không rõ sản phẩm"} x{item.quantity}
      </p>
      <p className="text-xs text-muted-foreground">
        {item.price.toLocaleString("vi-VN")}₫
      </p>
    </div>
  ))}
</div>


      <div className="mb-4 pt-3 border-t border-border">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Tổng cộng:</span>
          <span className="text-accent text-xl font-bold">
            {order.total.toLocaleString("vi-VN")}₫
          </span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground"
          onClick={() => onConfirm(order.id)}
        >
          XÁC NHẬN ĐƠN
        </Button>
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onViewDetails(order)}
        >
          XEM CHI TIẾT
        </Button>
      </div>
    </div>
  );
}
