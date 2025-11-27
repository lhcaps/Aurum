import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import BaristaLayout from "@/layouts/BaristaLayout";

import LoginPage from "@/pages/Login";

// BARISTA PAGES
import PhaChe from "@/pages/PhaChe";
import DonMoi from "@/pages/DonMoi";
import HoanTat from "@/pages/HoanTat";
import TraCuuCongThuc from "@/pages/CongThuc";

export default function App() {
  const rawToken = localStorage.getItem("employee_token");
  const isLoggedIn =
    rawToken !== null &&
    rawToken !== "" &&
    rawToken !== "null" &&
    rawToken !== "undefined";

  return (
    <BrowserRouter>
      <Routes>
        {/* AUTH */}
        <Route path="/auth">
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* BARISTA AREA */}
        <Route element={<BaristaLayout />}>
          <Route
            path="/pha-che"
            element={
              <ProtectedRoute>
                <PhaChe />
              </ProtectedRoute>
            }
          />

          <Route
            path="/don-moi"
            element={
              <ProtectedRoute>
                <DonMoi />
              </ProtectedRoute>
            }
          />

          

          <Route
            path="/hoan-tat"
            element={
              <ProtectedRoute>
                <HoanTat />
              </ProtectedRoute>
            }
          />

          <Route
            path="/cong-thuc"
            element={
              <ProtectedRoute>
                <TraCuuCongThuc />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            isLoggedIn
              ? <Navigate to="/pha-che" replace />
              : <Navigate to="/auth/login" replace />
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
//hahaha