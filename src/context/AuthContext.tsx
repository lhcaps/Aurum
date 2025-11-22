import { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(
    JSON.parse(localStorage.getItem("employee_data") || "null")
  );

  const login = async (email: string, password: string) => {
    const res = await api.post("/employee/auth/login", { email, password });

    if (res.data.ok) {
      const { accessToken, employee } = res.data;
      localStorage.setItem("employee_token", accessToken);
      localStorage.setItem("employee_data", JSON.stringify(employee));
      setEmployee(employee);
    }
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem("employee_token");
    localStorage.removeItem("employee_data");
    setEmployee(null);
  };

  return (
    <AuthContext.Provider value={{ employee, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
