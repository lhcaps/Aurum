import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Eye, CheckCircle2, Clock, Truck } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Order {
  id: string;
  customer: string;
  phone: string;
  products: string;
  total: number;
  status: "pending" | "processing" | "shipping" | "completed";
  date: string;
}

const statusConfig = {
  pending: { label: "Chờ xử lý", color: "bg-accent/10 text-accent", icon: Clock },
  processing: { label: "Đang xử lý", color: "bg-secondary/10 text-secondary", icon: Truck },
  shipping: { label: "Đang giao", color: "bg-primary/10 text-primary", icon: Truck },
  completed: { label: "Hoàn thành", color: "bg-primary/10 text-primary", icon: CheckCircle2 },
};

export default function Orders() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "#PL1234",
      customer: "Nguyễn Văn A",
      phone: "0912345678",
      products: "Trà sữa matcha (x2), Cà phê đen đá (x1)",
      total: 195000,
      status: "completed",
      date: "2025-01-10 14:30",
    },
    {
      id: "#PL1235",
      customer: "Trần Thị B",
      phone: "0923456789",
      products: "Trà đào cam sả (x1)",
      total: 65000,
      status: "processing",
      date: "2025-01-10 15:45",
    },
    {
      id: "#PL1236",
      customer: "Lê Văn C",
      phone: "0934567890",
      products: "Cà phê sữa (x3), Trà sữa matcha (x1)",
      total: 240000,
      status: "shipping",
      date: "2025-01-10 16:20",
    },
    {
      id: "#PL1237",
      customer: "Phạm Thị D",
      phone: "0945678901",
      products: "Trà sữa matcha (x1)",
      total: 75000,
      status: "pending",
      date: "2025-01-10 17:00",
    },
  ]);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
    toast.success("Đã cập nhật trạng thái đơn hàng");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý đơn hàng</h2>
        <p className="text-muted-foreground">Theo dõi và cập nhật trạng thái đơn hàng</p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm theo mã đơn, tên khách hàng..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả đơn hàng</SelectItem>
              <SelectItem value="pending">Chờ xử lý</SelectItem>
              <SelectItem value="processing">Đang xử lý</SelectItem>
              <SelectItem value="shipping">Đang giao</SelectItem>
              <SelectItem value="completed">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Mã đơn</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Khách hàng</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Sản phẩm</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Tổng tiền</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Thời gian</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Trạng thái</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                const StatusIcon = statusConfig[order.status].icon;
                return (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-foreground">{order.id}</td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-foreground">{order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.phone}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-muted-foreground max-w-xs truncate">
                      {order.products}
                    </td>
                    <td className="py-4 px-6 font-semibold text-primary">
                      {order.total.toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="py-4 px-6 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-4 px-6">
                      <Badge className={statusConfig[order.status].color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {statusConfig[order.status].label}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Select
                          value={order.status}
                          onValueChange={(value) =>
                            updateOrderStatus(order.id, value as Order["status"])
                          }
                        >
                          <SelectTrigger className="w-[140px] h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Chờ xử lý</SelectItem>
                            <SelectItem value="processing">Đang xử lý</SelectItem>
                            <SelectItem value="shipping">Đang giao</SelectItem>
                            <SelectItem value="completed">Hoàn thành</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
