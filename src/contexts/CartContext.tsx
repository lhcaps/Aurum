import React, { createContext, useContext, useState, ReactNode } from "react";

// 🧾 Kiểu dữ liệu item trong giỏ hàng
export interface CartItem {
  id: string; // id duy nhất trong giỏ
  productId: number; // ID sản phẩm thực tế (để gửi API)
  name: string;
  productName?: string;
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
  // ✅ Hàm thêm nhiều sản phẩm
  addMultipleItems: (items: Partial<CartItem>[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // 📝 HÀM HỖ TRỢ: Xử lý logic thêm/hợp nhất 1 item vào state giỏ hàng
  const processNewItem = (item: Partial<CartItem>) => {

    const productId = Number(item.productId);
    if (!productId || isNaN(productId)) {
      console.warn("⚠️ productId không hợp lệ:", item);
      return;
    }


    const size = item.size || "M";
    const toppings = item.toppings || [];
    const quantity = item.quantity || 1;
    const realName = item.productName || item.name || "Sản phẩm";

    // Tạo mã id duy nhất trong giỏ
    const uniqueId = `${productId}-${size}-${toppings.join(",")}-${item.note || ""}`;

    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) =>
          i.productId === productId &&
          i.size === size &&
          JSON.stringify(i.toppings) === JSON.stringify(toppings)
        // ⚠️ Cân nhắc: Có nên hợp nhất nếu ghi chú (note) khác nhau không? Hiện tại không check note.
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
        // Dùng uniqueId và timestamp để đảm bảo item mới là duy nhất ngay cả khi trùng option
        id: `${uniqueId}-${Date.now()}`,
        productId,
        name: realName,
        price: item.price || 0,
        image: item.image || "",
        size,
        toppings,
        quantity,
        note: item.note || "",
        options: item.options || {},
      };

      console.log("🛒 Thêm mới vào giỏ:", newItem);
      return [...prev, newItem];
    });
  };

  // 🛒 Thêm sản phẩm mới vào giỏ (chỉ 1 item)
  const addItem = (item: Partial<CartItem>) => {
    processNewItem(item);
  };

  // 🟢 Thêm nhiều sản phẩm (dùng trong Đặt lại)
  const addMultipleItems = (newItems: Partial<CartItem>[]) => {
    newItems.forEach(processNewItem);
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
        addMultipleItems, // ✅ Đã thêm vào value
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