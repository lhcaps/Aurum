import { useOrders } from "@/contexts/OrderContext";
import { useEffect, useState } from "react";
import { fetchCashierHistory } from "@/services/cashierHistory.service";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function History() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const data = await fetchCashierHistory();
    setOrders(data);
  };

  // Lọc ra các đơn hàng đã hoàn thành (đã thanh toán)
  const completedOrders = orders.filter((order) =>
    ["completed", "done", "paid"].includes(order.status?.toLowerCase())
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("vi-VN");
  };

  /**
   * 🔑 FIX: Cần đảm bảo hàm này nhận kiểu dữ liệu string (từ OrderType.paymentMethod)
   * và trả về nhãn Tiếng Việt tương ứng.
   */
  const getPaymentMethodLabel = (method?: string) => {
    const labels: Record<string, string> = {
      cash: "Tiền mặt",
      momo: "MoMo",
      zalopay: "ZaloPay",
      bank_transfer: "Chuyển khoản",
    };
    // Nếu paymentMethod bị undefined, mặc định là cash hoặc trả về N/A
    return labels[method || "cash"] || "N/A";
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Lịch sử giao dịch - Chuyên nghiệp</h1>
        <p className="text-sm text-muted-foreground">Danh sách đơn hàng đã hoàn thành</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="text-accent">Mã</TableHead>
              <TableHead className="text-accent">Sản phẩm</TableHead>
              <TableHead className="text-accent">Tổng tiền</TableHead>
              <TableHead className="text-accent">Thời gian</TableHead>
              <TableHead className="text-accent">Phương thức</TableHead>
              <TableHead className="text-accent">Hành động</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {completedOrders.map((order) => (
              <TableRow key={order.id} className="border-border">
                <TableCell className="font-medium text-accent">
                  #{order.id}
                </TableCell>
                <TableCell>
                  {order.items.map((item, idx) => (
                    <div key={idx} className="text-sm">
                      {/* 💡 Giả định item có trường name và size */}
                      {item.name} ({item.size})
                    </div>
                  ))}
                </TableCell>
                <TableCell className="text-accent font-semibold">
                  {order.total.toLocaleString("vi-VN")}₫
                </TableCell>
                <TableCell className="text-sm">
                  <div>{formatDate(new Date(order.time))}</div>
                  <div className="text-accent">{formatTime(new Date(order.time))}</div>
                </TableCell>
                <TableCell>
                  {/* ✅ FIX: Gọi hàm hiển thị nhãn phương thức thanh toán */}
                  <span className="text-sm font-medium">{getPaymentMethodLabel(order.paymentMethod)}</span>
                </TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    [Hóa đơn]
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {completedOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có giao dịch nào hoàn thành</p>
          </div>
        )}
      </div>
    </div>
  );
}