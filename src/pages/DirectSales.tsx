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
import { ToppingService } from "@/lib/menu/toppingService";
import { Coffee, IceCream, Cake, Salad, Wine, UtensilsCrossed } from "lucide-react";

// ===============================
// INTERFACES + CONST
// ===============================
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
  { id: "M", name: "Size M", diff: -5000 },
  { id: "L", name: "Size L", diff: 0 },
];

const categories = [
  { id: "all", name: "Tất cả", icon: UtensilsCrossed },
  { id: "3", name: "Cà phê", icon: Coffee },
  { id: "19", name: "Trà", icon: Wine },
  { id: "20", name: "Sinh tố", icon: IceCream },
  { id: "21", name: "Bánh", icon: Cake },
  { id: "22", name: "Đồ ăn nhẹ", icon: Salad },
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

// ===============================
// COMPONENT
// ===============================
export default function DirectSales() {

  const user = JSON.parse(localStorage.getItem("auth_user") || "{}");
  // STATES
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [customizeDialogOpen, setCustomizeDialogOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState("M");
  const [selectedToppings, setSelectedToppings] = useState<string[]>([]);
  const [selectedIce, setSelectedIce] = useState("100");
  const [products, setProducts] = useState<Product[]>([]);
  const [toppings, setToppings] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [orderToPay, setOrderToPay] = useState<any>(null);
  const [moneyReceived, setMoneyReceived] = useState<number | null>(null);
  const [changeAmount, setChangeAmount] = useState(0);

  // TOTAL AMOUNT
  const totalAmount = cart.reduce(
    (sum, item) => sum + item.totalPrice * item.quantity,
    0
  );

  // AUTO CALCULATE CHANGE
  useEffect(() => {
    if (moneyReceived !== null && moneyReceived >= totalAmount) {
      setChangeAmount(moneyReceived - totalAmount);
    } else {
      setChangeAmount(0);
    }
  }, [moneyReceived, totalAmount]);

  // FETCH PRODUCTS
useEffect(() => {
  const fetchData = async () => {
    setLoadingProducts(true);
    try {
      const [productData, toppingData] = await Promise.all([
        productService.getAllProductsForCashier(),
        ToppingService.getAll(),
      ]);

      console.log("========== DEBUG PRODUCT ===========");
      console.table(productData);

      console.log("========== DEBUG TOPPING ===========");
      console.table(toppingData);

      setProducts(productData);
      setToppings(toppingData);
    } catch (error) {
      toast.error("Không thể tải dữ liệu.");
    } finally {
      setLoadingProducts(false);
    }
  };
  fetchData();
}, []);


  // Filter products
  const filteredProducts = products.filter((p: any) => {
    const rawCategory =
      p.category ??
      p.categoryId ??
      p.CategoryId ??
      p.CategoryID ??
      p.CategorySlug;

    const matchCategory =
      selectedCategory === "all" ||
      String(rawCategory) === String(selectedCategory);

    const matchSearch =
      p.name?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });


  // ===========================
  // CART HELPERS
  // ===========================
  const openCustomizeDialog = (product: Product) => {
    setSelectedProduct(product);
    setSelectedSize("M");
    setSelectedToppings([]);
    setSelectedIce("100");
    setCustomizeDialogOpen(true);
  };

  const calculateItemPrice = (product: Product, size: string, toppingIds: string[]) => {
    let price = product.price;

    // Size
    const sizeOption = sizes.find((s) => s.id === size);
    if (sizeOption) price += sizeOption.diff;

    // Topping (KHÔNG dùng product.hasToppings nữa)
    toppingIds.forEach((id) => {
      const topping = toppings.find((t) => t.Id.toString() === id);
      if (topping) price += topping.Price;
    });

    return price;
  };

  const addToCart = () => {
    if (!selectedProduct) return;

    const totalPrice = calculateItemPrice(selectedProduct, selectedSize, selectedToppings);

    setCart(prev => [
      ...prev,
      {
        product: selectedProduct,
        quantity: 1,
        size: selectedProduct.hasSize ? selectedSize : undefined,
        selectedToppings,
        ice: selectedIce,
        totalPrice,
      }
    ]);

    toast.success(`Đã thêm ${selectedProduct.name}`);
    setCustomizeDialogOpen(false);
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart(prev =>
      prev
        .map((item, i) =>
          i === index
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  // ===========================
  // HANDLE CHECKOUT
  // ===========================
  const handleCheckout = async () => {

    if (cart.length === 0) {
      toast.error("Giỏ hàng trống");
      return;
    }
    if (moneyReceived === null || moneyReceived < totalAmount) {
      toast.error("Tiền khách đưa không đủ");
      return;
    }

    const itemsPayload = cart.map((item) => ({
      productId: Number(item.product.id),
      quantity: item.quantity,
      price: item.totalPrice,  // ✔ đã tính size + topping
      size: item.size || null,
      sugar: null, // Cashier không chọn đường
      ice: item.ice || null,
      topping: item.selectedToppings.join(","),  // ✔ gửi ID topping
      // ✔ topping là string, không phải array
    }));

    const orderPayload = {
      items: itemsPayload,
      subtotal: totalAmount,
      total: totalAmount,
      shippingFee: 0,
      serviceFee: 0,
      discountAmount: 0,

      storeId: user.storeId,
      cashierId: user.id,

      orderType: "DirectSale",
      fulfillmentMethod: "AtStore",
      pickupMethod: "AtStore",

      paymentMethod: "Cash",
      isOnlinePaid: false,

      moneyReceived,
      changeAmount,

      shippingAddress: null,
      lat: null,
      lng: null
    }

    try {
      const res = await createOrderApi(orderPayload);
      const finalOrder = {
        id: res.data.orderId,
        orderNumber: res.data.orderId,
        items: itemsPayload,
        total: totalAmount,
        cashier: "Thu ngân",
        time: new Date(),
        moneyReceived,
        changeAmount
      };

      setOrderToPay(finalOrder);
      setPaymentDialogOpen(true);
      setCart([]);

    } catch (err) {
      toast.error("Lỗi tạo đơn hàng");
    }
  };

  return (
    <div className="h-full flex bg-background">

      {/* LEFT */}
      <div className="w-2/3 flex flex-col overflow-hidden">
        <div className="p-6 border-b bg-card">
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

        <div className="px-6 py-4 border-b bg-card/50">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="w-full justify-start">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <TabsTrigger key={cat.id} value={cat.id} className="gap-2">
                    <Icon className="h-4 w-4" />
                    <span>{cat.name}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingProducts ? (
            <div className="text-center text-muted-foreground py-10">Đang tải...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">Không có sản phẩm</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className="cursor-pointer hover:shadow-lg hover:scale-105 transition"
                  onClick={() => openCustomizeDialog(product)}
                >
                  <CardContent className="p-4">
                    <div className="mb-3 flex justify-center h-24">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full object-cover rounded-lg"
                      />
                    </div>
                    <h3 className="font-semibold text-sm line-clamp-2">{product.name}</h3>
                    <p className="text-primary font-bold">{product.price.toLocaleString("vi-VN")}đ</p>
                  </CardContent>
                  <CardFooter className="p-2">
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


      {/* RIGHT */}
      <div className="w-1/3 border-l bg-card flex flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold">Giỏ hàng</h2>
            <Badge variant="secondary" className="ml-auto">{cart.length}</Badge>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">

          {cart.length === 0 ? (
            <div className="text-center text-muted-foreground py-12">
              <ShoppingCart className="h-12 w-12 mx-auto opacity-50 mb-2" />
              Giỏ hàng trống
            </div>
          ) : (
            cart.map((item, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-start gap-3">

                  <div className="h-12 w-12 shrink-0">
                    <img src={item.product.image} className="h-full w-full object-cover rounded-lg" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-sm">{item.product.name}</h4>

                    <div className="text-xs text-muted-foreground mb-2">
                      {item.size && (
                        <Badge variant="outline" className="text-xs">{item.size}</Badge>
                      )}
                    </div>

                    <p className="font-bold text-sm text-primary">
                      {item.totalPrice.toLocaleString("vi-VN")}đ
                    </p>

                    <div className="flex items-center gap-2 mt-2">
                      <Button size="icon" variant="outline" onClick={() => updateQuantity(index, -1)}>
                        <Minus className="h-3 w-3" />
                      </Button>

                      <span className="w-6 text-center">{item.quantity}</span>

                      <Button size="icon" variant="outline" onClick={() => updateQuantity(index, 1)}>
                        <Plus className="h-3 w-3" />
                      </Button>

                      <Button size="icon" variant="ghost" className="ml-auto text-destructive"
                        onClick={() => removeFromCart(index)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                  </div>

                </div>
              </Card>
            ))
          )}

          {cart.length > 0 && (
            <div className="mt-4 p-2 border-t space-y-3">

              <div className="flex justify-between text-sm">
                <span>Tổng cộng</span>
                <span className="font-bold text-primary">{totalAmount.toLocaleString("vi-VN")}đ</span>
              </div>

              <div className="space-y-2">
                <Label>Tiền khách đưa</Label>
                <Input
                  type="number"
                  value={moneyReceived ?? ""}
                  onChange={(e) => setMoneyReceived(Number(e.target.value))}
                />

                <div className="flex justify-between text-sm">
                  <span>Tiền thối lại</span>
                  <span className="font-bold text-primary">{changeAmount.toLocaleString("vi-VN")}đ</span>
                </div>
              </div>

              <Button className="w-full" size="lg" onClick={handleCheckout}>
                Thanh toán
              </Button>

            </div>
          )}

        </div>
      </div>


      {/* Customize Dialog */}
      <Dialog open={customizeDialogOpen} onOpenChange={setCustomizeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Tùy chỉnh đồ uống</DialogTitle>
          </DialogHeader>

          {selectedProduct && (
            <div className="space-y-4">

              <div className="flex items-center gap-3">
                <img src={selectedProduct.image} className="h-12 w-12 object-cover rounded" />
                <div>
                  <h3 className="font-medium">{selectedProduct.name}</h3>
                  <p className="font-bold text-primary">{selectedProduct.price.toLocaleString("vi-VN")}đ</p>
                </div>
              </div>

              {selectedProduct.hasSize && (
                <div>
                  <Label>Chọn size</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {sizes.map((size) => (
                      <Button
                        key={size.id}
                        variant={selectedSize === size.id ? "default" : "outline"}
                        className="h-12 text-lg font-medium"
                        onClick={() => setSelectedSize(size.id)}
                      >
                        {size.name}
                      </Button>
                    ))}
                  </div>
                </div>

              )}

              {selectedProduct.category !== "food" && (
                <div>
                  <Label>Topping</Label>
                  <div className="space-y-2 mt-2">
                    {toppings.map((t) => (
                      <div key={t.Id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={selectedToppings.includes(t.Id.toString())}
                            onCheckedChange={(checked) => {
                              if (checked) setSelectedToppings([...selectedToppings, t.Id.toString()]);
                              else setSelectedToppings(selectedToppings.filter((x) => x !== t.Id.toString()));
                            }}
                          />
                          <span>{t.Name}</span>
                        </div>
                        <span className="text-primary font-bold">{t.Price.toLocaleString("vi-VN")}đ</span>
                      </div>
                    ))
                    }
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={addToCart}>Thêm vào giỏ</Button>
            </div>
          )}

        </DialogContent>
      </Dialog>


      {/* PaymentDialog */}
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
