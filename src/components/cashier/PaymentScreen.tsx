import { useState } from "react";
import { Order, PaymentMethod } from "@/types/order";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";

interface PaymentScreenProps {
  order: Order;
  onComplete: (paymentMethod: PaymentMethod, customerPaid: number) => void;
  onCancel: () => void;
}

export function PaymentScreen({ order, onComplete, onCancel }: PaymentScreenProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [customerPaid, setCustomerPaid] = useState<string>("");

  const customerPaidNum = parseFloat(customerPaid) || 0;
  const change = customerPaidNum - order.total;

  const handleComplete = () => {
    if (paymentMethod === "cash" && customerPaidNum < order.total) {
      return;
    }
    onComplete(paymentMethod, customerPaidNum);
  };

  return (
    <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 shadow-card">
      <div className="mb-6 pb-4 border-b border-border">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-success text-success-foreground">ĐƠN CHỜ THANH TOÁN</Badge>
          <span className="text-accent font-semibold">(#{order.orderNumber})</span>
        </div>
      </div>

      <div className="space-y-6">
        {/* Order Items */}
        <div className="space-y-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-start">
              <div>
                <p className="font-medium">
                  {item.name} ({item.size})
                </p>
                {item.notes && <p className="text-sm text-muted-foreground">Ghi chú: {item.notes}</p>}
              </div>
              <p className="text-accent font-medium">{(item.price * item.quantity).toLocaleString("vi-VN")}₫</p>
            </div>
          ))}
          <div className="flex justify-between items-center pt-3 border-t border-border">
            <span className="font-semibold">Tổng cộng:</span>
            <span className="text-accent text-2xl font-bold">
              {order.total.toLocaleString("vi-VN")}₫
            </span>
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <Label className="mb-3 block">Phương thức thanh toán:</Label>
          <RadioGroup value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}>
            <div className="flex gap-3">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash" className="cursor-pointer">Tiền mặt</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank_transfer" id="bank" />
                <Label htmlFor="bank" className="cursor-pointer">Chuyển khoản</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="momo" id="momo" />
                <Label htmlFor="momo" className="cursor-pointer">MoMo</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="zalopay" id="zalopay" />
                <Label htmlFor="zalopay" className="cursor-pointer">ZaloPay</Label>
              </div>
            </div>
          </RadioGroup>
        </div>

        {/* Cash Payment Details */}
        {paymentMethod === "cash" && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="customerPaid" className="mb-2 block">
                Nhập số tiền khách đưa:
              </Label>
              <Input
                id="customerPaid"
                type="number"
                placeholder="100,000"
                value={customerPaid}
                onChange={(e) => setCustomerPaid(e.target.value)}
                className="text-lg font-medium"
              />
            </div>
            {customerPaidNum > 0 && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tiền thừa:</span>
                  <span className={`text-2xl font-bold ${change < 0 ? "text-destructive" : "text-success"}`}>
                    {change >= 0 ? change.toLocaleString("vi-VN") : "Không đủ"}₫
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Button
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground uppercase font-semibold text-base h-12"
            onClick={handleComplete}
            disabled={paymentMethod === "cash" && customerPaidNum < order.total}
          >
            Xác nhận thanh toán
          </Button>
          <Button
            variant="outline"
            className="flex-1 uppercase font-semibold text-base h-12"
            onClick={onCancel}
          >
            Hủy
          </Button>
        </div>
      </div>
    </div>
  );
}
