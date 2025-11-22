import { Order } from "@/types/order";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OrderDetailsModalProps {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onConfirm?: () => void;
}

export function OrderDetailsModal({ order, open, onClose, onConfirm }: OrderDetailsModalProps) {
  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-border">
        <DialogHeader>
          <DialogTitle className="text-center text-accent text-xl">
            XÁC NHẬN ĐƠN (#{order.orderNumber})
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Sản phẩm:</span>
              <span className="font-medium">
                {order.items[0].name} ({order.items[0].size})
              </span>
            </div>

            {order.items[0].toppings && order.items[0].toppings.length > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Topping:</span>
                <span className="text-accent">{order.items[0].toppings.join(", ")}</span>
              </div>
            )}

            {order.items[0].notes && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span>{order.items[0].notes}</span>
              </div>
            )}

            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Hình thức:</span>
              <span>{order.type === "take-away" ? "Take-away" : "Dine-in"}</span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-border">
              <span className="text-muted-foreground">Tổng tiền:</span>
              <span className="text-accent text-xl font-bold">
                {order.total.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-3">
              Barista nhận đơn trong: <span className="text-warning font-medium">3 giây</span>
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-accent text-accent hover:bg-accent hover:text-accent-foreground uppercase font-medium"
            onClick={() => {
              if (onConfirm) onConfirm();
              onClose();
            }}
          >
            Gửi cho Barista
          </Button>
          <Button
            variant="outline"
            className="flex-1 uppercase font-medium"
            onClick={onClose}
          >
            Hủy
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
