import api from "@/lib/api";
export type BaristaUpdateStatus = "brewing" | "done";

export const BaristaOrderAPI = {

  async getOrders() {
    // GET /api/admin/workflow/barista-orders (Đúng)
    return api.get("/admin/workflow/barista-orders");
  },

  async updateStatus(id: number, status: BaristaUpdateStatus) {
    if (status === "brewing") {
      // 1. FIX: Dùng endpoint chính xác để chuyển từ new -> brewing (send-to-barista)
      // Route 2: PATCH /api/admin/workflow/:id/send-to-barista
      return api.patch(`/admin/workflow/${id}/send-to-barista`);
    }
    if (status === "done") {
      // 2. FIX: Dùng endpoint chính xác để chuyển từ brewing -> done
      // Route 4: PATCH /api/admin/workflow/:id/complete-making
      return api.patch(`/admin/workflow/${id}/complete-making`);
    }
    // Đảm bảo trả về Promise nếu trạng thái không khớp
    return Promise.reject(new Error("Invalid status provided for Barista update."));
  }

};