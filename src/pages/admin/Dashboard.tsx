import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    ordersToday: 0,
    revenueToday: 0,
    revenueTotal: 0,
  });
  const [revenueData, setRevenueData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token"); // JWT
        const res = await fetch("http://localhost:3000/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (json.ok) {
          setStats(json.stats);
          setRevenueData(json.chartData || []);
          // Nếu BE chưa trả danh sách đơn hàng gần đây, có thể thêm route riêng
          setRecentOrders(json.topProducts || []);
        }
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return <p className="text-center text-muted-foreground">Đang tải dữ liệu...</p>;
  }

  const statCards = [
    {
      title: "Tổng doanh thu",
      value: `${stats.revenueTotal.toLocaleString("vi-VN")} ₫`,
      change: "",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Doanh thu hôm nay",
      value: `${stats.revenueToday.toLocaleString("vi-VN")} ₫`,
      change: "",
      icon: TrendingUp,
      color: "text-green-600",
    },
    {
      title: "Đơn hàng hôm nay",
      value: stats.ordersToday.toLocaleString("vi-VN"),
      change: "",
      icon: ShoppingCart,
      color: "text-secondary",
    },
    {
      title: "Người dùng",
      value: stats.totalUsers.toLocaleString("vi-VN"),
      change: "",
      icon: Package,
      color: "text-accent",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Tổng quan hoạt động kinh doanh Phúc Long</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full bg-muted ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">
            Doanh thu 7 tháng gần nhất
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Top sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={recentOrders}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="Name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "0.5rem",
                }}
              />
              <Bar dataKey="Sold" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}
