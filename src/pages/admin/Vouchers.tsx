import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Ticket, Plus, Search, Edit, Trash2, TrendingUp, Users, DollarSign, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Voucher {
  id: number;
  code: string;
  name: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  minOrderValue: number;
  maxDiscount?: number;
  usageLimit: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
}

const Vouchers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // Demo data
  const [vouchers, setVouchers] = useState<Voucher[]>([
    {
      id: 1,
      code: "WELCOME2024",
      name: "Voucher chào mừng khách hàng mới",
      discountType: "percentage",
      discountValue: 15,
      minOrderValue: 100000,
      maxDiscount: 50000,
      usageLimit: 1000,
      usedCount: 245,
      validFrom: "2024-01-01",
      validTo: "2024-12-31",
      isActive: true,
    },
    {
      id: 2,
      code: "TETNGUYENDAN",
      name: "Voucher Tết Nguyên Đán",
      discountType: "fixed",
      discountValue: 50000,
      minOrderValue: 200000,
      usageLimit: 500,
      usedCount: 380,
      validFrom: "2024-01-15",
      validTo: "2024-02-15",
      isActive: true,
    },
    {
      id: 3,
      code: "FLASHSALE",
      name: "Flash Sale cuối tuần",
      discountType: "percentage",
      discountValue: 20,
      minOrderValue: 150000,
      maxDiscount: 100000,
      usageLimit: 200,
      usedCount: 145,
      validFrom: "2024-11-01",
      validTo: "2024-11-30",
      isActive: true,
    },
    {
      id: 4,
      code: "FREESHIP",
      name: "Miễn phí giao hàng",
      discountType: "fixed",
      discountValue: 30000,
      minOrderValue: 100000,
      usageLimit: 300,
      usedCount: 289,
      validFrom: "2024-01-01",
      validTo: "2024-06-30",
      isActive: false,
    },
  ]);

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    discountType: "percentage" as "percentage" | "fixed",
    discountValue: 0,
    minOrderValue: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: "",
    validTo: "",
  });

  // Stats
  const stats = {
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter((v) => v.isActive).length,
    totalUsed: vouchers.reduce((sum, v) => sum + v.usedCount, 0),
    totalRevenue: vouchers.reduce((sum, v) => sum + v.usedCount * 50000, 0),
  };

  const filteredVouchers = vouchers.filter(
    (voucher) =>
      voucher.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      voucher.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleActive = (id: number) => {
    setVouchers(
      vouchers.map((v) => (v.id === id ? { ...v, isActive: !v.isActive } : v))
    );
    toast.success("Đã cập nhật trạng thái voucher");
  };

  const handleDelete = (id: number) => {
    setVouchers(vouchers.filter((v) => v.id !== id));
    toast.success("Đã xóa voucher thành công");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingVoucher) {
      setVouchers(
        vouchers.map((v) =>
          v.id === editingVoucher.id
            ? { ...v, ...formData, usedCount: v.usedCount }
            : v
        )
      );
      toast.success("Đã cập nhật voucher thành công");
    } else {
      const newVoucher: Voucher = {
        id: Math.max(...vouchers.map((v) => v.id)) + 1,
        ...formData,
        usedCount: 0,
        isActive: true,
      };
      setVouchers([...vouchers, newVoucher]);
      toast.success("Đã thêm voucher mới thành công");
    }

    setIsAddDialogOpen(false);
    setEditingVoucher(null);
    setFormData({
      code: "",
      name: "",
      discountType: "percentage",
      discountValue: 0,
      minOrderValue: 0,
      maxDiscount: 0,
      usageLimit: 0,
      validFrom: "",
      validTo: "",
    });
  };

  const openEditDialog = (voucher: Voucher) => {
    setEditingVoucher(voucher);
    setFormData({
      code: voucher.code,
      name: voucher.name,
      discountType: voucher.discountType,
      discountValue: voucher.discountValue,
      minOrderValue: voucher.minOrderValue,
      maxDiscount: voucher.maxDiscount || 0,
      usageLimit: voucher.usageLimit,
      validFrom: voucher.validFrom,
      validTo: voucher.validTo,
    });
    setIsAddDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Voucher</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý phiếu giảm giá và khuyến mại
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            setEditingVoucher(null);
            setFormData({
              code: "",
              name: "",
              discountType: "percentage",
              discountValue: 0,
              minOrderValue: 0,
              maxDiscount: 0,
              usageLimit: 0,
              validFrom: "",
              validTo: "",
            });
          }
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm voucher mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingVoucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Mã voucher *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="VD: WELCOME2024"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Tên voucher *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Tên mô tả voucher"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountType">Loại giảm giá *</Label>
                  <select
                    id="discountType"
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                    value={formData.discountType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountType: e.target.value as "percentage" | "fixed",
                      })
                    }
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountValue">
                    Giá trị giảm {formData.discountType === "percentage" ? "(%)" : "(VNĐ)"} *
                  </Label>
                  <Input
                    id="discountValue"
                    type="number"
                    value={formData.discountValue}
                    onChange={(e) =>
                      setFormData({ ...formData, discountValue: Number(e.target.value) })
                    }
                    min="0"
                    max={formData.discountType === "percentage" ? "100" : undefined}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minOrderValue">Giá trị đơn hàng tối thiểu (VNĐ)</Label>
                  <Input
                    id="minOrderValue"
                    type="number"
                    value={formData.minOrderValue}
                    onChange={(e) =>
                      setFormData({ ...formData, minOrderValue: Number(e.target.value) })
                    }
                    min="0"
                  />
                </div>
                {formData.discountType === "percentage" && (
                  <div className="space-y-2">
                    <Label htmlFor="maxDiscount">Giảm tối đa (VNĐ)</Label>
                    <Input
                      id="maxDiscount"
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData({ ...formData, maxDiscount: Number(e.target.value) })
                      }
                      min="0"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="usageLimit">Giới hạn số lượt sử dụng *</Label>
                <Input
                  id="usageLimit"
                  type="number"
                  value={formData.usageLimit}
                  onChange={(e) =>
                    setFormData({ ...formData, usageLimit: Number(e.target.value) })
                  }
                  min="1"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Ngày bắt đầu *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) =>
                      setFormData({ ...formData, validFrom: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="validTo">Ngày kết thúc *</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) =>
                      setFormData({ ...formData, validTo: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsAddDialogOpen(false);
                    setEditingVoucher(null);
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingVoucher ? "Cập nhật" : "Thêm voucher"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng voucher
            </CardTitle>
            <Ticket className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVouchers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang hoạt động
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {stats.activeVouchers}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng lượt sử dụng
            </CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Doanh thu từ voucher
            </CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm kiếm theo mã hoặc tên voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vouchers Table */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Mã voucher
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Tên voucher
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Giảm giá
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Sử dụng
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Thời hạn
                  </th>
                  <th className="text-left p-4 font-medium text-muted-foreground">
                    Trạng thái
                  </th>
                  <th className="text-right p-4 font-medium text-muted-foreground">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredVouchers.map((voucher) => (
                  <tr key={voucher.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-primary" />
                        <span className="font-mono font-semibold text-primary">
                          {voucher.code}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="max-w-xs">
                        <p className="font-medium">{voucher.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Tối thiểu: {voucher.minOrderValue.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary">
                        {voucher.discountType === "percentage"
                          ? `${voucher.discountValue}%`
                          : `${voucher.discountValue.toLocaleString("vi-VN")}đ`}
                      </Badge>
                      {voucher.maxDiscount && voucher.discountType === "percentage" && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Tối đa: {voucher.maxDiscount.toLocaleString("vi-VN")}đ
                        </p>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {voucher.usedCount} / {voucher.usageLimit}
                        </span>
                        <div className="w-full bg-muted rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(voucher.usedCount / voucher.usageLimit) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">
                          {new Date(voucher.validFrom).toLocaleDateString("vi-VN")} -{" "}
                          {new Date(voucher.validTo).toLocaleDateString("vi-VN")}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={voucher.isActive}
                          onCheckedChange={() => handleToggleActive(voucher.id)}
                        />
                        <span className="text-sm">
                          {voucher.isActive ? "Hoạt động" : "Tạm dừng"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(voucher)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(voucher.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Vouchers;
