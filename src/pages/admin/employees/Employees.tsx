import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import EmployeeForm from "./EmployeeForm";
import ChangePasswordModal from "./ChangePasswordModal";
import axios from "@/lib/axios";

interface Employee {
  Id: number;
  Name: string;
  Email: string;
  Phone: string;
  Role: string;
  IsActive: boolean;
  CreatedAt: string;
}

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openPwd, setOpenPwd] = useState(false);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/employees");
      setEmployees(res.data);
    } catch (err) {
      toast.error("Không tải được danh sách nhân viên");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const toggleActive = async (emp: Employee) => {
    await axios.patch(`/api/admin/employees/${emp.Id}/status`, {
      isActive: !emp.IsActive,
    });
    toast.success("Cập nhật trạng thái thành công");
    fetchEmployees();
  };

  const roleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-blue-500";
      case "manager":
        return "bg-purple-500";
      case "cashier":
        return "bg-green-500";
      case "barista":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Quản lý nhân viên</h1>
        <Button onClick={() => setOpenAdd(true)}>+ Thêm nhân viên</Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <table className="w-full border rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-3">Tên</th>
              <th className="p-3">Email</th>
              <th className="p-3">SĐT</th>
              <th className="p-3">Role</th>
              <th className="p-3">Active</th>
              <th className="p-3 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.Id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{emp.Name}</td>
                <td className="p-3">{emp.Email}</td>
                <td className="p-3">{emp.Phone}</td>
                <td className="p-3">
                  <Badge className={roleColor(emp.Role)}>{emp.Role}</Badge>
                </td>
                <td className="p-3">
                  <Switch
                    checked={emp.IsActive}
                    onCheckedChange={() => toggleActive(emp)}
                  />
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <Button size="sm" onClick={() => { setSelectedEmp(emp); setOpenEdit(true); }}>
                    Sửa
                  </Button>
                  <Button size="sm" variant="outline"
                    onClick={() => { setSelectedEmp(emp); setOpenPwd(true); }}>
                    Mật khẩu
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async () => {
                      if (!confirm("Xóa nhân viên?")) return;
                      await axios.delete(`/api/admin/employees/${emp.Id}`);
                      toast.success("Đã xóa nhân viên");
                      fetchEmployees();
                    }}
                  >
                    Xóa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm nhân viên</DialogTitle>
          </DialogHeader>
          <EmployeeForm onSuccess={() => { setOpenAdd(false); fetchEmployees(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={openEdit} onOpenChange={setOpenEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sửa nhân viên</DialogTitle>
          </DialogHeader>
          <EmployeeForm data={selectedEmp!} onSuccess={() => { setOpenEdit(false); fetchEmployees(); }} />
        </DialogContent>
      </Dialog>

      <Dialog open={openPwd} onOpenChange={setOpenPwd}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đổi mật khẩu</DialogTitle>
          </DialogHeader>
          <ChangePasswordModal data={selectedEmp!} onSuccess={() => setOpenPwd(false)} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}
