import { StatsCard } from "@/components/StatsCard";
import { Package, Coffee, CheckCircle } from "lucide-react";

export function OrderStats({ total, newCount, brewingCount, doneCount }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatsCard
        title="Tổng đơn hôm nay"
        value={total}
        icon={Package}
        trend={{ value: "+12%", isPositive: true }}
      />
      <StatsCard
        title="Đơn mới"
        value={newCount}
        icon={Package}
        className="border-l-4 border-status-new"
      />
      <StatsCard
        title="Đang pha chế"
        value={brewingCount}
        icon={Coffee}
        className="border-l-4 border-status-brewing"
      />
      <StatsCard
        title="Đã hoàn tất"
        value={doneCount}
        icon={CheckCircle}
        className="border-l-4 border-status-done"
      />
    </div>
  );
}
