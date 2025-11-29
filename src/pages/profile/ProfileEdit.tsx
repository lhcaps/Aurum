import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/profile-ui/button";
import { Input } from "@/components/profile-ui/input";
import { Label } from "@/components/profile-ui/label";
import { Card } from "@/components/profile-ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/profile-ui/radio-group";
import { ArrowLeft, User, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface ProfileForm {
  fullName: string;
  email: string;
  phone: string;
  gender: "male" | "female" | "other";
  dateOfBirth: string;
}

export default function ProfileEdit() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ProfileForm>({
    fullName: "",
    email: "",
    phone: "",
    gender: "other",
    dateOfBirth: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🔎 Load profile thật từ BE để hiển thị đúng thông tin hiện tại
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get("/auth/profile");
        const u = res.data; // kỳ vọng: { Id, Name, Email, Phone, Role, ... }

        if (!mounted) return;
        setFormData({
          fullName: u?.Name ?? "",
          email: u?.Email ?? "",
          phone: u?.Phone ?? "",
          // BE hiện chỉ update Name/Phone — giữ các field phụ cho UI
          gender: "other",
          dateOfBirth: "",
        });
      } catch (err: any) {
        const msg =
          err?.response?.data?.error ||
          err?.response?.data?.message ||
          "Không tải được hồ sơ người dùng.";
        toast.error(msg);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (field: keyof ProfileForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    // 🧪 Validate nhẹ phía FE
    if (!formData.fullName.trim()) {
      toast.error("Vui lòng nhập họ và tên");
      return;
    }
    if (!/^\d{8,15}$/.test(formData.phone.replace(/\D/g, ""))) {
      toast.error("Số điện thoại không hợp lệ");
      return;
    }

    setIsSubmitting(true);
    try {
      // ⚠️ BE hiện chỉ nhận { Name, Phone } ở AuthService.updateProfile
await api.put("/auth/profile", {
        Name: formData.fullName.trim(),
        Phone: formData.phone.trim(),
      });

      // 🔄 Đồng bộ lại localStorage.user để trang Profile hiển thị tức thời
      const raw = localStorage.getItem("user");
      if (raw) {
        try {
          const u = JSON.parse(raw);
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...u,
              name: formData.fullName.trim(),
              phone: formData.phone.trim(),
            })
          );
        } catch {
          /* ignore parse errors */
        }
      }

      toast.success("Cập nhật thông tin thành công!");
      navigate("/profile", { replace: true });
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Cập nhật thất bại. Vui lòng thử lại.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Đang tải hồ sơ...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-primary text-primary-foreground px-4 py-4 sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/profile")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold">Chỉnh sửa hồ sơ</h1>
        </div>
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="p-4 pb-24">
        <Card className="p-6 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label htmlFor="fullName" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Họ và tên
            </Label>
            <Input
              id="fullName"
              type="text"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Nhập họ và tên"
              required
            />
          </div>

          {/* Email (không cho sửa vì BE chưa hỗ trợ) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-primary" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="Nhập email"
              disabled // 🔒 tránh gửi field BE không nhận
            />
            <p className="text-xs text-muted-foreground">
              (Email hiện chưa thể đổi trong phiên bản này)
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              Số điện thoại
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="Nhập số điện thoại"
              required
            />
          </div>

          {/* Gender (UI-only) */}
          <div className="space-y-3">
            <Label>Giới tính</Label>
            <RadioGroup
              value={formData.gender}
              onValueChange={(value) =>
                handleChange("gender", value as ProfileForm["gender"])
              }
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="male" id="male" />
                <Label htmlFor="male" className="font-normal cursor-pointer">
                  Nam
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="female" id="female" />
                <Label htmlFor="female" className="font-normal cursor-pointer">
                  Nữ
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="other" id="other" />
                <Label htmlFor="other" className="font-normal cursor-pointer">
                  Khác
                </Label>
              </div>
            </RadioGroup>
            <p className="text-xs text-muted-foreground">
              (Trường này hiện chỉ lưu trên giao diện)
            </p>
          </div>

          {/* Date of Birth (UI-only) */}
          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Ngày sinh
            </Label>
            <Input
              id="dateOfBirth"
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              (Trường này hiện chỉ lưu trên giao diện)
            </p>
          </div>
        </Card>

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
          <Button type="submit" className="w-full" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </div>
  );
}
