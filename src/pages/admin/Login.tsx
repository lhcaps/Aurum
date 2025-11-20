import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Coffee } from "lucide-react";
import { toast } from "sonner";
import { apiCall } from "@/lib/api"; // ← dùng helper có sẵn trong Admin-main/src/lib/api.ts

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Gọi API thật từ backend
      const res = await apiCall("/admin/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {},
      });

      if (res?.token) {
        localStorage.setItem("admin_token", res.token);
        toast.success("Đăng nhập thành công!");
        navigate("/admin");
      } else {
        toast.error("Sai thông tin đăng nhập!");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Không thể đăng nhập. Kiểm tra server hoặc thông tin đăng nhập!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/5 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Coffee className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Aurum Admin</h1>
          <p className="text-muted-foreground">Đăng nhập để quản lý hệ thống</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@phuclong.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mật khẩu</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary-glow text-primary-foreground"
            disabled={loading}
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Tài khoản mẫu: admin@phuclong.vn / 1234567890
          </p>
        </form>
      </Card>
    </div>
  );
}
