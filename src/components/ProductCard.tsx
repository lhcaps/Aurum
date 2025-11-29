import { Star, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Format tiền VNĐ
const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);

interface ProductCardProps {
  id: string | number;
  name: string;
  price: number;
  image: string;
  rating: number;
  discount?: number;
  category?: string;

  // FIX: Nhận item để add vào cart
  onAddToCart: (item: {
    productId: number;
    name: string;
    price: number;
    image: string;
    size: string;
    toppings: string[];
    quantity: number;
  }) => void;
}

export const ProductCard = ({
  id,
  name,
  price,
  image,
  rating,
  discount,
  onAddToCart,
}: ProductCardProps) => {
  const finalPrice = discount ? (price * (100 - discount)) / 100 : price;

  // Hàm tạo item add vào cart
  const handleAdd = () => {
    onAddToCart({
      productId: Number(id),
      name,
      price: finalPrice,
      image,
      size: "M",           // mặc định
      toppings: [],        // mặc định
      quantity: 1,         // mặc định
    });
  };

  return (
    <div className="group relative bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-300 hover:-translate-y-1">

      {/* Tag giảm giá */}
      {discount && (
        <Badge className="absolute top-3 left-3 z-10 bg-destructive text-destructive-foreground px-3 py-1">
          -{discount}%
        </Badge>
      )}

      {/* Ảnh sản phẩm */}
      <div className="relative h-48 overflow-hidden bg-muted">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
      </div>

      {/* Thông tin */}
      <div className="p-4">
        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${i < rating
                  ? "fill-accent text-accent"
                  : "fill-muted text-muted-foreground"
                }`}
            />
          ))}
        </div>

        {/* Tên */}
        <h3 className="font-semibold text-card-foreground mb-2 line-clamp-1">
          {name}
        </h3>

        {/* Giá + nút add */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {discount && (
              <span className="text-sm text-muted-foreground line-through">
                {formatVND(price)}
              </span>
            )}
            <span className="text-lg font-bold text-primary">
              {formatVND(finalPrice)}
            </span>
          </div>

          <Button
            size="icon"
            className="rounded-xl bg-primary hover:bg-primary-dark shadow-medium"
            onClick={handleAdd}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
