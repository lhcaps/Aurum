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

// IMPORT API + HOOK
import { useVouchers } from "@/hooks/useVouchers";
import { voucherAdminApi } from "@/services/voucher.admin.api";

/*
  CHUẨN HÓA THEO DATABASE:
  ----------------------------------------
  Id, Code, DiscountPercent, RequiredPoints,
  ExpiryDate, IsUsed, Type, Value, MaxDiscount,
  MinOrder, StartAt, EndAt, IsActive, UsedCount
*/

interface Voucher {
  id: number;
  code: string;
  type: "percent" | "fixed";
  discountPercent: number;
  value: number;
  maxDiscount: number;
  minOrder: number;
  requiredPoints: number;
  usedCount: number;
  expiryDate: string;
  startAt: string;
  endAt: string;
  isActive: boolean;
}

const Vouchers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<Voucher | null>(null);

  // LOAD FROM BE
  const { vouchers, loading, reload } = useVouchers();

  // FORM DATA
  const [formData, setFormData] = useState({
    code: "",
    type: "percent" as "percent" | "fixed",
    discountPercent: 0,
    value: 0,
    maxDiscount: 0,
    minOrder: 0,
    requiredPoints: 0,
    startAt: "",
    endAt: "",
    expiryDate: "",
  });

  // STATS
  const stats = {
    totalVouchers: vouchers.length,
    activeVouchers: vouchers.filter((v) => v.isActive).length,
    totalUsed: vouchers.reduce((s, v) => s + v.usedCount, 0),
    totalRevenue: vouchers.reduce((s, v) => s + v.usedCount * (v.value || v.maxDiscount), 0),
  };

  // FILTER
  const filtered = vouchers.filter((v) =>
    v.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ===============================
  // TOGGLE ACTIVE
  // ===============================
  const handleToggleActive = async (id: number, isActive: boolean) => {
    try {
      await voucherAdminApi.toggle(id, isActive);
      toast.success("Đã cập nhật trạng thái");
      reload();
    } catch {
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  // ===============================
  // DELETE
  // ===============================
  const handleDelete = async (id: number) => {
    try {
      await voucherAdminApi.delete(id);
      toast.success("Xóa voucher thành công");
      reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể xóa voucher");
    }
  };

  // ===============================
  // EDIT
  // ===============================
  const openEditDialog = (v: Voucher) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      type: v.type,
      discountPercent: v.discountPercent,
      value: v.value,
      maxDiscount: v.maxDiscount,
      minOrder: v.minOrder,
      requiredPoints: v.requiredPoints,
      startAt: v.startAt,
      endAt: v.endAt,
      expiryDate: v.expiryDate,
    });
    setIsDialogOpen(true);
  };

  // ===============================
  // SUBMIT FORM (CREATE / UPDATE)
  // ===============================
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // UPDATE
      if (editingVoucher) {
        await voucherAdminApi.update(editingVoucher.id, formData);
        toast.success("Cập nhật voucher thành công");
      }
      // CREATE
      else {
        await voucherAdminApi.create(formData);
        toast.success("Thêm voucher mới thành công");
      }

      setIsDialogOpen(false);
      setEditingVoucher(null);
      reload();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Không thể lưu voucher");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Voucher</h1>
          <p className="text-muted-foreground">Quản lý phiếu giảm giá & khuyến mại</p>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(v) => { setIsDialogOpen(v); if (!v) setEditingVoucher(null); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> Thêm voucher mới
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingVoucher ? "Chỉnh sửa voucher" : "Thêm voucher mới"}</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* CODE + TYPE */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mã voucher *</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                    required
                  />
                </div>

                <div>
                  <Label>Loại giảm *</Label>
                  <select
                    className="w-full h-10 border rounded-md px-3"
                    value={formData.type}
                    onChange={(e) => setFormData((f) => ({ ...f, type: e.target.value as any }))}
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
              </div>

              {/* DISCOUNT */}
              <div className="grid grid-cols-2 gap-4">
                {formData.type === "percent" ? (
                  <div>
                    <Label>Giảm (%) *</Label>
                    <Input
                      type="number"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData((f) => ({ ...f, discountPercent: Number(e.target.value) }))}
                      min={0}
                      max={100}
                    />
                  </div>
                ) : (
                  <div>
                    <Label>Giảm (VNĐ) *</Label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, value: Number(e.target.value) }))
                      }
                    />
                  </div>
                )}

                {formData.type === "percent" && (
                  <div>
                    <Label>Tối đa (VNĐ)</Label>
                    <Input
                      type="number"
                      value={formData.maxDiscount}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, maxDiscount: Number(e.target.value) }))
                      }
                    />
                  </div>
                )}
              </div>

              {/* MIN ORDER + REQUIRED POINTS */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Đơn tối thiểu</Label>
                  <Input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData((f) => ({ ...f, minOrder: Number(e.target.value) }))}
                  />
                </div>

                <div>
                  <Label>Điểm yêu cầu</Label>
                  <Input
                    type="number"
                    value={formData.requiredPoints}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, requiredPoints: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              {/* DATE */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Ngày bắt đầu *</Label>
                  <Input
                    type="date"
                    value={formData.startAt}
                    onChange={(e) => setFormData((f) => ({ ...f, startAt: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Ngày kết thúc *</Label>
                  <Input
                    type="date"
                    value={formData.endAt}
                    onChange={(e) => setFormData((f) => ({ ...f, endAt: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Hủy</Button>
                <Button type="submit">{editingVoucher ? "Cập nhật" : "Thêm voucher"}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Tổng voucher</CardTitle>
            <Ticket className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalVouchers}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Đang hoạt động</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-primary">{stats.activeVouchers}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Lượt dùng</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalUsed}</div></CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">Doanh thu quy ước</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalRevenue.toLocaleString("vi-VN")}đ
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm mã voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Mã</th>
                  <th className="text-left p-4">Giảm giá</th>
                  <th className="text-left p-4">Tối thiểu</th>
                  <th className="text-left p-4">Thời gian</th>
                  <th className="text-left p-4">Trạng thái</th>
                  <th className="text-right p-4">Hành động</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((v) => (
                  <tr key={v.id} className="border-b hover:bg-muted/50">
                    <td className="p-4 font-mono font-semibold text-primary">{v.code}</td>

                    <td className="p-4">
                   <Badge variant="secondary">
  {v.type.toLowerCase() === "percent"
    ? `${v.value}%`
    : `${v.value.toLocaleString("vi-VN")}đ`}
</Badge>

{v.type.toLowerCase() === "percent" && v.maxDiscount > 0 && (
  <p className="text-xs text-muted-foreground mt-1">
    Tối đa: {v.maxDiscount.toLocaleString("vi-VN")}đ
  </p>
)}

                    </td>

                    <td className="p-4">{v.minOrder.toLocaleString("vi-VN")}đ</td>

                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {new Date(v.startAt).toLocaleDateString("vi-VN")} –{" "}
                        {new Date(v.endAt).toLocaleDateString("vi-VN")}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={v.isActive}
                          onCheckedChange={(value) => handleToggleActive(v.id, value)}
                        />
                        {v.isActive ? "Hoạt động" : "Tạm dừng"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(v)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(v.id)}>
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
