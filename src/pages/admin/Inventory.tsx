import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FolderCog } from "lucide-react"
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";

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
  const { toast: shadToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [items, setItems] = useState<InventoryItem[]>([]);

  const [newItem, setNewItem] = useState({
    name: "",
    category: "",
    quantity: 0,
    unit: "",
    minStock: 0,
    price: 0,
    supplier: "",
  });
  const [newCategory, setNewCategory] = useState("");
  const [isAddCategoryDialogOpen, setIsAddCategoryDialogOpen] = useState(false);
  const [categories, setCategories] = useState([
    "Nguyên liệu chính",
    "Topping",
    "Phụ gia",
    "Bao bì",
  ]); const units = ["kg", "lít", "gói", "hộp"];

  // ========================
  // ✅ FETCH TOPPING từ backend
  // ========================
  const fetchInventories = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return;

      const res = await fetch("http://localhost:3000/api/admin/inventory", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      // Dữ liệu từ BE
      const inventories = (data.data || []).map((i: any) => ({
        id: i.id ?? i.Id,
        name: i.name ?? i.Name,
        category: i.category ?? i.Category,
        quantity: Number(i.quantity ?? i.Quantity ?? 0),
        unit: i.unit ?? i.Unit ?? "",
        minStock: Number(i.minStock ?? i.MinStock ?? 0),
        price: Number(i.price ?? i.Price ?? 0),
        supplier: i.supplier ?? i.Supplier ?? "",
        lastUpdated: i.lastUpdated ?? i.LastUpdated ?? "",
      }));


      setItems(inventories);
    } catch (err) {
      toast.error("Không thể tải danh sách nguyên liệu");
    }
  };

  useEffect(() => {
    fetchInventories();
  }, []);
  // ✅ Lấy danh mục từ backend khi mở trang
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (!token) return;

        const res = await fetch("http://localhost:3000/api/admin/categories", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.ok && Array.isArray(data.data)) {
          setCategories(data.data.map((c: any) => c.Name || c.name));
        }
      } catch (err) {
        toast.error("Không thể tải danh mục từ server");
      }
    };

    fetchCategories();
  }, []);


  // ========================
  const handleAddItem = async () => {
    const { name, category, unit, supplier } = newItem;

    if (!name || !category || !unit || !supplier) {
      shadToast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin",
        variant: "destructive",
      });
      return;
    }

    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Chưa đăng nhập");

    try {
      let endpoint = "http://localhost:3000/api/admin/inventory";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          category,
          quantity: newItem.quantity,
          unit,
          minStock: newItem.minStock,
          price: newItem.price,
          supplier,
        }),
      });

      if (!res.ok) throw new Error("Không thể thêm nguyên liệu");

      toast.success("✅ Đã thêm nguyên liệu vào kho");
    } catch (err) {
      console.error("❌ Lỗi thêm nguyên liệu:", err);
      toast.error("Không thể thêm nguyên liệu");
    }

    // Reset form
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
  };

  // ========================
  // ✅ XÓA topping thật
  // ========================
  const handleDeleteItem = async (id: number) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return toast.error("Chưa đăng nhập");
    if (!window.confirm("Bạn có chắc muốn xóa nguyên liệu này?")) return;

    const res = await fetch(`http://localhost:3000/api/admin/inventory/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (res.ok) {
      toast.success("Đã xóa nguyên liệu");
      fetchInventories();
    } else toast.error("Không thể xóa nguyên liệu");
  };
  // ========================
  // Lọc + thống kê
  // ========================
  const filteredItems = useMemo(() => {
    return (items || []).filter((item) => {
      const name = (item.name || "").toLowerCase();
      const supplier = (item.supplier || "").toLowerCase();
      const matchesSearch =
        name.includes(searchQuery.toLowerCase()) ||
        supplier.includes(searchQuery.toLowerCase());
      const matchesCategory =
        filterCategory === "all" || item.category === filterCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, filterCategory]);


  const getLowStockCount = () =>
    items.filter((item) => item.quantity <= item.minStock).length;

  const getTotalValue = () =>
    items.reduce((sum, item) => sum + item.quantity * item.price, 0);

  // ========================
  // Giao diện
  // ========================
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Kho Nguyên Liệu</h1>
        <p className="text-muted-foreground mt-2">
          Quản lý tồn kho và nguyên liệu sản xuất (Topping kết nối backend thật)
        </p>
      </div>

      {/* Thống kê */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng nguyên liệu</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{items.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cảnh báo hết hàng</CardTitle>
            <Package className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {getLowStockCount()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tổng giá trị kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalValue().toLocaleString("vi-VN")}₫
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bộ lọc + bảng */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Nguyên liệu</CardTitle>
          <CardDescription>Bao gồm cả topping thực tế</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Bộ lọc và nút thêm */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Tìm kiếm */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Lọc danh mục */}
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Tất cả danh mục" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Nút Thêm */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto">
                  <Plus className="mr-2 h-4 w-4" /> Thêm nguyên liệu
                </Button>
              </DialogTrigger>

              {/* Form Thêm */}
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Thêm nguyên liệu mới</DialogTitle>
                  <DialogDescription>
                    Nhập thông tin chi tiết của nguyên liệu
                  </DialogDescription>
                </DialogHeader>

                {/* Form nội dung */}
                <div className="grid gap-4 py-4">
                  {/* Hàng 1 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Tên nguyên liệu *</Label>
                      <Input
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        placeholder="VD: Trân châu đen"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Danh mục *</Label>
                      <div className="flex gap-2">
                        <Select
                          value={newItem.category}
                          onValueChange={(value) =>
                            setNewItem({ ...newItem, category: value })
                          }
                        >
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                  {/* Hàng 2 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Số lượng</Label>
                      <Input
                        type="number"
                        value={newItem.quantity}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            quantity: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Đơn vị *</Label>
                      <Select
                        value={newItem.unit}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, unit: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map((u) => (
                            <SelectItem key={u} value={u}>
                              {u}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Tồn kho tối thiểu</Label>
                      <Input
                        type="number"
                        value={newItem.minStock}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            minStock: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Hàng 3 */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Giá (₫ / đơn vị)</Label>
                      <Input
                        type="number"
                        value={newItem.price}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            price: parseFloat(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Nhà cung cấp *</Label>
                      <Input
                        value={newItem.supplier}
                        onChange={(e) =>
                          setNewItem({ ...newItem, supplier: e.target.value })
                        }
                        placeholder="Tên nhà cung cấp"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleAddItem}>Thêm nguyên liệu</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            {/* Nút quản lý danh mục */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full md:w-auto flex items-center gap-2">
                  <FolderCog className="w-4 h-4 text-primary" />
                  Quản lý danh mục
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Danh mục nguyên liệu</DialogTitle>
                  <DialogDescription>
                    Thêm hoặc xóa các danh mục hiện có trong hệ thống
                  </DialogDescription>
                </DialogHeader>

                {/* Thêm danh mục mới */}
                <div className="flex gap-2 mb-3">
                  <Input
                    placeholder="Nhập danh mục mới..."
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                  />
                  <Button
                    onClick={async () => {
                      if (!newCategory.trim()) return toast.error("Vui lòng nhập tên danh mục");
                      try {
                        const token = localStorage.getItem("admin_token");
                        if (!token) return toast.error("Chưa đăng nhập");

                        const res = await fetch("http://localhost:3000/api/admin/categories", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                          },
                          body: JSON.stringify({ Name: newCategory }),
                        });

                        const data = await res.json();
                        if (!res.ok || !data.ok) throw new Error(data.error || "Không thể thêm danh mục");

                        toast.success("✅ Đã thêm danh mục mới");
                        setCategories([...categories, newCategory]);
                        setNewCategory("");
                      } catch (err: any) {
                        console.error("❌ Lỗi thêm danh mục:", err);
                        toast.error(err.message || "Không thể thêm danh mục");
                      }
                    }}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Thêm
                  </Button>
                </div>

                {/* Danh sách danh mục */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto border p-3 rounded-md">
                  {categories.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Chưa có danh mục nào</p>
                  ) : (
                    categories.map((cat) => (
                      <div
                        key={cat}
                        className="flex justify-between items-center border-b py-1 px-2 rounded hover:bg-muted/50"
                      >
                        <span>{cat}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            if (!window.confirm(`Xóa "${cat}"?`)) return;
                            try {
                              const token = localStorage.getItem("admin_token");
                              const res = await fetch(
                                `http://localhost:3000/api/admin/categories/${encodeURIComponent(cat)}`,
                                { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
                              );
                              const data = await res.json();
                              if (!res.ok || !data.ok) throw new Error(data.error || "Không thể xóa danh mục");
                              setCategories(categories.filter((c) => c !== cat));
                              toast.success(`Đã xóa "${cat}"`);
                            } catch (err: any) {
                              toast.error(err.message || "Lỗi khi xóa danh mục");
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>

          </div>

          {/* Bảng hiển thị danh sách */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tên nguyên liệu</TableHead>
                  <TableHead>Danh mục</TableHead>
                  <TableHead>Tồn kho</TableHead>
                  <TableHead>Đơn giá / đơn vị</TableHead>
                  <TableHead>Nhà cung cấp</TableHead>
                  <TableHead>Cập nhật</TableHead>
                  <TableHead className="text-right">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Không tìm thấy nguyên liệu nào
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item, index) => (
                    <TableRow key={`${item.id || index}-${item.name || "unknown"}`}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.category}</Badge>
                      </TableCell>
                      <TableCell>
                        {item.quantity} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.price.toLocaleString("vi-VN")}₫
                      </TableCell>
                      <TableCell>{item.supplier}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.lastUpdated}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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
