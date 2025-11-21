import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";

interface EmployeeFormProps {
  data?: any;
  onSuccess: () => void;
}

export default function EmployeeForm({ data, onSuccess }: EmployeeFormProps) {
  const isEdit = !!data;

  const [form, setForm] = useState({
    name: data?.Name || "",
    email: data?.Email || "",
    phone: data?.Phone || "",
    role: data?.Role || "cashier",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isEdit) {
      await axios.put(`/api/admin/employees/${data.Id}`, form);
    } else {
      await axios.post(`/api/admin/employees`, form);
    }

    onSuccess();
  };

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <Input
        placeholder="Tên nhân viên"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />

      <Input
        placeholder="Số điện thoại"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <select
        className="border p-2 rounded w-full"
        value={form.role}
        onChange={(e) => setForm({ ...form, role: e.target.value })}
      >
        <option value="cashier">Cashier</option>
        <option value="barista">Barista</option>
        <option value="manager">Manager</option>
      </select>

      {!isEdit && (
        <Input
          placeholder="Mật khẩu"
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
      )}

      <Button type="submit" className="w-full">
        {isEdit ? "Lưu thay đổi" : "Thêm nhân viên"}
      </Button>
    </form>
  );
}
