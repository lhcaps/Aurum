import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrderBoard } from "./OrderBoard";

export function OrderTabs({
  orders,
  newOrders,
  brewingOrders,
  doneOrders,
  onUpdateStatus,
  onStatusChange, // 1. FIX: THÊM prop onStatusChange
}) {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <Tabs defaultValue="all">
        <TabsList className="mb-6">
          <TabsTrigger value="all">Tất cả ({orders.length})</TabsTrigger>
          <TabsTrigger value="new">Đơn mới ({newOrders.length})</TabsTrigger>
          <TabsTrigger value="brewing">Đang pha ({brewingOrders.length})</TabsTrigger>
          <TabsTrigger value="done">Hoàn tất ({doneOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <OrderBoard
            orders={orders}
            onUpdateStatus={onUpdateStatus}
            onStatusChange={onStatusChange} // 2. FIX: Truyền tiếp
          />
        </TabsContent>

        <TabsContent value="new">
          <OrderBoard
            orders={newOrders}
            onUpdateStatus={onUpdateStatus}
            onStatusChange={onStatusChange} // 2. FIX: Truyền tiếp
          />
        </TabsContent>

        <TabsContent value="brewing">
          <OrderBoard
            orders={brewingOrders}
            onUpdateStatus={onUpdateStatus}
            onStatusChange={onStatusChange} // 2. FIX: Truyền tiếp
          />
        </TabsContent>

        <TabsContent value="done">
          <OrderBoard
            orders={doneOrders}
            onUpdateStatus={onUpdateStatus}
            onStatusChange={onStatusChange} // 2. FIX: Truyền tiếp
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}