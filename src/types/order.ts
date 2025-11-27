export type OrderStatus =
  "pending" |
  "waiting" |    
  "preparing" |   
  "done" |
  "completed" |
  "brewing" |     
  "cancelled" |
  "refunded" |
  "processing" |
  "new";       

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

  status: OrderStatus; // Sẽ bao gồm tất cả các status đã sửa ở trên
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;

  amountPaid?: number;
  changeAmount?: number;

  items: OrderItem[];

  createdAt: string;

  productSummary?: string;

  // FE generated fields
  orderNumber?: number;
  time?: string;
  type?: "take-away" | "dine-in";
  cashier?: string;
}