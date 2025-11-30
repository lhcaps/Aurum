import api from "@/lib/api";

export type BaristaUpdateStatus = "brewing" | "done";

export const BaristaOrderAPI = {
  // ==========================================
  // GET BARISTA QUEUE (POS pipeline)
  // ==========================================
  async getOrders() {
    // KHÔNG thêm /api vì axios đã có baseURL="/api"
    return api.get("/pos/queue");
  },

  // ==========================================
  // UPDATE BARISTA STATUS
  // ==========================================
  async updateStatus(id: number, status: BaristaUpdateStatus) {
    if (status === "brewing") {
      // UI “brewing” → BE cần “preparing”
      return api.patch(`/pos/status/${id}`, {
        status: "preparing",
      });
    }

    if (status === "done") {
      return api.patch(`/pos/status/${id}`, {
        status: "done",
      });
    }

    return Promise.reject(
      new Error("Invalid status provided for Barista update.")
    );
  },
};
