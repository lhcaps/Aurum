import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function Settings() {
  const handleSave = () => {
    toast.success("Đã lưu cài đặt thành công");
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Cài đặt</h2>
        <p className="text-muted-foreground">Quản lý cài đặt hệ thống và tài khoản</p>
      </div>

      {/* Store Settings */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Thông tin cửa hàng</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Tên cửa hàng</Label>
              <Input id="store-name" defaultValue="Phúc Long Coffee & Tea" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input id="phone" defaultValue="1900 6779" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Địa chỉ</Label>
            <Input
              id="address"
              defaultValue="123 Nguyễn Huệ, Quận 1, TP.HCM"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="info@phuclong.com.vn" />
          </div>
        </div>
      </Card>

      {/* Payment Settings */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Thanh toán</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Thanh toán Momo</p>
              <p className="text-sm text-muted-foreground">Cho phép thanh toán qua Momo</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Thanh toán COD</p>
              <p className="text-sm text-muted-foreground">Thanh toán khi nhận hàng</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="momo-id">Momo Partner Code</Label>
            <Input id="momo-id" placeholder="Nhập mã đối tác Momo" />
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card className="p-6">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Thông báo</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Email khi có đơn mới</p>
              <p className="text-sm text-muted-foreground">Nhận email mỗi khi có đơn hàng mới</p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Thông báo sản phẩm hết hàng</p>
              <p className="text-sm text-muted-foreground">Cảnh báo khi sản phẩm sắp hết</p>
            </div>
            <Switch defaultChecked />
          </div>
        </div>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <Button variant="outline">Hủy</Button>
        <Button onClick={handleSave} className="bg-primary hover:bg-primary-glow">
          Lưu thay đổi
        </Button>
      </div>
    </div>
  );
}
