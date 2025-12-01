import API from "@/lib/apiClient";

export interface Voucher {
  id: number;
  code: string;
  type: "percent" | "fixed";

  // Cho voucher %
  discountPercent: number;
  maxDiscountValue: number;

  // Cho voucher tiền mặt
  discountAmount: number;   // hoặc value, nhưng phải đồng bộ
  value: number;            // thêm dòng này để Checkout hoạt động

  // Điều kiện
  minOrderValue: number;
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

      console.log("🔥 RAW VOUCHER DATA RETURNED FROM API:", data);

      return data.data.map((v: any) => {
        // Xác định loại voucher
        const isPercent =
          (v.Type ?? "").toString().toLowerCase() === "percent";

        return {
          id: v.id,
          code: v.code,
          type: isPercent ? "percent" : "fixed",

          // Percent voucher → DiscountPercent
          discountPercent: isPercent ? v.DiscountPercent ?? 0 : 0,

          // Fixed voucher → discountValue
          discountAmount: !isPercent ? v.discountValue ?? 0 : 0,

          // Điều kiện
          minOrderValue: v.MinOrder ?? 0,
          maxDiscountValue: v.MaxDiscount ?? 0,

          requiredPoints: v.RequiredPoints ?? 0,

          // expiryDate backend có thể là expiryDate hoặc ExpiryDate
          expiryDate: v.expiryDate ?? v.ExpiryDate,

          isUsed: v.IsUsed ?? false,
        };
      });

    } catch (error) {
      console.error("❌ Lỗi khi lấy vouchers khả dụng:", error);
      return getMockVouchers();
    }
  }
  ,

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
