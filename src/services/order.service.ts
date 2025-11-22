import api from "@/lib/api";

export async function fetchNewOrders() {
  try {
    const res = await api.get("/api/pos/orders");

    const raw = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    return raw.map((o: any) => ({
      id: o.Id,
      orderNumber: o.Id,
      time: o.CreatedAt ? new Date(o.CreatedAt) : null,
      type: "take-away",

      total: Number(o.Total),
      status: o.Status,
      paymentStatus: o.PaymentStatus,

      createdAt: o.CreatedAt,

      // FIX QUAN TRỌNG – luôn đảm bảo mảng
      items: Array.isArray(o.Items)
        ? o.Items.map((i: any) => ({
            id: i.ProductId,
            productId: i.ProductId,
            quantity: i.Quantity,
            price: i.Price,

            name: i.ProductName,
            image: i.ImageUrl,

            size: i.Size || null,
            toppings: i.Toppings || [],
            notes: i.Notes || "",
          }))
        : [],
    }));
  } catch (err) {
    console.error(">>> ORDER API ERROR:", err);
    return [];
  }
}
