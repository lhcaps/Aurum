import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OrderProvider } from "./contexts/OrderContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { CashierLayout } from "./layouts/CashierLayout";

import DirectSales from "./pages/DirectSales";
import NewOrders from "./pages/NewOrders";
import Processing from "./pages/Processing";
import Payment from "./pages/Payment";
import History from "./pages/History";
import Menu from "./pages/Menu";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <OrderProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          <AuthProvider>
            <Routes>

              {/* PUBLIC ROUTE */}
              <Route path="/login" element={<Login />} />

              {/* PROTECTED ROUTES */}
              <Route element={<ProtectedRoute />}>
                <Route element={<CashierLayout />}>

                  {/* CHILD PAGES */}
                  <Route index element={<NewOrders />} />
                  <Route path="/" element={<NewOrders />} />
                  <Route path="direct-sales" element={<DirectSales />} />
                  <Route path="processing" element={<Processing />} />
                  <Route path="payment" element={<Payment />} />
                  <Route path="history" element={<History />} />
                  <Route path="menu" element={<Menu />} />

                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>

      </TooltipProvider>
    </OrderProvider>
  </QueryClientProvider>
);

export default App;
//hahaha