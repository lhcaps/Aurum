import { createContext, useContext, useState } from "react";
import { 
    payOrder,
    fetchCashierOrders,
    fetchBaristaOrders 
} from "@/services/orderWorkflow";

// ============================================
// 0. ORDER TYPE DEFINITION (CHUẨN HÓA)
// ============================================
export interface OrderType {
    id: string;
    orderNumber: number;
    status:
        | "new"
        | "pending"
        | "waiting"
        | "preparing"
        | "brewing"
        | "processing"
        | "completed"
        | "cancelled";

    items: Array<any>;
    total: number;

    time: Date | string; // Cho phép cả 2
    type?: string;       // POS không có field này
    cashier?: string;    // POS không có field này
    paymentMethod?: string;
}

// ============================================
// 1. OrderContext TYPE
// ============================================
interface OrderContextType {
    orders: OrderType[];
    setOrders: React.Dispatch<React.SetStateAction<OrderType[]>>;
    refreshOrders: () => Promise<void>;
    completePayment: (
        orderId: number,
        paymentMethod: string,
        customerPaid: number
    ) => Promise<void>;
    addOrder: (newOrder: OrderType) => void;
}

const OrderContext = createContext<OrderContextType>({
    orders: [],
    setOrders: () => {},
    refreshOrders: async () => {},
    completePayment: async () => {},
    addOrder: () => {},
});

export const useOrders = () => useContext(OrderContext);

// ============================================
// 2. PROVIDER
// ============================================
export const OrderProvider = ({ children }: { children: React.ReactNode }) => {

    const [orders, setOrders] = useState<OrderType[]>([]);

    // ================================
    // REFRESH ORDERS (HỢP NHẤT + CHUẨN HÓA)
    // ================================
    const refreshOrders = async () => {
        try {
            const [cashier, barista] = await Promise.all([
                fetchCashierOrders(),
                fetchBaristaOrders()
            ]);

            // Chuẩn hóa POS Orders
            const cashierNormalized: OrderType[] = cashier.map(o => ({
                id: o.id,
                orderNumber: o.orderNumber ?? o.id,
                status: o.status,
                items: o.items,
                total: o.total,
                time: o.createdAt,
                type: "pos",
                cashier: o.customerName,
            }));

            // Chuẩn hóa Barista Orders
            const baristaNormalized: OrderType[] = barista.map(o => ({
                id: o.id,
                orderNumber: o.orderNumber ?? o.id,
                status: o.status,
                items: o.items,
                total: o.total,
                time: o.createdAt,
                type: "barista",
                cashier: "Barista",
            }));

            setOrders([...cashierNormalized, ...baristaNormalized]);

        } catch (err) {
            console.error("Lỗi load orders:", err);
        }
    };

    // ================================
    // ADD ORDER
    // ================================
    const addOrder = (newOrder: OrderType) => {
        setOrders(prev => [newOrder, ...prev]);
    };

    // ================================
    // COMPLETE PAYMENT
    // ================================
    const completePayment = async (
        orderId: number,
        paymentMethod: string,
        customerPaid: number
    ) => {
        try {
            await payOrder(orderId, paymentMethod, customerPaid);
            await refreshOrders();
        } catch (error) {
            console.error("Lỗi thanh toán:", error);
        }
    };

    return (
        <OrderContext.Provider
            value={{
                orders,
                setOrders,
                refreshOrders,
                completePayment,
                addOrder,
            }}
        >
            {children}
        </OrderContext.Provider>
    );
};
