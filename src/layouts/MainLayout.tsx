import { Outlet, useLocation } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Coffee } from "lucide-react";
import { useMemo } from "react";

export default function MainLayout() {
  const location = useLocation();

  // ✅ Dùng useMemo để tránh tạo className mới mỗi render → không reset Sidebar context
  const mainClass = useMemo(() => {
    const isMenuPage = location.pathname.startsWith("/menu");
    return cn(
      "flex-1 overflow-y-auto p-6 transition-all duration-300",
      isMenuPage && "bg-muted/30"
    );
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* 🟣 Sidebar trái */}
        <AppSidebar />

        {/* 🔸 Phần nội dung chính */}
        <SidebarInset className="flex flex-col flex-1 min-h-screen">
          {/* Header cố định */}
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b bg-card px-4 shadow-sm">
            <div className="flex items-center gap-3">
              {/* Nút bật/tắt sidebar */}
              <SidebarTrigger className="mr-1" />

              {/* Logo & tiêu đề */}
              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold text-foreground">
                  Phúc Long Coffee & Tea
                </h1>
              </div>
            </div>

            {/* (Tuỳ chọn) Khu vực bên phải */}
            <div className="flex items-center gap-4">
              {/* Ví dụ: Thông báo, avatar, cài đặt */}
              {/* <Button variant="ghost" size="icon"><Bell /></Button> */}
            </div>
          </header>

          <Separator />

          {/* Nội dung trang con */}
          <main className={mainClass}>
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
