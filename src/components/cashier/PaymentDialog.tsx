import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useOrders } from "@/contexts/OrderContext";
import { useNavigate } from "react-router-dom"; // Dùng để chuyển hướng

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: any; // Sử dụng OrderType nếu đã định nghĩa
}

const paymentMethods = [
  { id: "cash", label: "Tiền mặt" },
  { id: "momo", label: "MoMo" },
  { id: "bank_transfer", label: "Chuyển khoản" },
];

const formatVND = (value: number) =>
  value.toLocaleString("vi-VN", { style: "currency", currency: "VND" });

export function PaymentDialog({ isOpen, onClose, order }: PaymentDialogProps) {
  const { completePayment } = useOrders();
  const navigate = useNavigate();
  
  const [selectedMethod, setSelectedMethod] = useState("cash");
  // Khách đưa mặc định bằng tổng tiền (hoặc 0 nếu không có order)
  const [customerPaid, setCustomerPaid] = useState(order?.total || 0); 
  const [loading, setLoading] = useState(false);

  const changeDue = (customerPaid || 0) - (order?.total || 0);

  // 🔑 HÀM XỬ LÝ THANH TOÁN
  const handlePayment = async () => {
    if (!order || !order.id) {
        toast.error("Không tìm thấy thông tin đơn hàng!");
        return;
    }
    
    // Giả định order.id từ DirectSales là dạng 'order-1764096881518'
    // Bạn cần trích xuất ID dạng number nếu API yêu cầu
    const orderId = Number(order.orderNumber); 

    setLoading(true);
    try {
        await completePayment(orderId, selectedMethod, customerPaid);
        toast.success(`Thanh toán đơn hàng #${order.orderNumber} thành công!`);
        onClose();
        
        // 🔑 CHUYỂN HƯỚNG ĐẾN LỊCH SỬ GIAO DỊCH SAU KHI THANH TOÁN
        navigate("/history"); 
    } catch (error) {
        console.error("Lỗi thanh toán:", error);
        toast.error("Thanh toán thất bại, vui lòng kiểm tra lại.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Thanh toán Đơn hàng #{order?.orderNumber}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
            <div className="text-lg font-bold text-center">
                Tổng tiền: <span className="text-primary">{formatVND(order?.total || 0)}</span>
            </div>

            {/* Phương thức thanh toán */}
            <div className="space-y-2">
                <Label className="font-semibold">Phương thức thanh toán</Label>
                <RadioGroup value={selectedMethod} onValueChange={setSelectedMethod} className="flex gap-4">
                    {paymentMethods.map(method => (
                        <div key={method.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={method.id} id={method.id} />
                            <Label htmlFor={method.id}>{method.label}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </div>

            {/* Khách đưa (Chỉ cho Tiền mặt) */}
            {selectedMethod === 'cash' && (
                <div className="space-y-2">
                    <Label htmlFor="customer-paid" className="font-semibold">Khách đưa</Label>
                    <Input
                        id="customer-paid"
                        type="number"
                        value={customerPaid}
                        onChange={(e) => setCustomerPaid(Number(e.target.value))}
                        placeholder="Số tiền khách đưa"
                    />
                </div>
            )}
            
            {/* Tiền thừa */}
            {selectedMethod === 'cash' && (
                <div className="text-xl font-bold text-right pt-2 border-t">
                    Tiền thừa: <span className={changeDue >= 0 ? "text-success" : "text-destructive"}>{formatVND(Math.max(0, changeDue))}</span>
                </div>
            )}
        </div>

        <DialogFooter>
          <Button onClick={handlePayment} disabled={loading || (selectedMethod === 'cash' && changeDue < 0)} className="w-full" size="lg">
            {loading ? "Đang xử lý..." : `Hoàn tất Thanh toán (${formatVND(order?.total || 0)})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}