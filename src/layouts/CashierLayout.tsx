import { Outlet } from "react-router-dom";
import { CashierHeader } from "@/components/cashier/CashierHeader";
import { CashierSidebar } from "@/components/cashier/CashierSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { OrderQueue } from "@/components/cashier/OrderQueue";

export function CashierLayout() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <CashierHeader onLogout={signOut} />
      <div className="flex-1 flex overflow-hidden">
        <CashierSidebar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
        <OrderQueue />
      </div>
    </div>
  );
}
