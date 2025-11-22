import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = localStorage.getItem("employee_token");
  const employee = JSON.parse(localStorage.getItem("employee_data") || "null");

  if (!token) return <Navigate to="/auth/login" replace />;

  // ÉP CHỈ CHO BARISTA VÀO
  if (!employee || employee.role !== "barista") {
    return <Navigate to="/auth/login" replace />;
  }

  return children;
}
