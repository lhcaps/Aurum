const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export interface OrderItemPayload {
  productId: number;
  quantity: number;
  price: number;
  size?: string;
  options?: { sugar?: string; ice?: string };
  toppings?: string[];
}

export interface OrderPayload {
  storeId: number;
  paymentMethod: string;
  shippingAddress: string;
  lat: number;
  lng: number;
  items: OrderItemPayload[];
}

export const orderService = {
  async create(order: OrderPayload, token: string) {
    console.log("🛰️ [orderService] POST", `${API_BASE_URL}/orders`, order);
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ [orderService] Error:", res.status, text);
      throw new Error("Không thể tạo đơn hàng");
    }
    return await res.json();
  },
};
