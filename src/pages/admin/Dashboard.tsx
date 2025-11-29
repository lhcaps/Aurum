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
import { adminDashboardApi } from "@/services/admin.dashboard.api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});
  const [chartData, setChartData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);

  // LOAD DATA ON START
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await adminDashboardApi.getDashboard();

      if (res.ok) {
        setStats(res.stats);
        setChartData(res.chartData);
        setTopProducts(res.topProducts);
      }
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Đang tải dữ liệu...</p>;

  // Stats grid
  const statItems = [
    {
      title: "Tổng người dùng",
      value: stats.totalUsers?.toLocaleString("vi-VN"),
      change: "",
      icon: Package,
      color: "text-primary",
    },
    {
      title: "Đơn hàng hôm nay",
      value: stats.ordersToday?.toLocaleString("vi-VN"),
      change: "",
      icon: ShoppingCart,
      color: "text-secondary",
    },
    {
      title: "Doanh thu hôm nay",
      value: `${stats.revenueToday?.toLocaleString("vi-VN")} ₫`,
      change: "",
      icon: DollarSign,
      color: "text-accent",
    },
    {
      title: "Tổng doanh thu",
      value: `${stats.revenueTotal?.toLocaleString("vi-VN")} ₫`,
      change: "",
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-2">Dashboard</h2>
        <p className="text-muted-foreground">Tổng quan hoạt động kinh doanh Phúc Long</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statItems.map((stat, index) => (
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
          <h3 className="text-lg font-semibold mb-4 text-foreground">Doanh thu 7 tháng gần nhất</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Products */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Top sản phẩm bán chạy</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="Name" stroke="hsl(var(--muted-foreground))" />
              <YAxis stroke="hsl(var(--muted-foreground))" />
              <Tooltip />
              <Bar dataKey="Sold" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Sản phẩm bán chạy</h3>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-3 px-4 text-left">Sản phẩm</th>
              <th className="py-3 px-4 text-left">Số lượng</th>
            </tr>
          </thead>
          <tbody>
            {topProducts.map((p, i) => (
              <tr key={i} className="border-b hover:bg-muted/40">
                <td className="px-4 py-3">{p.Name}</td>
                <td className="px-4 py-3">{p.Sold}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
import { apiCall } from "@/lib/api";