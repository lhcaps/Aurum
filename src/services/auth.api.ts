import api from "@/lib/api";

export const AuthAPI = {
  async login(email: string, password: string) {
    const res = await api.post("/auth/login", { email, password });
    return res.data;
  }
};
