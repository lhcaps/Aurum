import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import axios from "@/lib/axios";

interface Props {
  data: any;
  onSuccess: () => void;
}

export default function ChangePasswordModal({ data, onSuccess }: Props) {
  const [pwd, setPwd] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await axios.patch(`/api/admin/employees/${data.Id}/password`, {
      password: pwd,
    });

    onSuccess();
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <Input
        placeholder="Mật khẩu mới"
        type="password"
        value={pwd}
        onChange={(e) => setPwd(e.target.value)}
      />

      <Button type="submit" className="w-full">
        Cập nhật
      </Button>
    </form>
  );
}
