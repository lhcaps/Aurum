import api from "@/lib/api";

/**
 * ============================================
 * 1. CASHIER: Lấy danh sách đơn POS
 * ============================================
 */
export async function fetchCashierOrders() {
  try {
    const res = await api.get("/api/pos/orders");

    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    return list.map((o: any) => ({
      id: o.Id,
      userId: o.UserId,
      orderNumber: o.Id,          // Các đơn POS không có OrderNumber riêng
      total: o.Total,
      status: o.Status?.toLowerCase(),
      createdAt: o.CreatedAt,
      customerName: o.CustomerName || "Khách lẻ",
      items: Array.isArray(o.Items) ? o.Items : [],
      paymentStatus: o.PaymentStatus,
    }));
  } catch (err) {
    console.error(">>> fetchCashierOrders ERROR:", err);
    return [];
  }
}

/**
 * ============================================
 * 2. CASHIER: Gửi đơn sang Barista
 * Status: pending → waiting
 * ============================================
 */
export async function sendOrderToBarista(id: number) {
  try {
    const res = await api.post(`/api/pos/orders/send/${id}`);
    return res.data;
  } catch (err) {
    console.error(">>> sendOrderToBarista ERROR:", err);
    throw err;
  }
}

/**
 * ============================================
 * 3. CASHIER: Thanh toán đơn hàng
 * ============================================
 */
export async function payOrder(orderId: number, paymentMethod: string, customerPaid: number) {
  try {
    const res = await api.post(`/api/pos/orders/pay/${orderId}`, {
      paymentMethod,
      customerPaid,
    });
    return res.data;
  } catch (err) {
    console.error(">>> payOrder ERROR:", err);
    throw err;
  }
}

/**
 * ============================================
 * 4. CASHIER: Tạo đơn mới (Direct Sales)
 * ============================================
 */
export async function createOrderApi(payload: any) {
  try {
    const res = await api.post("/api/pos/orders/create", payload);
    return res.data;
  } catch (err) {
    console.error(">>> createOrderApi ERROR:", err);
    throw err;
  }
}

/**
 * ============================================
 * 5. BARISTA WORKFLOW: Lấy danh sách đơn đang pha
 * Route CHUẨN: /admin/workflow/barista-orders
 * ============================================
 */
export async function fetchBaristaOrders() {
  try {
    const res = await api.get("/api/admin/workflow/barista-orders");

    const list = Array.isArray(res.data?.data)
      ? res.data.data
      : [];

    return list.map((o: any) => ({
      id: o.Id,
      orderNumber: o.OrderNumber,
      total: o.Total,
      status: o.Status?.toLowerCase(),
      createdAt: o.CreatedAt,
      items: Array.isArray(o.Items) ? o.Items : [],
      customerName: o.CustomerName || "Khách",
    }));
  } catch (err) {
    console.error(">>> fetchBaristaOrders ERROR:", err);
    return [];
  }
}

