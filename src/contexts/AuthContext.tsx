import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  employee: any | null;
  loading: boolean;
  signOut: () => void;
  signIn: (employee: any, token: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  employee: null,
  loading: true,
  signOut: () => { },
  signIn: () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("employee");
    const storedToken = localStorage.getItem("token");

    if (!storedUser || !storedToken) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    try {
      setEmployee(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem("employee");
      localStorage.removeItem("token");
    }

    setLoading(false);
  }, []);

  const signIn = (employee: any, token: string) => {
    localStorage.setItem("employee", JSON.stringify(employee));
    localStorage.setItem("token", token);
    setEmployee(employee);
  };

  const signOut = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ employee, loading, signOut, signIn }}>
      {children}
    </AuthContext.Provider>
  );
};
