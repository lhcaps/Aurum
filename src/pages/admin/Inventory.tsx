import { useState } from "react";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

type InventoryItem = {
  id: number;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  minStock: number;
  price: number;
  supplier: string;
  lastUpdated: string;
};

const Inventory = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");

  // Demo data - replace with API calls
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Trân châu đen",
      category: "Topping",
      quantity: 50,
      unit: "kg",
      minStock: 20,
      price: 45000,
      supplier: "Nhà cung cấp A",
      lastUpdated: "2024-01-15",
    },
    {
      id: 2,
      name: "Cà phê Arabica",
      category: "Nguyên liệu chính",
      quantity: 100,
      unit: "kg",
      minStock: 30,
      price: 350000,
      supplier: "Nhà cung cấp B",
      lastUpdated: "2024-01-14",
    },
    {
      id: 3,
      name: "Sữa tươi",
      category: "Nguyên liệu chính",
      quantity: 200,
      unit: "lít",
      minStock: 50,
      price: 25000,
      supplier: "Nhà cung cấp C",
      lastUpdated: "2024-01-16",
    },
    {
      id: 4,
      name: "Đường",
      category: "Phụ gia",
      quantity: 80,
      unit: "kg",
      minStock: 25,
      price: 20000,
      supplier: "Nhà cung cấp A",
      lastUpdated: "2024-01-13",
    },
    {
      id: 5,
      name: "Trà xanh",
      category: "Nguyên liệu chính",
      quantity: 40,
      unit: "kg",
      minStock: 15,
      price: 280000,
      supplier: "Nhà cung cấp D",
      lastUpdated: "2024-01-15",
    },
    {
      id: 6,
      name: "Thạch dừa",
      category: "Topping",
      quantity: 30,
      unit: "kg",
      minStock: 15,
      price: 55000,
      supplier: "Nhà cung cấp A",
      lastUpdated: "2024-01-14",
    },
  ]);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    minStock: 0,
    price: 0,
    supplier: "",
  });

  const categories = ["Nguyên liệu chính", "Topping", "Phụ gia", "Bao bì"];
  const units = ["kg", "lít", "gói", "hộp"];

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === "all" || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getLowStockCount = () => {
    return items.filter(item => item.quantity <= item.minStock).length;
  };

  const getTotalValue = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || !newItem.unit || !newItem.supplier) {
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    const item: InventoryItem = {
      id: items.length + 1,
      ...newItem,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    setItems([...items, item]);
    setIsDialogOpen(false);
    setNewItem({
      name: "",
      category: "",
      quantity: 0,
      unit: "",
      minStock: 0,
      price: 0,
      supplier: "",
    });

    toast({
      title: "Thành công",
      description: "Đã thêm nguyên liệu mới",
    });
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
    toast({
      title: "Thành công",
      description: "Đã xóa nguyên liệu",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Kho Nguyên Liệu</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý tồn kho và nguyên liệu sản xuất
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng nguyên liệu</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
            <p className="text-xs text-muted-foreground">Các loại nguyên liệu khác nhau</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo tồn kho</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{getLowStockCount()}</div>
            <p className="text-xs text-muted-foreground">Nguyên liệu dưới mức tồn kho tối thiểu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị kho</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalValue().toLocaleString('vi-VN')}₫</div>
            <p className="text-xs text-muted-foreground">Tổng giá trị tồn kho</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Nguyên liệu</CardTitle>
          <CardDescription>Quản lý và theo dõi tồn kho nguyên liệu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm nguyên liệu, nhà cung cấp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" />
                  Thêm nguyên liệu
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm nguyên liệu mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin nguyên liệu vào kho
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Tên nguyên liệu *</Label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                        placeholder="VD: Trân châu đen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Danh mục *</Label>
                      <Select value={newItem.category} onValueChange={(value) => setNewItem({ ...newItem, category: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn danh mục" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="quantity">Số lượng</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseFloat(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit">Đơn vị *</Label>
                      <Select value={newItem.unit} onValueChange={(value) => setNewItem({ ...newItem, unit: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((unit) => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="minStock">Tồn kho tối thiểu</Label>
                      <Input
                        id="minStock"
                        type="number"
                        value={newItem.minStock}
                        onChange={(e) => setNewItem({ ...newItem, minStock: parseFloat(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Giá (₫ / đơn vị)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseFloat(e.target.value) })}
                        placeholder="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier">Nhà cung cấp *</Label>
                      <Input
                        id="supplier"
                        value={newItem.supplier}
                        onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                        placeholder="Tên nhà cung cấp"
                      />
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddItem}>Thêm nguyên liệu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nguyên liệu</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Đơn giá</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Không tìm thấy nguyên liệu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={item.quantity <= item.minStock ? "text-destructive font-semibold" : ""}>
                            {item.quantity} {item.unit}
                          </span>
                          {item.quantity <= item.minStock && (
                            <Badge variant="destructive" className="text-xs">Thấp</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{item.price.toLocaleString('vi-VN')}₫</TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="text-muted-foreground">{item.lastUpdated}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Inventory;
