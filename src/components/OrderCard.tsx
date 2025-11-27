import { Clock, MapPin, User, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type OrderStatus = "new" | "brewing" | "done";

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  type: "takeaway" | "delivery";
  status: OrderStatus;
  time: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    notes?: string;
  }>;
  notes?: string;
}

interface OrderCardProps {
  order: Order;
  onStatusChange?: (orderId: string, newStatus: OrderStatus) => void;
  onViewDetails?: (order: Order) => void;
}

const statusConfig = {
  new: {
    label: "ĐƠN MỚI",
    bg: "bg-status-new",
    text: "text-status-new-foreground",
    border: "border-status-new",
  },
  brewing: {
    label: "ĐANG PHA",
    bg: "bg-status-brewing",
    text: "text-status-brewing-foreground",
    border: "border-status-brewing",
  },
  done: {
    label: "HOÀN TẤT",
    bg: "bg-status-done",
    text: "text-status-done-foreground",
    border: "border-status-done",
  },
};

export const OrderCard = ({ order, onStatusChange, onViewDetails }: OrderCardProps) => {
  const config = statusConfig[order.status];

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-md cursor-pointer",
        `border-l-4 ${config.border}`
      )}
      onClick={() => onViewDetails?.(order)}
    >
      <CardHeader className={cn("py-3 px-4", config.bg)}>
        <div className="flex items-center justify-between">
          <Badge className={cn("font-bold", config.bg, config.text)}>
            {config.label}
          </Badge>
          <span className="text-sm font-medium">{order.orderNumber}</span>
        </div>
      </CardHeader>

      <CardContent className="p-4 space-y-3">
        {/* Order Type & Customer */}
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="outline" className="gap-1">
            <MapPin className="w-3 h-3" />
            {order.type === "takeaway" ? "Take-away" : "Delivery"}
          </Badge>
          <span className="text-muted-foreground">•</span>
          <span className="font-medium">{order.customerName}</span>
        </div>

        {/* Items */}
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="text-sm">
              <div className="flex justify-between">
                <span className="font-medium">
                  {item.name} ({item.size}) {/* ĐÃ SỬA: Xóa chữ "Ghi chú:" thừa */}
                </span>
                <span className="text-muted-foreground">x{item.quantity}</span>
              </div>
              {item.notes && (
                <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                  <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                  {item.notes}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
              {order.notes}
            </p>
          </div>
        )}

        {/* Time */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {order.time}
        </div>

        {/* Actions */}
        <div className="pt-2 flex gap-2">
          {order.status === "new" && (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(order);
                }}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Xem công thức
              </Button>

              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  // CẬP NHẬT: Chuyển trạng thái từ "new" sang "brewing" (Đang pha chế)
                  onStatusChange?.(order.id, "brewing");
                }}
                // CẬP NHẬT: Đổi màu sắc (Ví dụ dùng màu Brewing hoặc màu vàng/cam)
                className="flex-1 bg-status-brewing hover:bg-status-brewing/90 text-status-brewing-foreground"
                size="sm"
              >
                Xác nhận {/* CẬP NHẬT: Đổi nhãn thành "Xác nhận" */}
              </Button>
            </>
          )}

          {order.status === "brewing" && (
            <>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(order);
                }}
                variant="outline"
                className="flex-1"
                size="sm"
              >
                Xem công thức
              </Button>
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusChange?.(order.id, "done");
                }}
                className="flex-1 bg-status-done hover:bg-status-done/90 text-status-done-foreground"
                size="sm"
              >
                Xác nhận
              </Button>
            </>
          )}
          {order.status === "done" && (
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(order);
              }}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              Xem chi tiết
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};