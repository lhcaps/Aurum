import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="flex min-h-screen items-center justify-center 
      bg-gradient-to-br 
      from-secondary 
      via-muted/50 
      to-primary-light/20
    ">
      <div className="text-center space-y-6 px-4">
        {/* Icon wrapper với màu primary nhạt */}
        <div className="inline-flex items-center justify-center 
          w-20 h-20 rounded-full 
          bg-primary/10 shadow-soft
        ">
          <Coffee className="w-12 h-12 text-primary" />
        </div>

        {/* Tiêu đề */}
        <h1 className="text-5xl font-bold text-foreground">
          Aurum Admin Portal
        </h1>

        {/* Subtext */}
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Hệ thống quản lý chuyên nghiệp cho chuỗi cà phê Phúc Long
        </p>

        {/* Nút đăng nhập */}
        <Link to="/admin/login">
          <Button
            size="lg"
            className="
              bg-primary 
              hover:bg-primary-light 
              text-primary-foreground 
              shadow-medium 
              px-8 py-6
            "
          >
            Đăng nhập Admin
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
