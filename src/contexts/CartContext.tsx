import React, { createContext, useContext, useState, ReactNode } from "react";

// 🧾 Kiểu dữ liệu item trong giỏ hàng
export interface CartItem {
  id: string; // id duy nhất trong giỏ
  productId: number; // ID sản phẩm thực tế (để gửi API)
  name: string;
  price: number;
  image: string;
  size: string;
  toppings: string[];
  quantity: number;
  note?: string;
  options?: {
    sugar?: string;
    ice?: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Partial<CartItem>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateNote: (id: string, note: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // 🛒 Thêm sản phẩm mới vào giỏ (tự hợp nhất nếu trùng)
  const addItem = (item: Partial<CartItem>) => {
    // ✅ Xử lý id sản phẩm (fallback)
    const productId = Number(item.productId || item.id);
    if (!productId || isNaN(productId)) {
      console.warn("⚠️ Không có productId hợp lệ:", item);
      return;
    }

    const size = item.size || "M";
    const toppings = item.toppings || [];
    const options = item.options || {};
    const quantity = item.quantity || 1;

    // ✅ Tạo mã id duy nhất trong giỏ
    const uniqueId = `${productId}-${size}-${toppings.join(",")}`;

    // Kiểm tra xem sản phẩm trùng (cùng loại, size, topping) đã có chưa
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === productId &&
          i.size === size &&
          JSON.stringify(i.toppings) === JSON.stringify(toppings)
      );

      if (existingIndex !== -1) {
        // Nếu có, chỉ tăng số lượng
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        console.log("🔁 Tăng số lượng sản phẩm:", updated[existingIndex]);
        return updated;
      }

      // Nếu chưa có, thêm mới
      const newItem: CartItem = {
        id: `${uniqueId}-${Date.now()}`,
        productId,
        name: item.name || "Sản phẩm chưa đặt tên",
        price: item.price || 0,
        image: item.image || "",
        size,
        toppings,
        quantity,
        note: item.note || "",
        options,
      };

      console.log("🛒 Thêm mới vào giỏ:", newItem);
      return [...prev, newItem];
    });
  };

  // ❌ Xóa sản phẩm
  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  // 🔄 Cập nhật số lượng
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // ✏️ Cập nhật ghi chú
  const updateNote = (id: string, note: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, note } : item
      )
    );
  };

  // 🧹 Xóa toàn bộ giỏ hàng
  const clearCart = () => {
    setItems([]);
  };

  // 🧮 Tổng số lượng & tổng tiền
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        updateNote,
        clearCart,
        totalItems,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✅ Hook tiện lợi
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
