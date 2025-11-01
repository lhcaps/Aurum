import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Star } from "lucide-react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useCart } from "@/contexts/CartContext";
import MainLayout from "@/layouts/MainLayout"; // ✅ dùng layout chung
import Menu from "@/pages/menu/Menu";
import Index from "@/pages/menu/Index";
import { useNavigate } from 'react-router-dom';

const ProductModal = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  // 🧠 Mock dữ liệu — sau này thay bằng fetch API thật
  const product = {
    id: id || "65000101",
    name: "Trà Sữa Ô Long",
    sku: "65000101",
    basePrice: 59000,
    image:
      "https://images.unsplash.com/photo-1542444459-db81e5e20460?w=500&h=500&fit=crop",
    rating: 4.8,
    reviews: 1234,
    description:
      "Trà Ô Long Đài Loan thơm ngon kết hợp cùng sữa tươi béo ngậy, tạo nên hương vị đặc trưng của Phúc Long.",
    sizes: [
      { id: "M", name: "M", price: -14000 },
      { id: "L", name: "L", price: 0 },
    ],
    customizations: [
      {
        id: "sweetness",
        label: "Độ ngọt",
        choices: [
          { value: "less", label: "Ít" },
          { value: "normal", label: "Bình thường" },
          { value: "more", label: "Nhiều" },
        ],
      },
      {
        id: "ice",
        label: "Lượng đá",
        choices: [
          { value: "less", label: "Ít" },
          { value: "normal", label: "Bình thường" },
          { value: "more", label: "Nhiều" },
        ],
      },
    ],
    toppings: [
      { id: "pearl", name: "Trân châu đen", price: 10000 },
      { id: "jelly", name: "Thạch cà phê", price: 10000 },
      { id: "pudding", name: "Pudding", price: 12000 },
    ],
  };

  // 🧩 State
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("L");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [customizations, setCustomizations] = useState<Record<string, string>>({
    sweetness: "normal",
    ice: "normal",
  });

  // 🧮 Tính tổng giá
  const calculatePrice = () => {
    const sizePrice =
      product.sizes.find((s) => s.id === selectedSize)?.price || 0;
    const toppingPrice = selectedToppings.reduce((sum, id) => {
      const t = product.toppings.find((t) => t.id === id);
      return sum + (t?.price || 0);
    }, 0);
    return (product.basePrice + sizePrice + toppingPrice) * quantity;
  };

  // 🛒 Thêm vào giỏ
  const handleAddToCart = () => {
    const numericId = Number(product.id); // ✅ ép thành số
    if (isNaN(numericId)) {
      toast.error("Sản phẩm không hợp lệ, không thể thêm vào giỏ hàng!");
      return;
    }

    addItem({
      productId: numericId,
      name: product.name,
      image: product.image,
      size: selectedSize,
      toppings: selectedToppings,
      price: calculatePrice() / quantity,
      quantity,
      options: {
        sugar: customizations.sweetness,
        ice: customizations.ice,
      },
    });

    toast.success("🛍️ Đã thêm vào giỏ hàng!", {
      description: `${product.name} - ${quantity} ly (${selectedSize})`,
    });

    console.log("🧾 [DEBUG] Thêm vào giỏ hàng:", {
      productId: numericId,
      size: selectedSize,
      toppings: selectedToppings,
      options: customizations,
      price: calculatePrice() / quantity,
    });
  };


  // 🧊 Toggle topping
  const toggleTopping = (id: string) => {
    setSelectedToppings((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (

    <div className="container mx-auto px-4 py-8">
      {/* 🧭 Breadcrumb */}
      <div className="text-sm text-muted-foreground mb-6">
        <span>Trang chủ</span>
        <span className="mx-2">/</span>
        <span>Menu</span>
        <span className="mx-2">/</span>
        <span className="text-foreground font-semibold">
          {product.name}
        </span>
      </div>

      {/* 🔹 Grid chính */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Ảnh sản phẩm */}
        <div className="space-y-4">
          <Card className="overflow-hidden bg-muted/30">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-[420px] object-cover"
            />
          </Card>

          {/* Rating + Tag */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-bold text-lg">{product.rating}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.reviews} đánh giá
              </p>
            </Card>
            <Card className="p-4 text-center">
              <div className="font-bold text-lg mb-1 text-primary">
                Best Seller
              </div>
              <p className="text-sm text-muted-foreground">
                Top 5 bán chạy
              </p>
            </Card>
          </div>
        </div>

        {/* Thông tin chi tiết */}
        <div className="space-y-6">
          {/* Tiêu đề */}
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-3xl font-bold text-foreground">
              {product.name} ({selectedSize})
            </h1>
            <Button variant="ghost" size="icon">
              <Heart className="w-6 h-6" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>

          {/* Giá */}
          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-bold text-primary">
              {calculatePrice().toLocaleString()}đ
            </span>
            {selectedSize === "M" && (
              <Badge variant="secondary">-14.000đ</Badge>
            )}
          </div>

          {/* Mô tả */}
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>

          {/* Kích cỡ */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Chọn kích cỡ
            </label>
            <div className="flex gap-3">
              {product.sizes.map((size) => (
                <Button
                  key={size.id}
                  variant={selectedSize === size.id ? "default" : "outline"}
                  className="flex-1 h-12 text-lg font-medium"
                  onClick={() => setSelectedSize(size.id)}
                >
                  {size.name}
                  {size.price !== 0 && (
                    <span className="ml-2 text-sm">
                      ({size.price > 0 ? "+" : ""}
                      {size.price.toLocaleString()}đ)
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Tùy chỉnh */}
          {product.customizations.map((option) => (
            <div key={option.id}>
              <label className="block text-sm font-medium mb-3">
                {option.label}
              </label>
              <div className="flex gap-3">
                {option.choices.map((choice) => (
                  <Button
                    key={choice.value}
                    variant={
                      customizations[option.id] === choice.value
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      setCustomizations((prev) => ({
                        ...prev,
                        [option.id]: choice.value,
                      }))
                    }
                  >
                    {choice.label}
                  </Button>
                ))}
              </div>
            </div>
          ))}

          {/* Toppings */}
          <div>
            <label className="block text-sm font-medium mb-3">
              Topping (tùy chọn)
            </label>
            <div className="grid grid-cols-2 gap-3">
              {product.toppings.map((topping) => (
                <Button
                  key={topping.id}
                  variant={
                    selectedToppings.includes(topping.id)
                      ? "default"
                      : "outline"
                  }
                  className="justify-between"
                  onClick={() => toggleTopping(topping.id)}
                >
                  <span>{topping.name}</span>
                  <span className="text-primary">
                    +{topping.price.toLocaleString()}đ
                  </span>
                </Button>
              ))}
            </div>
          </div>

          {/* Số lượng + Thêm giỏ */}
          <div className="border-t border-border pt-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setQuantity((q) => Math.max(1, q - 1))
                  }
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="px-6 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setQuantity((q) => q + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              className="w-full h-14 text-lg font-semibold"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Thêm vào giỏ hàng ({calculatePrice().toLocaleString()}đ)
            </Button>
          </div>

          {/* Thông tin thêm */}
          <Card className="p-4 bg-muted/30">
            <h3 className="font-medium mb-2">Thông tin thêm</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• Giao hàng trong vòng 30-45 phút</li>
              <li>• Miễn phí giao hàng cho đơn từ 100.000đ</li>
              <li>• Đổi trả trong 24h nếu có vấn đề</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
