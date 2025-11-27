import React, { useCallback } from "react"; // 👈 Thêm useCallback
import { OrderBoard } from "@/modules/orders/OrderBoard";
import { useBaristaOrders } from "@/hooks/useBaristaOrders";
import { RefreshCcw, Coffee } from "lucide-react";
import { OrderStatus } from "@/components/OrderCard"; // 👈 Thêm OrderStatus

export default function PhaChe() {
  const {
    brewingOrders,
    updateStatus, // Hàm gọi API update
    loading,
    refresh // Hàm tải lại dữ liệu
  } = useBaristaOrders();

  const ordersToDisplay = brewingOrders;

  // 1. TẠO HÀM BAO BỌC: Đảm bảo refresh xảy ra sau khi update API thành công
  const handleStatusChange = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      // Gọi hàm cập nhật trạng thái API (từ brewing -> done)
      await updateStatus(orderId, newStatus);

      // Sau khi API thành công, TẢI LẠI DỮ LIỆU
      refresh();
    } catch (err) {
      console.error("FAILED TO COMPLETE ORDER", err);
      // Xử lý lỗi (thông báo)
    }
  }, [updateStatus, refresh]); // Phụ thuộc vào hai hàm từ hook

  return (
    <div className="space-y-6 p-4 md:p-8">

      {/* HEADER VÀ NÚT REFRESH */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-3">
          <Coffee className="w-8 h-8 text-yellow-700" />
          <h1 className="text-3xl font-extrabold text-gray-800">
            Đang Pha Chế ({ordersToDisplay.length})
          </h1>
        </div>

        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-yellow-700 transition-colors disabled:opacity-50"
          title="Làm mới dữ liệu đơn hàng"
        >
          <RefreshCcw className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"} />
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {/* HIỂN THỊ BOARD ĐƠN HÀNG ĐANG PHA CHẾ */}
      {loading && ordersToDisplay.length === 0 ? (
        <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg">
          <p className="text-gray-500 flex items-center gap-2 text-lg">
            <RefreshCcw className="w-6 h-6 animate-spin" />
            Đang tải danh sách pha chế...
          </p>
        </div>
      ) : ordersToDisplay.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 border border-dashed rounded-lg">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">Chưa có đơn hàng nào đang pha</h2>
          <p className="text-gray-500">
            Các đơn hàng sẽ xuất hiện ở đây sau khi được "Xác nhận" từ Dashboard.
          </p>
        </div>
      ) : (
        <OrderBoard
          orders={ordersToDisplay}
          onUpdateStatus={refresh}
          // 2. TRUYỀN HÀM BAO BỌC MỚI VÀO ONSTATUSCHANGE
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}