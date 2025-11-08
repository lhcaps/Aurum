import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-muted/30 to-primary/10">
      <div className="text-center space-y-6 px-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
          <Coffee className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-5xl font-bold text-foreground mb-4">
          Phúc Long Admin Portal
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hệ thống quản lý chuyên nghiệp cho chuỗi cà phê Phúc Long
        </p>
        <Link to="/admin/login">
          <Button size="lg" className="bg-primary hover:bg-primary-glow text-primary-foreground mt-4">
            Đăng nhập Admin
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
