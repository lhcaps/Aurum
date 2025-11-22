import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  employee: any | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  employee: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [employee, setEmployee] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("employee");

    console.log("STORED EMPLOYEE =", stored);

    if (!stored) {
      setEmployee(null);
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setEmployee(parsed);
    } catch (e) {
      console.log("PARSE ERROR => reset employee");
      localStorage.removeItem("employee");
      setEmployee(null);
    }

    setLoading(false);
  }, []);

  const signOut = () => {
    localStorage.removeItem("employee");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ employee, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
