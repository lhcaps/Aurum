import { useState, useEffect } from "react";
import { MapPin, Wallet, CreditCard, Gift } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/profile-ui/button";
import { Input } from "@/components/profile-ui/input";
import { Label } from "@/components/profile-ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/profile-ui/radio-group";
import { Textarea } from "@/components/profile-ui/textarea";
import { useNavigate, NavigateFunction } from "react-router-dom";
import { toast } from "sonner";
import { voucherService, type Voucher } from "@/lib/menu/voucherService";
import { orderService } from "@/lib/menu/orderService";

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [pickupMethod, setPickupMethod] = useState("delivery");
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    note: "",
  });
  const formatVND = (value: any) => {
    const number = Number(value);
    if (!number || isNaN(number)) return "0 ₫";

    return number.toLocaleString("vi-VN", {
      style: "currency",
      currency: "VND",
    });
  };


  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);

  const serviceFee = 10000;
  const deliveryFee = pickupMethod === "delivery" ? 20000 : 0;

  // 🔹 Fetch voucher khả dụng
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const data = await voucherService.getAvailableVouchers();
        setVouchers(data);
      } catch {
        console.warn("⚠️ Không thể tải voucher");
      }
    };
    loadVouchers();
  }, []);

  // 🔹 Tính tiền sau khi chọn voucher
  // 🔹 Tính tiền sau khi chọn voucher
  const discountAmount = (() => {
    if (!selectedVoucher) return 0;

    // Giảm % theo Tạm tính
    if (selectedVoucher.type === "percent") {
      const percent = selectedVoucher.discountPercent || 0;
      const raw = (subtotal * percent) / 100;

      const max = selectedVoucher.maxDiscountValue ?? Infinity;
      return Math.min(raw, max);
    }

    // Giảm cố định
    const fixed = selectedVoucher.discountAmount || 0;
    return Math.min(fixed, subtotal);
  })();


  const total = Math.max(
    0,
    subtotal + serviceFee + deliveryFee - discountAmount
  );
  // =====================================================
  // 🧾 Gửi đơn hàng tới Backend
  // =====================================================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("🧾 [Checkout] ===== DEBUG START =====");
    console.log("🧺 items trong giỏ hàng:", items);

    if (!formData.name || !formData.phone) {
      toast.error("Vui lòng điền đầy đủ họ tên và số điện thoại");
      console.warn("⚠️ Thiếu thông tin khách hàng:", formData);
      return;
    }

    if (pickupMethod === "delivery" && !formData.address) {
      toast.error("Vui lòng nhập địa chỉ giao hàng");
      console.warn("⚠️ Thiếu địa chỉ giao hàng");
      return;
    }

    const token =
      localStorage.getItem("token") || localStorage.getItem("accessToken");
    if (!token) {
      toast.error("Bạn cần đăng nhập để đặt hàng!");
      console.warn("⚠️ Không có token đăng nhập trong localStorage");
      return;
    }

    console.log("📋 Danh sách items trong giỏ (debug chi tiết):");
    console.table(
      items.map((it) => ({
        name: it?.name,
        id: it?.id,
        typeOfId: typeof it?.id,
        quantity: it?.quantity,
        price: it?.price,
      }))
    );
    console.log("🧾 [Checkout] ===== DEBUG productId CHECK =====");
    items.forEach((it, idx) => {
      console.log(`#${idx + 1}`, {
        id: it.id,
        productId: it.productId,
        typeOfProductId: typeof it.productId,
        quantity: it.quantity,
        price: it.price,
      });
    });

    // 🔹 Kiểm tra dữ liệu giỏ hàng thật sự
    // 🔹 Kiểm tra dữ liệu giỏ hàng thật sự
    const validItems = items.filter((it) => {
      const isValid =
        it &&
        typeof it.productId === "number" &&
        !isNaN(it.productId) &&
        it.productId > 0 &&
        it.quantity > 0;

      if (!isValid) {
        console.warn("⚠️ Sản phẩm không hợp lệ bị loại:", {
          id: it?.id,
          productId: it?.productId,
          name: it?.name,
          quantity: it?.quantity,
          price: it?.price,
        });
      }

      return isValid;
    });


    console.log("✅ validItems sau khi lọc:", validItems);

    if (validItems.length === 0) {
      toast.error("Giỏ hàng của bạn trống hoặc sản phẩm không hợp lệ!");
      console.warn("❌ Không có sản phẩm hợp lệ trong giỏ hàng!");
      console.log("🧾 [Checkout] ===== DEBUG END =====");
      return;
    }

    // 🔹 Ánh xạ phương thức thanh toán
    const paymentMap: Record<string, string> = {
      cash: "COD",
      momo: "MOMO",
      zalopay: "ZALOPAY",
    };
    const paymentForBE = paymentMap[paymentMethod] ?? paymentMethod;

    // 🔹 Chuẩn bị payload gửi BE
    const orderPayload = {
      storeId: 1,
      paymentMethod: paymentForBE,

      // 🔥 ĐÚNG – phải để ở root payload chứ không phải trong items
      fulfillmentMethod: pickupMethod === "delivery" ? "Delivery" : "AtStore",
      isOnlinePaid: paymentMethod !== "cash",

      shippingAddress: pickupMethod === "delivery" ? formData.address : "Nhận tại cửa hàng",
      lat: 10.776889,
      lng: 106.700806,

      subtotal,
      total,
      shippingFee: deliveryFee,
      serviceFee,
      discountAmount,
      voucherCode: selectedVoucher?.code || null,

      items: validItems.map((it) => ({
        productId: it.productId,
        productName: it.name,
        quantity: it.quantity,
        price: it.price,
        size: it.size || "",
        toppings: it.toppings || [],
        options: it.options || {},
      })),
    };


    console.log("📦 Payload gửi về backend:", orderPayload);
    // =====================================================
    // 🧾 Gửi đơn hàng tới Backend
    // =====================================================
    try {
      setLoading(true);
      console.log("🛰️ [Checkout] Gửi đơn hàng:", orderPayload);

      const res = await orderService.create(orderPayload); // xoá token nếu không cần
      console.log("✅ [Checkout] Đặt hàng thành công:", res);

      clearCart();
      toast.success("Đặt hàng thành công!");
      navigate("/menu/ordersuccess", {
        state: {
          orderId: res?.data?.orderId ?? "PL" + Date.now().toString().slice(-8),
          total,
          selectedVoucher,
        },
      });
    } catch (err) {
      console.error("❌ [Checkout] Lỗi khi đặt hàng:", err);
    } finally {
      setLoading(false);
      console.log("🧾 [Checkout] ===== DEBUG END =====");
    }
  };


  // =====================================================
  // 🧱 Giao diện
  // =====================================================
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Info */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">
              Thông tin khách hàng
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Họ và tên *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nguyễn Văn A"
                  className="mt-2 rounded-xl"
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="0912345678"
                  className="mt-2 rounded-xl"
                  required
                />
              </div>
            </div>
          </div>

          {/* Pickup Method */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">
                Phương thức nhận hàng
              </h2>
            </div>
            <RadioGroup value={pickupMethod} onValueChange={setPickupMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="pickup" id="pickup" />
                  <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Nhận tại cửa hàng</div>
                    <div className="text-sm text-muted-foreground">
                      Miễn phí - Nhận hàng sau 15 phút
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="delivery" id="delivery" />
                  <Label htmlFor="delivery" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Giao hàng tận nơi</div>
                    <div className="text-sm text-muted-foreground">
                      Phí vận chuyển: 20.000₫ - Giao trong 30-45 phút
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>

            {pickupMethod === "delivery" && (
              <div className="mt-4">
                <Label htmlFor="address">Địa chỉ giao hàng *</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện"
                  className="mt-2 rounded-xl resize-none"
                  rows={3}
                  required
                />
              </div>
            )}

            <div className="mt-4">
              <Label htmlFor="note">Ghi chú đơn hàng</Label>
              <Textarea
                id="note"
                value={formData.note}
                onChange={(e) =>
                  setFormData({ ...formData, note: e.target.value })
                }
                placeholder="Yêu cầu đặc biệt về đơn hàng..."
                className="mt-2 rounded-xl resize-none"
                rows={2}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Wallet className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">
                Phương thức thanh toán
              </h2>
            </div>
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash" className="flex-1 cursor-pointer">
                    <div className="font-semibold">Tiền mặt</div>
                    <div className="text-sm text-muted-foreground">
                      Thanh toán khi nhận hàng
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="momo" id="momo" />
                  <Label htmlFor="momo" className="flex-1 cursor-pointer">
                    <div className="font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Ví MoMo
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Thanh toán qua ví điện tử MoMo
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border hover:border-primary transition-colors">
                  <RadioGroupItem value="zalopay" id="zalopay" />
                  <Label htmlFor="zalopay" className="flex-1 cursor-pointer">
                    <div className="font-semibold flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      ZaloPay
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Thanh toán qua ví điện tử ZaloPay
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </div>

          {/* Voucher Section */}
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <div className="flex items-center gap-2 mb-4">
              <Gift className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold text-card-foreground">
                Mã giảm giá
              </h2>
            </div>

            {vouchers.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                Chưa có voucher khả dụng
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vouchers.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() =>
                      setSelectedVoucher(
                        selectedVoucher?.id === v.id ? null : v
                      )
                    }
                    className={`p-4 border-2 rounded-xl text-left transition-colors ${selectedVoucher?.id === v.id
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary"
                      }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-card-foreground">
                        {v.code}
                      </span>
                      <span className="text-primary font-bold">
                        {v.type === "percent"
                          ? `-${v.discountPercent}%`
                          : `-${formatVND(v.discountAmount || v.value || 0)}`
                        }
                      </span>


                    </div>
                    <p className="text-sm text-muted-foreground">
                      HSD: {new Date(v.expiryDate).toLocaleDateString("vi-VN")}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {selectedVoucher && (
              <p className="text-sm text-green-600 mt-3">
                Đã áp dụng voucher: <b>{selectedVoucher.code}</b> (
                {selectedVoucher.type === "percent"
                  ? `-${selectedVoucher.discountPercent}%`
                  : `-${formatVND(selectedVoucher.value)}`
                }
                )
              </p>

            )}
          </div>

          {/* Order Summary */}
          <div className="bg-card rounded-2xl p-6 shadow-medium">
            <h2 className="text-xl font-bold mb-4 text-card-foreground">
              Chi tiết đơn hàng
            </h2>
            <div className="space-y-3 mb-6">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-semibold">
                    {formatVND(item.price * item.quantity)}
                  </span>

                </div>
              ))}

              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">{formatVND(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Phí dịch vụ</span>
                  <span className="font-semibold">+{formatVND(serviceFee)}</span>
                </div>
                {deliveryFee > 0 && (
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Phí giao hàng</span>
                    <span className="font-semibold">
                      +{formatVND(deliveryFee)}
                    </span>
                  </div>
                )}
                {selectedVoucher && (
                  <div className="flex justify-between text-sm mb-2 text-green-600">
                    <span>Giảm giá ({selectedVoucher.code})</span>
                    <span>- {formatVND(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold pt-3 border-t">
                  <span>Tổng cộng</span>
                  <span className="text-primary">{formatVND(total)}</span>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-primary hover:opacity-90 text-primary-foreground rounded-xl h-14 text-lg font-semibold shadow-medium"
            >
              {loading ? "Đang xử lý..." : "Xác nhận đặt hàng"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
