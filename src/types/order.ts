export type OrderStatus =
  | "pending"
  | "waiting"
  | "preparing"
  | "brewing"
  | "done"
  | "completed"
  | "cancelled"
  | "refunded"
  | "processing"
  | "new";

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

export type FulfillmentMethod = "Delivery" | "AtStore";

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

  // Backend field
  fulfillmentMethod?: FulfillmentMethod;

  // FE computed fields
  orderNumber?: number;
  time?: string;

  // FE derived type (Cashier/Barista)
  type: "delivery" | "atstore";

  cashier?: string;
}
