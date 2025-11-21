import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";

interface Props {
  data: any;
  onSuccess: () => void;
}

export default function CustomerForm({ data, onSuccess }: Props) {
  const [form, setForm] = useState({
    name: data?.Name || "",
    phone: data?.Phone || "",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await axios.put(`/api/admin/customers/${data.Id}`, form);
    onSuccess();
  };

  return (
    <form className="space-y-3" onSubmit={submit}>
      <Input
        placeholder="Tên khách hàng"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        placeholder="Số điện thoại"
        value={form.phone}
        onChange={(e) => setForm({ ...form, phone: e.target.value })}
      />

      <Button type="submit" className="w-full">
        Lưu thay đổi
      </Button>
    </form>
  );
}
