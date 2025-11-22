import { useBaristaOrders } from "@/hooks/useBaristaOrders";
import { OrderBoard } from "@/modules/orders/OrderBoard";

export default function HoanTat() {
  const { doneOrders, updateStatus } = useBaristaOrders();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Đã hoàn tất</h1>
      <OrderBoard orders={doneOrders} onUpdateStatus={updateStatus} />
    </div>
  );
}
