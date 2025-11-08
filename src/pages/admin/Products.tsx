import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash2, Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// 🧩 Interface
interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  stock: number;
  categoryId?: number;
  categoryName?: string; // ✅ thêm dòng này
}


export default function Products() {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);

  // ✳️ State cho form thêm sản phẩm
  const [newProduct, setNewProduct] = useState({
    name: "",
    categoryName: "", // ✅ thêm dòng này thay vì "category"
    price: "",
    stock: "",
    description: "",
    image: "",
  });


  // ✅ Lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Chưa đăng nhập hoặc token không tồn tại");
        setLoading(false);
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/products", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Phiên đăng nhập hết hạn hoặc không có quyền truy cập");
        setLoading(false);
        return;
      }

      const json = await res.json();
      setProducts(json.data || json.recordset || []);
    } catch (err) {
      console.error("❌ fetchProducts error:", err);
      toast.error("Lỗi khi kết nối server");
    } finally {
      setLoading(false);
    }
  };
  // 🗑️ Xóa sản phẩm
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}" không?`)) return;

    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      const res = await fetch(`http://localhost:3000/api/admin/products/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`✅ Đã xóa sản phẩm "${name}"`);
        fetchProducts(); // 🔄 tải lại danh sách
      } else {
        toast.error(data.error || "Không thể xóa sản phẩm");
      }
    } catch (err) {
      console.error("🔥 Lỗi khi xóa sản phẩm:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };

  // ✅ Lấy danh sách danh mục từ BE
  // ✅ Lấy danh mục từ backend
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Chưa đăng nhập hoặc token không tồn tại");
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/categories", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        toast.error("Không thể tải danh mục");
        return;
      }

      const json = await res.json();
      console.log("📦 Categories:", json);

      // ✅ Backend trả về mảng thuần, không bọc trong { data: ... }
      setCategories(Array.isArray(json) ? json : json.data || []);
    } catch (err) {
      console.error("❌ fetchCategories error:", err);
      toast.error("Lỗi khi tải danh mục");
    }
  };


  // Gọi cả 2 API song song khi mở trang
  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);


  // ✅ Thêm sản phẩm
  const handleAddProduct = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (!token) return toast.error("Chưa đăng nhập");

      if (!newProduct.name || !newProduct.price) {
        toast.error("Vui lòng nhập tên và giá sản phẩm");
        return;
      }

      const res = await fetch("http://localhost:3000/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          Name: newProduct.name,
          Description: newProduct.description,
          Price: parseFloat(newProduct.price),
          ImageUrl: newProduct.image || "",
          Stock: parseInt(newProduct.stock || "0"),
          CategoryName: newProduct.categoryName || "Chưa phân loại",
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Đã thêm sản phẩm thành công");
        setNewProduct({
          name: "",
          categoryName: "", // ✅ đổi từ category → categoryName
          price: "",
          stock: "",
          description: "",
          image: "",
        });
        fetchProducts();
        
      } else {
        toast.error(data.error || "Không thể thêm sản phẩm");
      }
    } catch (err) {
      console.error("❌ Lỗi thêm sản phẩm:", err);
      toast.error("Lỗi khi kết nối server");
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <p className="text-center mt-10 text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-foreground mb-2">Quản lý sản phẩm</h2>
          <p className="text-muted-foreground">Thêm, sửa, xóa sản phẩm trong menu</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary-glow text-primary-foreground">
              <Plus className="w-4 h-4 mr-2" />
              Thêm sản phẩm
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm sản phẩm mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tên sản phẩm</Label>
                  <Input
                    id="name"
                    value={newProduct.name}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, name: e.target.value })
                    }
                    placeholder="Trà sữa matcha..."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục</Label>
                  <select
                    id="category"
                    value={newProduct.categoryName}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, categoryName: e.target.value })
                    }
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
                  >
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>

                </div>

              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Giá (₫)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="75000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Tồn kho</Label>
                  <Input
                    id="stock"
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, stock: e.target.value })
                    }
                    placeholder="100"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, description: e.target.value })
                  }
                  placeholder="Mô tả sản phẩm..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Hình ảnh URL</Label>
                <Input
                  id="image"
                  value={newProduct.image}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, image: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>

              {/* ✅ Nút hoạt động thật */}
              <Button
                onClick={handleAddProduct}
                className="w-full bg-primary hover:bg-primary-glow"
              >
                Thêm sản phẩm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </Card>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video bg-muted relative">
              <img
                src={product.image || "https://via.placeholder.com/80"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-lg text-foreground">{product.name}</h3>
                <p className="text-sm text-muted-foreground">
                  Danh mục: {product.categoryName || "Chưa phân loại"}
                </p>

              </div>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-primary">
                  {product.price.toLocaleString("vi-VN")} ₫
                </span>
                <span className="text-sm text-muted-foreground">Kho: {product.stock}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Eye className="w-4 h-4 mr-1" /> Xem
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Edit className="w-4 h-4 mr-1" /> Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDelete(product.id, product.name)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>

              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
