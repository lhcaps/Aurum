import { apiCall } from "@/lib/api";

export const voucherAdminApi = {

  // GET ALL
  getAll: async () => {
    return apiCall("/admin/vouchers", { method: "GET", headers: {} });
  },

  // CREATE
  create: async (formData) => {
    return apiCall("/admin/vouchers", {
      method: "POST",
      headers: {},   // FIX ERROR
      body: JSON.stringify({
        Code: formData.code,
        Type: formData.type,
        DiscountPercent: formData.type === "percent" ? formData.discountPercent : null,
        Value: formData.type === "fixed" ? formData.value : null,
        MaxDiscount: formData.maxDiscount,
        MinOrder: formData.minOrder,
        RequiredPoints: formData.requiredPoints,
        StartAt: formData.startAt,
        EndAt: formData.endAt,
        ExpiryDate: formData.expiryDate === "" ? null : formData.expiryDate
      }),
    });
  },

  // UPDATE
  update: async (id: number, data: any) => {
    return apiCall(`/admin/vouchers/${id}`, {
      method: "PUT",
      headers: {},   // FIX ERROR
      body: JSON.stringify(data),
    });
  },

  // DELETE
  delete: async (id: number) => {
    return apiCall(`/admin/vouchers/${id}`, {
      method: "DELETE",
      headers: {},
    });
  },

  // TOGGLE ACTIVE
  toggle: async (id: number, active: boolean) => {
    return apiCall(`/admin/vouchers/${id}/toggle`, {
      method: "PATCH",
      headers: {},
      body: JSON.stringify({ isActive: active }),
    });
  },
};
