import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/profile-ui/button";
import { Card } from "@/components/profile-ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/profile-ui/avatar";
import { Badge } from "@/components/profile-ui/badge";
import {
  Camera,
  ChevronRight,
  Settings,
  ShoppingCart,
  MessageCircle,
  User,
  Calendar,
  Mail,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface UserProfile {
  id: string;
  username?: string;
  name?: string;
  email: string;
  phone?: string;
  fullName?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: string;
  avatar?: string;
  memberSince?: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(false);

  // =====================================================
  // 🔹 Lấy thông tin người dùng
  // =====================================================
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      const storedUser = localStorage.getItem("user");

      // ⚠️ Nếu chưa đăng nhập
      if (!token && !storedUser) {
        toast.error("Vui lòng đăng nhập để xem hồ sơ!");
        navigate("/auth/login");
        return;
      }

      try {
        // 🟢 Gọi API /auth/profile (qua interceptor)
        const res = await api.get("/auth/profile");
        if (res.data?.success && res.data?.data) {
          const raw = res.data.data;
          const normalized = {
            id: raw.Id ?? raw.id,
            name: raw.Name ?? raw.name,
            email: raw.Email ?? raw.email,
            phone: raw.Phone ?? raw.phone,
            role: raw.Role ?? raw.role,
            loyaltyPoints: raw.LoyaltyPoints ?? raw.loyaltyPoints ?? 0,
            memberSince: raw.CreatedAt ?? raw.createdAt,
            googleLinked: raw.GoogleLinked ?? raw.googleLinked ?? false,
            isVerified: raw.IsVerified ?? raw.isVerified ?? false,
            avatar: raw.Avatar ?? raw.avatar,
          };
          setProfile(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        } else {
          throw new Error("Phản hồi không hợp lệ từ server");
        }
      } catch (error: any) {
        console.warn("⚠️ Không thể gọi API /auth/profile, fallback localStorage:", error);

        // ✅ Dùng dữ liệu đã lưu
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setProfile(parsed);
            console.log("📦 Fallback user:", parsed);
          } catch (e) {
            localStorage.removeItem("user");
          }
        } else {
          // ❌ Không có dữ liệu dự phòng → yêu cầu login
          toast.error("Phiên đăng nhập không hợp lệ, vui lòng đăng nhập lại!");
          navigate("/auth/login");
        }
      }
    };

    fetchProfile();
  }, [navigate]);

  // =====================================================
  // 🔹 Kiểm tra hồ sơ đầy đủ
  // =====================================================
  useEffect(() => {
    if (profile) {
      const complete = !!(profile.fullName && profile.gender && profile.dateOfBirth);
      setIsProfileComplete(complete);
    }
  }, [profile]);

  // =====================================================
  // 🔹 Upload avatar
  // =====================================================
  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem("accessToken");
    if (!token) return toast.error("Bạn chưa đăng nhập!");

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await api.post("/upload/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (res.data.url) {
        const updated = { ...profile!, avatar: res.data.url };
        setProfile(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        toast.success("Ảnh đại diện đã được cập nhật!");
      }
    } catch (err) {
      toast.error("Không thể tải ảnh đại diện!");
      console.error(err);
    }
  };

  // =====================================================
  // 🔹 Logout
  // =====================================================
  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    toast.success("Đăng xuất thành công!");
    navigate("/auth/login");
  };

  // =====================================================
  // 🔹 UI
  // =====================================================
  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Đang tải thông tin người dùng...
      </div>
    );
  }

  const orderStats = [
    { label: "Chờ xác nhận", count: 2, status: "pending" },
    { label: "Chờ lấy hàng", count: 1, status: "confirmed" },
    { label: "Chờ giao hàng", count: 0, status: "delivering" },
    { label: "Đánh giá", count: 3, status: "completed" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary/95 to-background pb-20">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2">
          <img
            src="/images/logo_pl.png"
            alt="Phúc Long Coffee & Tea"
            className="w-10 h-10 object-contain bg-white rounded-full p-1 shadow-md"
          />
          <span className="font-semibold text-lg text-white tracking-tight">Phúc Long</span>
        </div>
        <div className="flex items-center gap-4">
          <ShoppingCart className="w-6 h-6" />
          <MessageCircle className="w-6 h-6" />
        </div>
      </header>

      <div className="px-4 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <Avatar className="w-24 h-24 border-4 border-white shadow-xl">
              <AvatarImage src={profile.avatar} alt={profile.name || profile.username} />
              <AvatarFallback className="bg-accent text-white text-2xl font-bold">
                {profile.name?.[0] ?? "U"}
              </AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" id="avatar-upload" className="hidden" onChange={handleAvatarUpload} />
            <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg cursor-pointer">
              <Camera className="w-4 h-4 text-primary" />
            </label>
          </div>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">
              {profile.fullName || profile.name || profile.username}
            </h1>
            <Badge className="bg-white/20 text-white border-white/40 hover:bg-white/30">
              Thành viên
            </Badge>
            <p className="text-white/80 text-sm">{profile.email}</p>
            {profile.phone && <p className="text-white/80 text-sm">📞 {profile.phone}</p>}
          </div>
        </div>
      </div>

      <div className="bg-background rounded-t-3xl -mt-4 pt-6">
        <div className="px-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Đơn mua</h2>
            <button
              onClick={() => navigate("/profile/orders")}
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 transition-colors font-medium"
            >
              Xem lịch sử mua hàng
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {orderStats.map((stat) => (
              <button
                key={stat.status}
                onClick={() => navigate(`/profile/orders/${stat.status}`)}
                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-accent transition-colors group"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                    {stat.label === "Chờ xác nhận" && "📋"}
                    {stat.label === "Chờ lấy hàng" && "📦"}
                    {stat.label === "Chờ giao hàng" && "🚚"}
                    {stat.label === "Đánh giá" && "⭐"}
                  </div>
                  {stat.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full text-xs flex items-center justify-center font-semibold">
                      {stat.count}
                    </span>
                  )}
                </div>
                <span className="text-xs text-center text-foreground font-medium leading-tight">
                  {stat.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 space-y-2">
          <MenuItem icon={<User />} label="Thông tin cá nhân" onClick={() => navigate("/profile/edit")} />
          <MenuItem icon={<Calendar />} label="Voucher của tôi" onClick={() => navigate("/profile/voucher")} />
          <MenuItem icon={<Star />} label="Đánh giá sản phẩm" onClick={() => navigate("/profile/review")} />
          <MenuItem icon={<Settings />} label="Cài đặt" onClick={() => navigate("/profile/settings")} />
        </div>

        <div className="px-4 mt-8 mb-8">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground"
          >
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
};

const MenuItem = ({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-accent transition-colors group"
  >
    <div className="flex items-center gap-3">
      <div className="text-muted-foreground group-hover:text-primary transition-colors">{icon}</div>
      <span className="font-medium text-foreground">{label}</span>
    </div>
    <ChevronRight className="w-5 h-5 text-muted-foreground" />
  </button>
);

export default Profile;
