import { createContext, useContext, useState } from "react";

interface OrderContextType {
  orders: any[];
  setOrders: React.Dispatch<React.SetStateAction<any[]>>;
}

const OrderContext = createContext<OrderContextType>({
  orders: [],
  setOrders: () => {},
});

export const useOrders = () => useContext(OrderContext);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [orders, setOrders] = useState<any[]>([]);

  return (
    <OrderContext.Provider value={{ orders, setOrders }}>
      {children}
    </OrderContext.Provider>
  );
};
