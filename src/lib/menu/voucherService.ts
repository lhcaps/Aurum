import API from "@/lib/apiClient";

export interface Voucher {
  id: number;
  code: string;
  type: "percent" | "fixed";
  discountPercent: number;
  value: number;
  requiredPoints: number;
  expiryDate: string;
  isUsed?: boolean;
}

// ============================================================
// 🧩 Voucher Service – API + Mock Fallback
// ============================================================
export const voucherService = {
  // 🟢 Get all available vouchers
  async getAvailableVouchers(): Promise<Voucher[]> {
    try {
      const res = await API.get("/vouchers/available");
      const data = res.data;

      // 🔍 Đảm bảo format hợp lệ
      return data.data.map((v: any) => ({
        id: v.id,
        code: v.code,
        type: v.Type?.toString().toLowerCase() === "percent" ? "percent" : "fixed",
        discountPercent: v.DiscountPercent ?? 0,
        value: v.discountValue ?? 0,
        maxDiscount: v.MaxDiscount ?? 0,
        minOrder: v.MinOrder ?? 0,
        requiredPoints: v.RequiredPoints ?? 0,
        expiryDate: v.expiryDate,
        isUsed: v.IsUsed,
      }));


      console.warn("⚠️ /vouchers/available trả về sai format:", data);
      return getMockVouchers();
    } catch (error) {
      console.error("❌ Lỗi khi lấy vouchers khả dụng:", error);
      return getMockVouchers(); // fallback nếu lỗi mạng
    }
  },

  // 🟢 Get user's vouchers
  async getUserVouchers(): Promise<Voucher[]> {
    try {
      const res = await API.get("/vouchers/my-vouchers");
      const data = res.data;

      return Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : [];
    } catch (error) {
      console.error("❌ Lỗi khi lấy vouchers của user:", error);
      return [];
    }
  },

  // 🟢 Redeem voucher
  async redeemVoucher(
    voucherId: number
  ): Promise<{ success: boolean; message: string; voucher?: Voucher }> {
    try {
      const res = await API.post(`/vouchers/redeem/${voucherId}`);
      const data = res.data;

      return {
        success: true,
        message: data.message || "Đổi voucher thành công!",
        voucher: data.voucher,
      };
    } catch (error: any) {
      console.error("❌ Lỗi khi redeem voucher:", error);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },

  // 🟢 Validate voucher code
  async validateVoucher(
    code: string,
    orderAmount: number
  ): Promise<{ valid: boolean; discount?: number; message?: string }> {
    try {
      const res = await API.post("/vouchers/validate", { code, orderAmount });
      const data = res.data;

      return {
        valid: true,
        discount: data.discount,
        message: data.message,
      };
    } catch (error: any) {
      console.error("❌ Lỗi khi validate voucher:", error);
      return {
        valid: false,
        message: error.response?.data?.message || error.message,
      };
    }
  },
};

// ============================================================
// 🧪 Mock data cho dev (fallback an toàn)
// ============================================================
function getMockVouchers(): Voucher[] {
  const now = new Date();
  const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  return [


  ];
}
