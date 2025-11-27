import { useState, useEffect } from "react";
import { Bell, Clock, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CashierHeaderProps {
  onLogout: () => void;
  cashierName: string;
}

export function CashierHeader({ onLogout, cashierName }: CashierHeaderProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-success flex items-center justify-center">
              <span className="text-lg font-bold text-success-foreground">P</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold">Phúc Long</h1>
              <p className="text-sm text-muted-foreground">
                Ca sáng <span className="text-accent">(08:00-12:00)</span>
              </p>
            </div>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="text-sm">
            <span className="text-muted-foreground">Cashier: </span>
            <span className="font-medium">{cashierName}</span>          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent text-xs">
                3
              </Badge>
            </button>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-muted rounded-lg">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-mono text-accent">{formatTime(currentTime)}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
