import { useState } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useOrders } from "@/contexts/OrderContext";
import { toast } from "sonner";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  hasSize?: boolean;
  hasToppings?: boolean;
}

const sizes = [
  { id: "S", name: "Size S", price: 0 },
  { id: "M", name: "Size M", price: 5000 },
  { id: "L", name: "Size L", price: 10000 },
];

const toppings = [
  { id: "pearl", name: "Trân châu đen", price: 8000 },
  { id: "pearl-white", name: "Trân châu trắng", price: 8000 },
  { id: "jelly", name: "Thạch rau câu", price: 8000 },
  { id: "jelly-coffee", name: "Thạch cà phê", price: 10000 },
  { id: "pudding", name: "Pudding", price: 10000 },
  { id: "aloe", name: "Nha đam", price: 8000 },
  { id: "cheese", name: "Phô mai kem", price: 15000 },
  { id: "egg", name: "Trứng cút", price: 8000 },
  { id: "coconut", name: "Dừa dầm", price: 10000 },
  { id: "longan", name: "Nhãn", price: 12000 },
];

const iceOptions = [
  { id: "100", name: "Đá 100%" },
  { id: "70", name: "Đá 70%" },
  { id: "50", name: "Đá 50%" },
  { id: "30", name: "Đá 30%" },
  { id: "0", name: "Không đá" },
];

const products: Product[] = [
  // Cà phê
  { id: "cf1", name: "Cà phê đen đá", category: "coffee", price: 29000, image: "☕", hasSize: true, hasToppings: false },
  { id: "cf2", name: "Cà phê sữa đá", category: "coffee", price: 32000, image: "☕", hasSize: true, hasToppings: false },
  { id: "cf3", name: "Bạc xỉu", category: "coffee", price: 32000, image: "☕", hasSize: true, hasToppings: false },
  { id: "cf4", name: "Cà phê latte", category: "coffee", price: 45000, image: "☕", hasSize: true, hasToppings: false },
  { id: "cf5", name: "Cappuccino", category: "coffee", price: 45000, image: "☕", hasSize: true, hasToppings: false },
  
  // Trà
  { id: "tr1", name: "Trà đào cam sả", category: "tea", price: 42000, image: "🍵", hasSize: true, hasToppings: true },
  { id: "tr2", name: "Trà sen vàng", category: "tea", price: 42000, image: "🍵", hasSize: true, hasToppings: true },
  { id: "tr3", name: "Trà phúc long", category: "tea", price: 38000, image: "🍵", hasSize: true, hasToppings: true },
  { id: "tr4", name: "Trà sữa trân châu", category: "tea", price: 45000, image: "🍵", hasSize: true, hasToppings: true },
  
  // Sinh tố
  { id: "st1", name: "Sinh tố bơ", category: "smoothie", price: 48000, image: "🥤", hasSize: true, hasToppings: true },
  { id: "st2", name: "Sinh tố dâu", category: "smoothie", price: 48000, image: "🥤", hasSize: true, hasToppings: true },
  { id: "st3", name: "Sinh tố xoài", category: "smoothie", price: 48000, image: "🥤", hasSize: true, hasToppings: true },
  
  // Bánh
  { id: "bk1", name: "Bánh mì pate", category: "food", price: 22000, image: "🥖", hasSize: false, hasToppings: false },
  { id: "bk2", name: "Bánh croissant", category: "food", price: 28000, image: "🥐", hasSize: false, hasToppings: false },
  { id: "bk3", name: "Bánh tiramisu", category: "food", price: 38000, image: "🍰", hasSize: false, hasToppings: false },
];

const categories = [
  { id: "all", name: "Tất cả", icon: "🍽️" },
  { id: "coffee", name: "Cà phê", icon: "☕" },
  { id: "tea", name: "Trà", icon: "🍵" },
  { id: "smoothie", name: "Sinh tố", icon: "🥤" },
  { id: "food", name: "Đồ ăn", icon: "🥖" },
];

interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  selectedToppings: string[];
  ice: string;
  totalPrice: number;
  note?: string;
}

export default function DirectSales() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  
  // Customize options
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedIce, setSelectedIce] = useState("100");
  
  const { addOrder } = useOrders();

  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const openCustomizeDialog = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize("M");
    setSelectedToppings([]);
    setSelectedIce("100");
    setCustomizeDialogOpen(true);
  };

  const calculateItemPrice = (product: Product, size: string, toppingIds: string[]) => {
    let price = product.price;
    
    // Add size price
    if (product.hasSize) {
      const sizeOption = sizes.find((s) => s.id === size);
      if (sizeOption) price += sizeOption.price;
    }
    
    // Add toppings price
    if (product.hasToppings) {
      toppingIds.forEach((toppingId) => {
        const topping = toppings.find((t) => t.id === toppingId);
        if (topping) price += topping.price;
      });
    }
    
    return price;
  };

  const addToCart = () => {
    if (!selectedProduct) return;
    
    const totalPrice = calculateItemPrice(selectedProduct, selectedSize, selectedToppings);
    
    setCart((prev) => [
      ...prev,
      {
        product: selectedProduct,
        quantity: 1,
        size: selectedProduct.hasSize ? selectedSize : undefined,
        selectedToppings: selectedProduct.hasToppings ? selectedToppings : [],
        ice: selectedIce,
        totalPrice,
      },
    ]);
    
    toast.success(`Đã thêm ${selectedProduct.name} vào giỏ hàng`);
    setCustomizeDialogOpen(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) =>
          i === index
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = cart.reduce(
    (sum, item) => sum + item.totalPrice * item.quantity,
    0
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    const order = {
      id: `order-${Date.now()}`,
      orderNumber: 1280 + Math.floor(Math.random() * 1000),
      status: "new" as const,
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        size: item.size || "M",
        quantity: item.quantity,
        price: item.totalPrice,
        toppings: item.selectedToppings.map((id) => toppings.find((t) => t.id === id)?.name || ""),
        notes: item.note || "",
      })),
      total: totalAmount,
      time: new Date(),
      type: "dine-in" as const,
      cashier: "Thu ngân",
    };

    addOrder(order);
    setCart([]);
    toast.success("Đã tạo đơn hàng, chuyển sang thanh toán!");
  };

  return (
    <div className="h-full flex bg-background">
      {/* Danh sách sản phẩm */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-border bg-card">
          <h1 className="text-2xl font-bold mb-4">Bán hàng trực tiếp</h1>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm sản phẩm..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Danh mục */}
        <div className="px-6 py-4 border-b border-border bg-card/50">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start">
              {categories.map((cat) => (
                <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Grid sản phẩm */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                onClick={() => openCustomizeDialog(product)}
              >
                <CardContent className="p-4">
                  <div className="text-5xl mb-3 text-center">{product.image}</div>
                  <h3 className="font-semibold text-sm mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold">
                    {product.price.toLocaleString("vi-VN")}đ
                  </p>
                </CardContent>
                <CardFooter className="p-3 pt-0">
                  <Button size="sm" className="w-full" variant="secondary">
                    <Plus className="h-4 w-4 mr-1" />
                    Thêm
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Giỏ hàng */}
      <div className="w-96 border-l border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Giỏ hàng</h2>
            <Badge variant="secondary" className="ml-auto">
              {cart.length}
            </Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Giỏ hàng trống</p>
            </div>
          ) : (
            cart.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">{item.product.image}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">
                      {item.product.name}
                    </h4>
                    
                    {/* Size, Toppings, Ice info */}
                    <div className="text-xs text-muted-foreground mb-2 space-y-1">
                      {item.size && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs py-0 px-1.5">
                            {item.size}
                          </Badge>
                          <Badge variant="outline" className="text-xs py-0 px-1.5">
                            {iceOptions.find((i) => i.id === item.ice)?.name}
                          </Badge>
                        </div>
                      )}
                      {item.selectedToppings.length > 0 && (
                        <div className="text-xs">
                          {item.selectedToppings.map((toppingId) => {
                            const topping = toppings.find((t) => t.id === toppingId);
                            return topping ? (
                              <Badge
                                key={toppingId}
                                variant="secondary"
                                className="text-xs mr-1 py-0 px-1.5"
                              >
                                + {topping.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    
                    <p className="text-primary font-bold text-sm mb-2">
                      {item.totalPrice.toLocaleString("vi-VN")}đ
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(index, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(index, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                        onClick={() => removeFromCart(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Tổng tiền và thanh toán */}
        <div className="p-6 border-t border-border bg-card/50 space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tạm tính</span>
              <span className="font-semibold">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng cộng</span>
              <span className="text-primary">
                {totalAmount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>

          <Button
            size="lg"
            className="w-full"
            disabled={cart.length === 0}
            onClick={handleCheckout}
          >
            Thanh toán
          </Button>
        </div>
      </div>

      {/* Customize Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl">Tùy chỉnh đồ uống</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-6">
              {/* Product Info */}
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="text-4xl">{selectedProduct.image}</div>
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-primary font-bold">
                    {selectedProduct.price.toLocaleString("vi-VN")}đ
                  </p>
                </div>
              </div>

              {/* Size Selection */}
              {selectedProduct.hasSize && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Chọn size</Label>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                        <div key={size.id} className="relative">
                          <RadioGroupItem
                            value={size.id}
                            id={size.id}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={size.id}
                            className="flex flex-col items-center justify-center p-3 border-2 border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors"
                          >
                            <span className="font-semibold">{size.name}</span>
                            {size.price > 0 && (
                              <span className="text-xs text-muted-foreground">
                                +{size.price.toLocaleString("vi-VN")}đ
                              </span>
                            )}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* Ice Selection */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Lượng đá</Label>
                <RadioGroup value={selectedIce} onValueChange={setSelectedIce}>
                  <div className="grid grid-cols-3 gap-2">
                    {iceOptions.map((ice) => (
                      <div key={ice.id} className="relative">
                        <RadioGroupItem
                          value={ice.id}
                          id={`ice-${ice.id}`}
                          className="peer sr-only"
                        />
                        <Label
                          htmlFor={`ice-${ice.id}`}
                          className="flex items-center justify-center p-3 border-2 border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors text-sm font-medium text-center"
                        >
                          {ice.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Toppings Selection */}
              {selectedProduct.hasToppings && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Topping (tùy chọn)</Label>
                  <div className="space-y-2">
                    {toppings.map((topping) => (
                      <div
                        key={topping.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={topping.id}
                            checked={selectedToppings.includes(topping.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedToppings([...selectedToppings, topping.id]);
                              } else {
                                setSelectedToppings(
                                  selectedToppings.filter((id) => id !== topping.id)
                                );
                              }
                            }}
                          />
                          <Label
                            htmlFor={topping.id}
                            className="font-medium cursor-pointer"
                          >
                            {topping.name}
                          </Label>
                        </div>
                        <span className="text-sm font-semibold text-primary">
                          +{topping.price.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Price */}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold text-primary">
                  {calculateItemPrice(
                    selectedProduct,
                    selectedSize,
                    selectedToppings
                  ).toLocaleString("vi-VN")}
                  đ
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCustomizeDialogOpen(false)}
                >
                  Hủy
                </Button>
                <Button className="flex-1" onClick={addToCart}>
                  Thêm vào giỏ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
