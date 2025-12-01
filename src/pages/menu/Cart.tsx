import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/profile-ui/button";
import { Textarea } from "@/components/profile-ui/textarea";
import { useNavigate } from "react-router-dom";

// ✅ Hàm định dạng tiền tệ VNĐ
const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

export default function Cart() {
  const { items, updateQuantity, updateNote, removeItem, subtotal, totalItems } =
    useCart();
  const navigate = useNavigate();

  if (totalItems === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
            <img
              src="https://illustrations.popsy.co/amber/empty-state.svg"
              alt="Empty cart"
              className="w-24 h-24"
            />
          </div>
          <h2 className="text-2xl font-bold mb-2 text-foreground">
            Giỏ hàng trống
          </h2>
          <p className="text-muted-foreground mb-6">
            Hãy thêm sản phẩm vào giỏ hàng để tiếp tục
          </p>
          <Button
            onClick={() => navigate("/menu")}
            className="bg-gradient-primary text-primary-foreground rounded-xl"
          >
            Khám phá menu
          </Button>
        </div>
      </div>
    );
  }

  // ✅ Phí dịch vụ cố định (có thể đổi theo % hoặc động)
  const serviceFee = 10000;
  const total = subtotal + serviceFee;

  return (
    <div className="min-h-screen bg-background">
      <div className="w-full px-6 py-8">
        <div className="space-y-6">

          {items.map((item) => (
            <div key={item.id} className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex gap-4">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 rounded-xl object-cover"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg text-card-foreground">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Size: {item.size}
                      </p>
                      {item.toppings?.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                          Topping: {item.toppings.join(", ")}
                        </p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeItem(item.id)}
                      className="text-destructive hover:bg-destructive/10 rounded-xl"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>

                  {/* Số lượng + Giá */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-3">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="rounded-xl"
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="font-bold text-lg w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        className="rounded-xl"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <span className="text-xl font-bold text-primary">
                      {formatVND(item.price * item.quantity)}
                    </span>
                  </div>

                  {/* Ghi chú */}
                  <div className="mt-4">
                    <Textarea
                      placeholder="Ghi chú cho món này..."
                      value={item.note || ""}
                      onChange={(e) => updateNote(item.id, e.target.value)}
                      className="resize-none rounded-xl"
                      rows={2}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Summary */}
        <div className="mt-8 bg-card rounded-2xl p-6 shadow-medium sticky bottom-0">
          <div className="space-y-3 mb-6">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-semibold">{formatVND(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phí dịch vụ</span>
              <span className="font-semibold">+{formatVND(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold pt-3 border-t">
              <span>Tổng cộng</span>
              <span className="text-primary">{formatVND(total)}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate("/menu/checkout")}
            className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-xl h-14 text-lg font-semibold shadow-medium"
          >
            Tiến hành thanh toán
          </Button>
        </div>
      </div>
    </div>
  );
}
