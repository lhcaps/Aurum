import { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(
    JSON.parse(localStorage.getItem("employee") || "null")
  );

  const login = async (email: string, password: string) => {
    const res = await api.post("/employee/auth/login", { email, password });

    if (res.data.ok) {
      const { accessToken, employee } = res.data;

      localStorage.setItem("token", accessToken);          // FIXED
      localStorage.setItem("employee", JSON.stringify(employee)); // FIXED

      setEmployee(employee);
    }

    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("employee");
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ employee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
