export type OrderStatus = "pending" | "waiting" | "preparing" | "done" | "canceled" | "refunded";
export type PaymentStatus = "unpaid" | "paid" | "refunded";
export type PaymentMethod = "cash" | "momo" | "zalopay" | "bank_transfer";

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  name?: string;
  size?: string;
  toppings?: string[];
  notes?: string;
}

export interface Order {
  id: number;
  userId: number;
  storeId?: number;

  total: number;
  subtotal?: number;
  shippingFee?: number;

  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;

  amountPaid?: number;
  changeAmount?: number;

  items: OrderItem[];

  createdAt: string;

  productSummary?: string;

  // FE generated fields
  orderNumber?: number; 
  time?: Date | null;     
        // ✔ THÊM DÒNG NÀY
  type?: "take-away" | "dine-in";
  cashier?: string;
}
