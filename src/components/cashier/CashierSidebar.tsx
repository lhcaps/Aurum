import { NavLink } from "@/components/NavLink";
import { ShoppingCart, CreditCard, Receipt, History, Settings, Store } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const menuItems = [
  { icon: Store, label: "Bán hàng trực tiếp", path: "/direct-sales" },
  { icon: ShoppingCart, label: "Đơn mới", path: "/" },
  { icon: Receipt, label: "Đang pha", path: "/processing" },
  { icon: CreditCard, label: "Chờ thanh toán", path: "/payment" },
  { icon: History, label: "Lịch sử giao dịch", path: "/history" },
];

export function CashierSidebar() {
  return (
    <aside className="w-64 border-r border-border bg-card flex flex-col">
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item, index) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className="flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors hover:bg-muted"
            activeClassName="bg-primary text-primary-foreground hover:bg-primary"
          >
            <div className="flex items-center gap-3">
              <span className="text-accent">{index + 1}.</span>
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
