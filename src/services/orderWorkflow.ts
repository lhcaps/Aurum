import api from "@/lib/api";
export async function fetchNewOrders() {
  const res = await api.get("/api/pos/orders");
  return res.data.data;
}
export async function fetchCashierOrders() {
  return (await api.get("/api/admin/workflow/orders")).data.data;
}

export async function acceptOrder(id: number) {
  return (await api.patch(`/api/admin/workflow/${id}/accept`)).data;
}

export async function moveOrderToMaking(id: number) {
  return (await api.patch(`/api/admin/workflow/${id}/move-to-making`)).data;
}
