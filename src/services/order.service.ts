import api from "@/lib/api";

export async function fetchNewOrders() {
  try {
    console.log(">>> [ORDER SERVICE] Fetching orders...");

    const res = await api.get("/api/pos/orders");

    console.log(">>> [ORDER SERVICE] Raw Response Data:", res.data);

    // CASE 1: Backend trả array trực tiếp
    if (Array.isArray(res.data)) {
      return res.data.map((o: any) => ({
        id: o.Id,
        userId: o.UserId,
        storeId: o.StoreId,
        total: Number(o.Total),
        status: o.Status,
        paymentStatus: o.PaymentStatus,
        createdAt: o.CreatedAt,
        items: [],
      }));
    }

    // CASE 2: Backend trả dạng { success, data }
    if (Array.isArray(res.data?.data)) {
      return res.data.data.map((o: any) => ({
        id: o.Id,
        userId: o.UserId,
        storeId: o.StoreId,
        total: Number(o.Total),
        status: o.Status,
        paymentStatus: o.PaymentStatus,
        createdAt: o.CreatedAt,
        items: [],
      }));
    }

    // Nếu BE trả format khác → sai
    console.error(">>> INVALID ORDER RESPONSE FORMAT:", res.data);
    return [];
  } catch (err: any) {
    console.error(
      ">>> ORDER API ERROR:",
      err.response?.data || err.message
    );
    throw err;
  }
}
