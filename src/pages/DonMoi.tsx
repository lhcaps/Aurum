import React, { useCallback } from "react";
import { OrderStats } from "@/modules/orders/OrderStats";
import { OrderTabs } from "@/modules/orders/OrderTabs";
import { useBaristaOrders } from "@/hooks/useBaristaOrders";
import { RefreshCcw, Coffee } from "lucide-react";

export default function DonMoi() {
  const {
    orders,
    newOrders,
    brewingOrders,
    doneOrders,
    loading,
    updateStatus, // Hàm cập nhật trạng thái API
    refresh // Hàm tải lại dữ liệu từ BE
  } = useBaristaOrders();

  // ✅ FIX: TẠO HÀM BAO BỌC để gọi refresh() sau khi updateStatus
  const handleStatusChange = useCallback(async (orderId, newStatus) => {
    try {
      // 1. Gọi API để cập nhật trạng thái (ví dụ: new -> brewing/start-making)
      await updateStatus(orderId, newStatus);

      // 2. Tải lại toàn bộ dữ liệu để đơn hàng di chuyển giữa các tab
      refresh();

    } catch (err) {
      console.error("FAILED TO CHANGE STATUS IN DON MOI", err);
      // Có thể thêm logic thông báo lỗi cho người dùng ở đây
    }
  }, [updateStatus, refresh]);


  return (
    <div className="space-y-6 p-4 md:p-8">

      {/* HEADER VÀ REFRESH */}
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
          <Coffee className="w-8 h-8 text-yellow-700" />
          Barista Dashboard
        </h1>

        {/* Nút Refresh */}
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

      {/* XỬ LÝ LOADING VÀ ZERO STATE */}
      {loading && orders.length === 0 ? (
        <div className="flex justify-center items-center h-48 bg-gray-50 rounded-lg">
          <p className="text-gray-500 flex items-center gap-2 text-lg">
            <RefreshCcw className="w-6 h-6 animate-spin" />
            Đang tải dữ liệu Barista...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center p-12 bg-gray-50 border border-dashed rounded-lg">
          <Coffee className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-xl font-semibold text-gray-700">Hiện tại không có đơn hàng nào</h2>
          <p className="text-gray-500">
            Hãy nhấn "Làm mới" hoặc chờ đơn hàng mới được tạo.
          </p>
        </div>
      ) : (
        /* HIỂN THỊ NỘI DUNG CHÍNH */
        <>
          {/* Order Stats */}
          <OrderStats
            total={orders.length}
            newCount={newOrders.length}
            brewingCount={brewingOrders.length}
            doneCount={doneOrders.length}
          />

          {/* Order Tabs (Chứa các Order Board chi tiết) */}
          <OrderTabs
            orders={orders}
            newOrders={newOrders}
            brewingOrders={brewingOrders}
            doneOrders={doneOrders}
            onUpdateStatus={refresh}
            onStatusChange={handleStatusChange} // ✅ TRUYỀN HÀM ĐÃ BAO BỌC
          />
        </>
      )}
    </div>
  );
}