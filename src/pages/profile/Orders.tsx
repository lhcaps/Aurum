import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/profile-ui/button";
import { Card } from "@/components/profile-ui/card";
import { Badge } from "@/components/profile-ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/profile-ui/tabs";
import { ArrowLeft, Package, Clock, Truck, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { orderService, Order } from "@/services/order.service"; // ✅ import service

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";
  const [activeTab, setActiveTab] = useState(initialStatus);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🧩 Fetch đơn hàng thật từ backend
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("accessToken") || localStorage.getItem("token");
        if (!token) {
          toast.error("Vui lòng đăng nhập để xem đơn hàng!");
          navigate("/auth/login");
          return;
        }

        const data = await orderService.getUserOrders(token);
        setOrders(data);
      } catch (err: any) {
        console.warn("⚠️ Không thể tải danh sách đơn hàng:", err?.message || err);

        // ❌ KHÔNG logout nữa — chỉ cảnh báo
        toast.warning("Không thể tải đơn hàng, vui lòng thử lại sau!");
        // fallback: giữ data cũ
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  const filterOrders = (status: string) => {
    if (status === "all") return orders;
    return orders.filter((order) => order.status === status);
  };

  const getStatusConfig = (status: Order["status"]) => {
    const configs = {
      pending: {
        label: "Chờ xác nhận",
        icon: <Clock className="w-4 h-4" />,
        color: "bg-yellow-100 text-yellow-700 border-yellow-200",
      },
      confirmed: {
        label: "Đã xác nhận",
        icon: <Package className="w-4 h-4" />,
        color: "bg-blue-100 text-blue-700 border-blue-200",
      },
      delivering: {
        label: "Đang giao",
        icon: <Truck className="w-4 h-4" />,
        color: "bg-purple-100 text-purple-700 border-purple-200",
      },
      completed: {
        label: "Hoàn thành",
        icon: <CheckCircle className="w-4 h-4" />,
        color: "bg-green-100 text-green-700 border-green-200",
      },
      cancelled: {
        label: "Đã hủy",
        icon: <XCircle className="w-4 h-4" />,
        color: "bg-red-100 text-red-700 border-red-200",
      },
    };
    return configs[status];
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  const handleCancelOrder = (orderId: number) => {
    toast.success("Đơn hàng đã được hủy");
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: "cancelled" } : order
      )
    );
  };

  const handleReorder = (orderId: number) => {
    toast.success("Đã thêm sản phẩm vào giỏ hàng");
    navigate("/cart");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 🧭 Header */}
      <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Đơn hàng của tôi</h1>
        </div>
      </header>

      {/* 🧱 Tabs */}
      <div className="sticky top-[60px] z-40 bg-background border-b">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full justify-start rounded-none h-auto p-0 bg-transparent border-b-0">
            {[
              { key: "all", label: "Tất cả" },
              { key: "pending", label: "Chờ xác nhận" },
              { key: "confirmed", label: "Đã xác nhận" },
              { key: "delivering", label: "Đang giao" },
              { key: "completed", label: "Hoàn thành" },
              { key: "cancelled", label: "Đã hủy" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* 📦 Danh sách đơn hàng */}
      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-muted-foreground py-10">
            Đang tải danh sách đơn hàng...
          </p>
        ) : filterOrders(activeTab).length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground mb-4">Chưa có đơn hàng nào</p>
            <Button onClick={() => navigate("/menu")} variant="default">
              Đặt hàng ngay
            </Button>
          </div>
        ) : (
          filterOrders(activeTab).map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              getStatusConfig={getStatusConfig}
              formatCurrency={formatCurrency}
              onCancel={handleCancelOrder}
              onReorder={handleReorder}
              onViewDetail={() => navigate(`/orders/${order.id}`)}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface OrderCardProps {
  order: Order;
  getStatusConfig: (status: Order["status"]) => {
    label: string;
    icon: React.ReactNode;
    color: string;
  };
  formatCurrency: (amount: number) => string;
  onCancel: (orderId: number) => void;
  onReorder: (orderId: number) => void;
  onViewDetail: () => void;
}

const OrderCard = ({
  order,
  getStatusConfig,
  formatCurrency,
  onCancel,
  onReorder,
  onViewDetail,
}: OrderCardProps) => {
  const statusConfig = getStatusConfig(order.status);
  const navigate = useNavigate();

  return (
    <Card className="overflow-hidden border-2 hover:border-primary/50 transition-colors">
      {/* Header */}
      <div className="p-4 bg-accent/30 border-b flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">
            Mã đơn:{" "}
            <span className="font-semibold text-foreground">{order.orderNumber}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">{order.date}</p>
        </div>
        <Badge className={`${statusConfig.color} border flex items-center gap-1`}>
          {statusConfig.icon}
          {statusConfig.label}
        </Badge>
      </div>

      {/* Items */}
      <div className="p-4 space-y-3">
        {order.items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="w-16 h-16 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">☕</span>
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{item.productName}</h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {item.size && `Size: ${item.size}`}
                {item.toppings && item.toppings.length > 0 && ` • ${item.toppings.join(", ")}`}
              </p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">x{item.quantity}</span>
                <span className="font-semibold text-sm">{formatCurrency(item.price)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-accent/20 border-t">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground">Tổng tiền:</span>
          <span className="text-lg font-bold text-primary">{formatCurrency(order.total)}</span>
        </div>
        <div className="flex gap-2">
          {order.status === "pending" && (
            <>
              <Button
                onClick={() => onCancel(order.id)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Hủy đơn
              </Button>
              <Button onClick={onViewDetail} size="sm" className="flex-1">
                Xem chi tiết
              </Button>
            </>
          )}

          {order.status === "completed" && (
            <>
              <Button
                onClick={() => onReorder(order.id)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Đặt lại
              </Button>
              <Button
                onClick={() => navigate(`/profile/review?orderId=${order.id}`)}
                size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:opacity-90 rounded-xl"
              >
                Đánh giá
              </Button>
            </>
          )}

          {(order.status === "confirmed" || order.status === "delivering") && (
            <Button onClick={onViewDetail} size="sm" className="w-full">
              Theo dõi đơn hàng
            </Button>
          )}

          {order.status === "cancelled" && (
            <Button onClick={() => onReorder(order.id)} size="sm" className="w-full">
              Đặt lại
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default Orders;
