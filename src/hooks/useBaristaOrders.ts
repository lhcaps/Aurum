import { useEffect, useState } from "react";
import { BaristaOrderAPI } from "@/services/baristaOrder.api";
import { Order, OrderStatus } from "@/components/OrderCard";

export const useBaristaOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await BaristaOrderAPI.getOrders();

      const mapped: Order[] = data.map((o: any) => ({
        id: o.Id.toString(),
        orderNumber: "#" + o.Id,
        customerName: o.CustomerName,
        type: o.Type || "takeaway",
        status:
          o.Status === "pending"
            ? ("new" as OrderStatus)
            : o.Status === "making"
            ? ("brewing" as OrderStatus)
            : ("done" as OrderStatus),
        time: o.CreatedAt.substring(11, 16),
        items: o.Items.map((i: any) => ({
          name: i.ProductName,
          size: i.Size,
          quantity: i.Quantity,
          notes: i.Notes,
        })),
      }));

      setOrders(mapped);
    } finally {
      setLoading(false);
    }
  };

const updateStatus = async (id: string, newStatus: OrderStatus) => {
  if (newStatus === "new") return; // Barista không được set "new"

  await BaristaOrderAPI.updateStatus(
    Number(id),
    newStatus as "brewing" | "done"
  );

  setOrders((prev) =>
    prev.map((o) =>
      o.id === id ? { ...o, status: newStatus } : o
    )
  );
};


  useEffect(() => {
    loadOrders();
  }, []);

  return {
    orders,
    loading,
    updateStatus,
    refresh: loadOrders,
    newOrders: orders.filter((o) => o.status === "new"),
    brewingOrders: orders.filter((o) => o.status === "brewing"),
    doneOrders: orders.filter((o) => o.status === "done"),
  };
};
