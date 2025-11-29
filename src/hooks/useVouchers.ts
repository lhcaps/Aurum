// src/hooks/useVouchers.ts
import { useEffect, useState } from "react";
import { voucherAdminApi } from "@/services/voucher.admin.api";

export function useVouchers() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const data = await voucherAdminApi.getAll();

      // ⭐ CHUẨN HÓA DỮ LIỆU TỪ BE → FE
      const mapped = data.map((v: any) => ({
        id: v.Id,
        code: v.Code,
        type: v.Type?.toString().toLowerCase() === "percent" ? "percent" : "fixed",
        discountPercent: v.DiscountPercent ?? 0,
        value: v.Value ?? 0,
        maxDiscount: v.MaxDiscount ?? 0,
        minOrder: v.MinOrder ?? 0,
        requiredPoints: v.RequiredPoints ?? 0,
        usedCount: v.UsedCount ?? 0,
        expiryDate: v.ExpiryDate,
        startAt: v.StartAt,
        endAt: v.EndAt,
        isActive: v.IsActive === true || v.IsActive === 1
      }));

      setVouchers(mapped);
    } catch (err) {
      console.error("Load vouchers failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return { vouchers, loading, reload: load };
}
