import { createContext, useContext, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [employee, setEmployee] = useState(
    JSON.parse(localStorage.getItem("employee") || "null")
  );

const login = async (email: string, password: string) => {
  console.log(">>> BARISTA LOGIN CALLED");

  const res = await api.post("/api/admin/auth/login", { email, password });

  console.log(">>> RECEIVED:", res.data);

  if (res.data.ok) {
    const { accessToken, employee } = res.data;

    localStorage.setItem("employee_token", accessToken);
    localStorage.setItem("employee_data", JSON.stringify(employee));

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
