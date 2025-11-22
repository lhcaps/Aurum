import { OrderStats } from "@/modules/orders/OrderStats";
import { OrderTabs } from "@/modules/orders/OrderTabs";
import { useBaristaOrders } from "@/hooks/useBaristaOrders";

export default function PhaChe() {
  const {
    orders,
    newOrders,
    brewingOrders,
    doneOrders,
    loading,
    updateStatus,
    refresh
  } = useBaristaOrders();

  return (
    <div className="space-y-6">
      <OrderStats
        total={orders.length}
        newCount={newOrders.length}
        brewingCount={brewingOrders.length}
        doneCount={doneOrders.length}
      />

      <OrderTabs
        orders={orders}
        newOrders={newOrders}
        brewingOrders={brewingOrders}
        doneOrders={doneOrders}
        onUpdateStatus={updateStatus}
      />
    </div>
  );
}
