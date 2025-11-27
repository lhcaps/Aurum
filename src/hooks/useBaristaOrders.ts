import { useEffect, useState } from "react";
import { BaristaOrderAPI } from "@/services/baristaOrder.api";
import { Order, OrderStatus } from "@/components/OrderCard";

export const useBaristaOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD ORDERS TỪ BE
  // ==========================================
  const loadOrders = async () => {
    try {
      setLoading(true);

      const res = await BaristaOrderAPI.getOrders();

      const data = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapped: Order[] = data.map((o: any) => {
        const rawItems = Array.isArray(o.Items) ? o.Items : [];
        const dbStatus = o.Status?.toLowerCase();

        return {
          id: String(o.Id),
          orderNumber: "#" + o.Id,
          customerName: o.CustomerName ?? "",
          type: o.Type ?? "takeaway",

          // 🛠️ MAP STATUS CHUẨN ĐÃ SỬA
          status:
            // 1. Trạng thái ĐANG PHA CHẾ (Đã bắt đầu làm)
            dbStatus === "preparing" ||
            dbStatus === "making"
              ? ("brewing" as OrderStatus)

            // 2. Trạng thái ĐƠN MỚI (Đã được Cashier chuyển qua, Barista cần xác nhận)
            // ✅ FIX: Đảm bảo 'waiting' map thành "new" trên UI
            : dbStatus === "waiting" 
              ? ("new" as OrderStatus)
            
            // 3. Trạng thái HOÀN TẤT/KẾT THÚC
            : dbStatus === "done" ||
              dbStatus === "completed" || 
              dbStatus === "cancelled"
              ? ("done" as OrderStatus)

            // 4. Mặc định là ĐƠN MỚI (Cho đơn hàng vừa tạo)
            : ("new" as OrderStatus),

          time:
            typeof o.CreatedAt === "string"
              ? o.CreatedAt.substring(11, 16)
              : "",

          // ITEMS
          items: rawItems.map((i: any) => ({
            name: i.ProductName,
            quantity: i.Quantity,
            size: i.Size ?? null,
            notes: i.Notes ?? "",
          })),
        };
      });

      setOrders(mapped);
    } catch (error) {
      console.error("LOAD BARISTA ORDERS ERROR:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UPDATE STATUS
  // ==========================================
  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    // 💡 LƯU Ý: Phải đảm bảo 'newStatus' được gửi từ OrderCard.tsx khớp với API endpoint
    // Nếu bạn muốn 'new' -> 'brewing' (UI), bạn cần:
    // 1. OrderCard gửi trạng thái API tương ứng với '/start-making'.
    // 2. OrderCard gửi trạng thái 'done' cho hành động hoàn tất.

    await BaristaOrderAPI.updateStatus(
      Number(id),
      // newStatus sẽ là 'brewing' (để gọi start-making) hoặc 'done'
      newStatus as "brewing" | "done" 
    );

    // Cập nhật trạng thái ngay lập tức trên UI (trước khi refresh)
    setOrders((prev) =>
      prev.map((o) => (o.id === id ? { ...o, status: newStatus } : o))
    );
    
    // Nếu bạn muốn đơn hàng chuyển từ tab này sang tab khác ngay lập tức, bạn phải 
    // đảm bảo gọi refresh() sau khi updateStatus thành công (như đã làm trong PhaChe.tsx).
    // Nếu bạn gọi refresh ở đây, nó sẽ gây loop vô hạn nếu hook khác cũng gọi update.
    // Tốt nhất nên để component gọi refresh.
  };

  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    updateStatus,
    refresh: loadOrders,

    // Logic filtering này đã chính xác vì nó dựa trên mapping đã sửa
    newOrders: orders.filter((o) => o.status === "new"),
    brewingOrders: orders.filter((o) => o.status === "brewing"),
    doneOrders: orders.filter((o) => o.status === "done"),
  };
};