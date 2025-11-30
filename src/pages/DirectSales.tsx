import { useState, useEffect } from "react";
import { Plus, Minus, Trash2, ShoppingCart, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { productService } from "@/services/product.service";
import { PaymentDialog } from "@/components/cashier/PaymentDialog";
import { createOrderApi } from "@/services/orderWorkflow";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  hasSize?: boolean;
  hasToppings?: boolean;
}

// --- Constants ---

const sizes = [
  { id: "S", name: "Size S", price: 0 },
  { id: "M", name: "Size M", price: 5000 },
  { id: "L", name: "Size L", price: 10000 },
];

// 🔑 CHỈ DÙNG MỘT BIẾN toppingOptions DUY NHẤT
const toppingOptions = [
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

const categories = [
  { id: "all", name: "Tất cả", icon: "🍽️" },
  { id: "coffee", name: "Cà phê", icon: "☕" },
  { id: "tea", name: "Trà", icon: "🍵" },
  { id: "smoothie", name: "Sinh tố", icon: "🥤" },
  { id: "food", name: "Đồ ăn", icon: "🥖" },
];

const iceOptions = [
  { id: "100", name: "Đá 100%" },
  { id: "70", name: "Đá 70%" },
  { id: "50", name: "Đá 50%" },
  { id: "30", name: "Đá 30%" },
  { id: "0", name: "Không đá" },
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

  // Customize options state
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedIce, setSelectedIce] = useState("100");

  // Data states
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Payment states
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderToPay, setOrderToPay] = useState<any>(null);

  // 1. Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const data = await productService.getAllProductsForCashier();
        setProducts(data);
      } catch (error) {
        console.error("Lỗi tải sản phẩm:", error);
        toast.error("Không thể tải danh sách sản phẩm. Kiểm tra API.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. Filter Products
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === "all" || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // 3. Helper Functions
  const openCustomizeDialog = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize("M");
    setSelectedToppings([]);
    setSelectedIce("100");
    setCustomizeDialogOpen(true);
  };

  const calculateItemPrice = (product: Product, size: string, toppingIds: string[]) => {
    let price = product.price;
    if (product.hasSize) {
      const sizeOption = sizes.find((s) => s.id === size);
      if (sizeOption) price += sizeOption.price;
    }
    if (product.hasToppings) {
      toppingIds.forEach((toppingId) => {
        const topping = toppingOptions.find((t) => t.id === toppingId);
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

  // 4. Handle Checkout (Async API Call)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }

    // Chuẩn bị payload gửi BE
    const itemsPayload = cart.map((item) => ({
      productId: parseInt(item.product.id, 10),
      name: item.product.name,
      quantity: item.quantity,
      price: item.totalPrice,
      size: item.size || 'M',
      // 🔑 Dùng toppingOptions đúng
      toppings: item.selectedToppings.map((id) => toppingOptions.find((t) => t.id === id)?.name || ""),
    }));

    const orderPayload = {
      items: itemsPayload,

      // FE phải gửi
      subtotal: totalAmount,
      total: totalAmount,
      shippingFee: 0,
      serviceFee: 0,
      discountAmount: 0,
      voucherCode: null,

      // BẮT BUỘC phải có
      paymentMethod: "COD",            // thanh toán tại quầy
      fulfillmentMethod: "AtStore",    // đơn tại chỗ (DirectSales)
      pickupMethod: "AtStore",

      // Delivery info – không dùng → set null
      shippingAddress: null,
      lat: null,
      lng: null,

      storeId: 1,
      isOnlinePaid: false
    };


    try {
      // Gọi API tạo đơn
      const createRes = await createOrderApi(orderPayload);
      const dbOrderId = createRes.data?.orderId;
      const dbTotalAmount = createRes.data?.totalAmount || totalAmount;

      if (!dbOrderId) {
        throw new Error("Không nhận được ID đơn hàng từ máy chủ.");
      }

      // Tạo object hiển thị FE
      const finalizedOrder = {
        id: dbOrderId.toString(),
        orderNumber: dbOrderId,
        status: "pending" as const,
        items: orderPayload.items,
        total: dbTotalAmount,
        time: new Date(),
        type: "dine-in" as const,
        cashier: "Thu ngân",
      };

      // Cập nhật UI
      setOrderToPay(finalizedOrder);
      setOrderToPay(finalizedOrder);
      setPaymentDialogOpen(true);
      setCart([]);
      toast.success(`Đã tạo đơn hàng #${finalizedOrder.orderNumber}!`);

    } catch (error: any) {
      console.error("Lỗi tạo đơn hàng:", error);
      toast.error(`Tạo đơn hàng thất bại: ${error.message}`);
    }
  };

  return (
    <div className="h-full flex bg-background">
      {/* --- Left Side: Product List --- */}
      <div className="w-2/3 flex flex-col overflow-hidden">
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

        {/* Categories */}
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

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {loadingProducts ? (
            <div className="text-center text-muted-foreground py-10">
              ☕ Đang tải menu từ máy chủ...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
              😞 Không tìm thấy sản phẩm nào.
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg transition-all hover:scale-105"
                  onClick={() => openCustomizeDialog(product)}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex justify-center h-24 w-full">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-auto object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x=\'50%\' y=\'50%\' style=\'font-size:70px; text-anchor:middle;\'>☕</text></svg>';
                          e.currentTarget.className = "h-full w-auto object-contain";
                        }}
                      />
                    </div>
                    <h3 className="font-semibold text-sm mb-2 line-clamp-2">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price.toLocaleString("vi-VN")}đ</p>
                  </CardContent>
                  <CardFooter className="p-3 pt-0">
                    <Button size="sm" className="w-full" variant="secondary">
                      <Plus className="h-4 w-4 mr-1" /> Thêm
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- Right Side: Cart Sidebar --- */}
      <div className="w-1/3 border-l border-border bg-card flex flex-col">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2 mb-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Giỏ hàng</h2>
            <Badge variant="secondary" className="ml-auto">{cart.length}</Badge>
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
                  {/* Product Image in Cart */}
                  <div className="flex-shrink-0 h-12 w-12">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="h-full w-full object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x=\'50%\' y=\'50%\' style=\'font-size:70px; text-anchor:middle;\'>☕</text></svg>';
                        e.currentTarget.className = "h-full w-full object-contain";
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm mb-1 line-clamp-1">{item.product.name}</h4>
                    <div className="text-xs text-muted-foreground mb-2 space-y-1">
                      {item.size && (
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs py-0 px-1.5">{item.size}</Badge>
                          <Badge variant="outline" className="text-xs py-0 px-1.5">{iceOptions.find((i) => i.id === item.ice)?.name}</Badge>
                        </div>
                      )}
                      {item.selectedToppings.length > 0 && (
                        <div className="text-xs">
                          {item.selectedToppings.map((toppingId) => {
                            // 🔑 FIX: Dùng toppingOptions
                            const topping = toppingOptions.find((t) => t.id === toppingId);
                            return topping ? (
                              <Badge key={toppingId} variant="secondary" className="text-xs mr-1 py-0 px-1.5">
                                + {topping.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </div>
                    <p className="text-primary font-bold text-sm mb-2">{item.totalPrice.toLocaleString("vi-VN")}đ</p>
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(index, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="font-semibold w-8 text-center">{item.quantity}</span>
                      <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => updateQuantity(index, 1)}><Plus className="h-3 w-3" /></Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive hover:text-destructive" onClick={() => removeFromCart(index)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Payment Summary & Button (Inside Scroll Area) */}
          {cart.length > 0 && (
            <div className="p-2 space-y-4 border-t border-border mt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tạm tính</span>
                  <span className="font-semibold">{totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-primary flex-shrink-0">{totalAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>
              <div className="px-2">
                <Button size="lg" className="w-full px-2" disabled={cart.length === 0} onClick={handleCheckout}>
                  Thanh toán
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- Customize Dialog --- */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl">Tùy chỉnh đồ uống</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-full w-full object-cover rounded"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text x=\'50%\' y=\'50%\' style=\'font-size:70px; text-anchor:middle;\'>☕</text></svg>';
                      e.currentTarget.className = "h-full w-full object-contain";
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{selectedProduct.name}</h3>
                  <p className="text-sm text-primary font-bold">{selectedProduct.price.toLocaleString("vi-VN")}đ</p>
                </div>
              </div>
              {selectedProduct.hasSize && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Chọn size</Label>
                  <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                    <div className="grid grid-cols-3 gap-2">
                      {sizes.map((size) => (
                        <div key={size.id} className="relative">
                          <RadioGroupItem value={size.id} id={size.id} className="peer sr-only" />
                          <Label htmlFor={size.id} className="flex flex-col items-center justify-center p-3 border-2 border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors">
                            <span className="font-semibold">{size.name}</span>
                            {size.price > 0 && <span className="text-xs text-muted-foreground">+{size.price.toLocaleString("vi-VN")}đ</span>}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </RadioGroup>
                </div>
              )}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Lượng đá</Label>
                <RadioGroup value={selectedIce} onValueChange={setSelectedIce}>
                  <div className="grid grid-cols-3 gap-2">
                    {iceOptions.map((ice) => (
                      <div key={ice.id} className="relative">
                        <RadioGroupItem value={ice.id} id={`ice-${ice.id}`} className="peer sr-only" />
                        <Label htmlFor={`ice-${ice.id}`} className="flex items-center justify-center p-3 border-2 border-border rounded-lg cursor-pointer peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/10 hover:bg-muted transition-colors text-sm font-medium text-center">
                          {ice.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              {selectedProduct.hasToppings && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Topping (tùy chọn)</Label>
                  <div className="space-y-2">
                    {toppingOptions.map((topping) => ( // 🔑 FIX: Dùng toppingOptions
                      <div key={topping.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={topping.id}
                            checked={selectedToppings.includes(topping.id)}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedToppings([...selectedToppings, topping.id]);
                              else setSelectedToppings(selectedToppings.filter((id) => id !== topping.id));
                            }}
                          />
                          <Label htmlFor={topping.id} className="font-medium cursor-pointer">{topping.name}</Label>
                        </div>
                        <span className="text-sm font-semibold text-primary">+{topping.price.toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                <span className="font-semibold">Tổng cộng:</span>
                <span className="text-xl font-bold text-primary">{calculateItemPrice(selectedProduct, selectedSize, selectedToppings).toLocaleString("vi-VN")} đ</span>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setCustomizeDialogOpen(false)}>Hủy</Button>
                <Button className="flex-1" onClick={addToCart}>Thêm vào giỏ</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- Payment Dialog --- */}
      {orderToPay && (
        <PaymentDialog
          isOpen={paymentDialogOpen}
          onClose={() => {
            setPaymentDialogOpen(false);
            setOrderToPay(null);
          }}
          order={orderToPay}
        />
      )}
    </div>
  );
}