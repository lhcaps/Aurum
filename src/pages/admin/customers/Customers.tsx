import { useEffect, useState } from "react";
import axios from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

import CustomerForm from "./CustomerForm";
import ChangePasswordModal from "./ChangePasswordModal";
import { User } from "lucide-react";

interface Customer {
    Id: number;
    Name: string;
    Email: string;
    Phone: string;
    LoyaltyPoints: number;
    CreatedAt: string;
    IsVerified: boolean;
    GoogleLinked: boolean;
    IsActive: boolean;  // thêm vào
}


export default function Customers() {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [loading, setLoading] = useState(true);

    const [selected, setSelected] = useState<Customer | null>(null);

    const [openEdit, setOpenEdit] = useState(false);
    const [openPwd, setOpenPwd] = useState(false);

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const res = await axios.get("/api/admin/customers");
            setCustomers(res.data);
        } catch (err) {
            toast.error("Không tải được danh sách khách hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const toggleBan = async (customer: Customer) => {
        await axios.patch(`/api/admin/customers/${customer.Id}/status`, {
            isActive: !customer.IsActive,
        });

        // Cập nhật ngay UI
        setCustomers(prev =>
            prev.map(item =>
                item.Id === customer.Id
                    ? { ...item, IsActive: !customer.IsActive }
                    : item
            )
        );

        toast.success(
            !customer.IsActive
                ? "Đã mở khóa tài khoản"
                : "Đã khóa tài khoản người dùng"
        );
    };



    return (
        <Card className="p-6">
            <div className="flex justify-between mb-4">
                <h1 className="text-xl font-semibold flex items-center gap-2">
                    <User className="w-6 h-6" /> Quản lý khách hàng
                </h1>
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
                            <th className="p-3">Điểm</th>
                            <th className="p-3">Google</th>
                            <th className="p-3">Xác thực</th>
                            <th className="p-3 text-center">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((c) => (
                            <tr key={c.Id} className="border-t hover:bg-gray-50">
                                <td className="p-3 font-medium">{c.Name}</td>
                                <td className="p-3">{c.Email}</td>
                                <td className="p-3">{c.Phone}</td>
                                <td className="p-3">{c.LoyaltyPoints}</td>

                                <td className="p-3">
                                    {c.GoogleLinked ? (
                                        <Badge className="bg-blue-500">Google</Badge>
                                    ) : (
                                        <Badge className="bg-gray-500">Normal</Badge>
                                    )}
                                </td>

                                <td className="p-3">
                                    <Switch
                                        checked={c.IsActive}
                                        onCheckedChange={() => toggleBan(c)}

                                    />

                                </td>

                                <td className="p-3 flex justify-center gap-2">
                                    <Button
                                        size="sm"
                                        onClick={() => {
                                            setSelected(c);
                                            setOpenEdit(true);
                                        }}
                                    >
                                        Sửa
                                    </Button>

                                    {!c.GoogleLinked && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelected(c);
                                                setOpenPwd(true);
                                            }}
                                        >
                                            Mật khẩu
                                        </Button>
                                    )}

                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={async () => {
                                            if (!confirm("Xóa khách hàng này?")) return;
                                            await axios.delete(`/api/admin/customers/${c.Id}`);
                                            toast.success("Đã xóa");
                                            fetchCustomers();
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

            {/* MODAL EDIT */}
            <Dialog open={openEdit} onOpenChange={setOpenEdit}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Sửa thông tin khách hàng</DialogTitle>
                    </DialogHeader>
                    <CustomerForm
                        data={selected!}
                        onSuccess={() => {
                            setOpenEdit(false);
                            fetchCustomers();
                        }}
                    />
                </DialogContent>
            </Dialog>

            {/* MODAL CHANGE PASSWORD */}
            <Dialog open={openPwd} onOpenChange={setOpenPwd}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Đổi mật khẩu</DialogTitle>
                    </DialogHeader>
                    <ChangePasswordModal
                        data={selected!}
                        onSuccess={() => setOpenPwd(false)}
                    />
                </DialogContent>
            </Dialog>
        </Card>
    );
}
