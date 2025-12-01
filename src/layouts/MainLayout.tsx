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

  // Đổi màu nền cho trang /menu/*
  const mainClass = useMemo(() => {
    const isMenuPage = location.pathname.startsWith("/menu");
    return cn(
      "flex-1 min-h-[calc(100vh-3.5rem)] overflow-y-auto px-6 py-6",
      isMenuPage && "bg-muted/30"
    );
  }, [location.pathname]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">

        {/* Sidebar trái */}
        <AppSidebar />

        {/* Nội dung chính */}
        <SidebarInset className="flex flex-col flex-1 min-h-screen w-full max-w-full !m-0 !p-0 !rounded-none !shadow-none">

          {/* Header cố định */}
          <header className="sticky top-0 z-50 flex h-14 items-center justify-between 
                             border-b bg-card px-4 shadow-sm">

            <div className="flex items-center gap-3">
              <SidebarTrigger className="mr-1" />

              <div className="flex items-center gap-2">
                <Coffee className="w-5 h-5 text-primary" />
                <h1 className="text-lg font-semibold text-foreground">
                  Aurum Coffee & Tea
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Avatar / Bell có thể thêm sau */}
            </div>
          </header>

          <Separator />

          {/* Outlet */}
          <main className={mainClass}>
            <Outlet />
          </main>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
