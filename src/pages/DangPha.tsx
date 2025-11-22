import { useBaristaOrders } from "@/hooks/useBaristaOrders";
import { OrderBoard } from "@/modules/orders/OrderBoard";

export default function DangPha() {
  const { brewingOrders, updateStatus } = useBaristaOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đang pha chế</h1>
      <OrderBoard orders={brewingOrders} onUpdateStatus={updateStatus} />
    </div>
  );
}
