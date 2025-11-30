import api from "@/lib/api";

export async function fetchNewOrders() {
  try {
    const res = await api.get("/api/pos/orders");

    const raw = Array.isArray(res.data?.data) ? res.data.data : [];

    return raw
      .filter((o: any) =>
        ["pending", "waiting", "preparing", "completed"]
          .includes(o.Status?.toLowerCase())
      )
      .map((o: any) => {
        const createdAt = o.CreatedAt
          ? new Date(o.CreatedAt)
          : new Date();

        const items = Array.isArray(o.Items)
          ? o.Items.map((i: any) => ({
            id: i.ProductId,
            productId: i.ProductId,
            quantity: i.Quantity,
            price: Number(i.Price) || 0,

            name: i.name || i.ProductName || "Không rõ sản phẩm",

            image: i.ImageUrl ?? null,

            size: i.Size ?? null,
            toppings: i.Toppings ?? [],
            notes: i.Notes ?? "",
          }))
          : [];

        return {
          id: o.Id,
          orderNumber: o.Id,

          time: createdAt,
          createdAt,

          // ✔ DÙNG CHUẨN CHỮ HOA/THƯỜNG
          type: o.FulfillmentMethod === "Delivery" ? "delivery" : "atstore",

          total: Number(o.Total) || 0,
          status: o.Status,
          paymentStatus: o.PaymentStatus ?? "Unpaid",

          customerName: o.CustomerName ?? "Khách lẻ",

          items,
        };
      });

  } catch (err) {
    console.error(">>> fetchNewOrders ERROR:", err);
    return [];
  }
}
