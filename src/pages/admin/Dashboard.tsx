import { Card } from "@/components/ui/card";
import { TrendingUp, ShoppingCart, Package, DollarSign } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { name: "T1", revenue: 45000000 },
  { name: "T2", revenue: 52000000 },
  { name: "T3", revenue: 48000000 },
  { name: "T4", revenue: 61000000 },
  { name: "T5", revenue: 55000000 },
  { name: "T6", revenue: 67000000 },
  { name: "T7", revenue: 73000000 },
];

const orderData = [
  { name: "T2", orders: 125 },
  { name: "T3", orders: 142 },
  { name: "T4", orders: 168 },
  { name: "T5", orders: 155 },
  { name: "T6", orders: 189 },
  { name: "T7", orders: 205 },
  { name: "CN", orders: 178 },
];

export default function Dashboard() {
  const stats = [
    {
      title: "Doanh thu tháng",
      value: "73,000,000 ₫",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-primary",
    },
    {
      title: "Đơn hàng",
      value: "1,234",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-secondary",
    },
    {
      title: "Sản phẩm",
      value: "156",
      change: "+5",
      icon: Package,
      color: "text-accent",
    },
    {
      title: "Tăng trưởng",
      value: "+23%",
      change: "so với tháng trước",
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
                <p className="text-xs text-primary mt-1">{stat.change}</p>
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

        {/* Orders Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-foreground">Đơn hàng trong tuần</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={orderData}>
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
              <Bar dataKey="orders" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 text-foreground">Đơn hàng gần đây</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Mã đơn</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Khách hàng</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Sản phẩm</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Giá trị</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: "#PL1234", customer: "Nguyễn Văn A", product: "Trà sữa matcha", value: "75,000 ₫", status: "Hoàn thành" },
                { id: "#PL1235", customer: "Trần Thị B", product: "Cà phê đen đá", value: "45,000 ₫", status: "Đang xử lý" },
                { id: "#PL1236", customer: "Lê Văn C", product: "Trà đào cam sả", value: "65,000 ₫", status: "Hoàn thành" },
                { id: "#PL1237", customer: "Phạm Thị D", product: "Cà phê sữa", value: "55,000 ₫", status: "Đang giao" },
              ].map((order) => (
                <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="py-3 px-4 font-medium text-foreground">{order.id}</td>
                  <td className="py-3 px-4 text-foreground">{order.customer}</td>
                  <td className="py-3 px-4 text-muted-foreground">{order.product}</td>
                  <td className="py-3 px-4 font-medium text-foreground">{order.value}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "Hoàn thành"
                          ? "bg-primary/10 text-primary"
                          : order.status === "Đang xử lý"
                          ? "bg-accent/10 text-accent"
                          : "bg-secondary/10 text-secondary"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
