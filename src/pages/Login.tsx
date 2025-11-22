import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await login(email, password);

      if (!res.ok) {
        setError(res.message || "Đăng nhập thất bại");
        return;
      }

      window.location.href = "/"; // Điều hướng vào Barista Dashboard
    } catch (err) {
      setError("Sai tài khoản hoặc mật khẩu");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-background">
      <form
        className="bg-white dark:bg-card shadow-lg p-8 rounded-xl w-full max-w-md"
        onSubmit={handleLogin}
      >
        <h1 className="text-xl font-semibold mb-4 text-center">Barista Login</h1>

        <div className="space-y-4">
          <div>
            <label>Email</label>
            <Input
              placeholder="barista@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label>Password</label>
            <Input
              type="password"
              placeholder="******"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button className="w-full" type="submit">
            Login
          </Button>
        </div>
      </form>
    </div>
  );
}
