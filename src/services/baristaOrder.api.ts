import api from "@/lib/api";
export type BaristaUpdateStatus = "brewing" | "done";

export const BaristaOrderAPI = {

  async getOrders() {
    return api.get("/admin/workflow/barista-orders");
  },

  async updateStatus(id: number, status: BaristaUpdateStatus) {
    if (status === "brewing") {
      return api.patch(`/admin/workflow/${id}/to-making`);
    }
    if (status === "done") {
      return api.patch(`/admin/workflow/${id}/complete-by-barista`);
    }
  }

};
