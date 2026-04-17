import { Navigate, Route, Routes } from "react-router-dom";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminFoundationDetailPage from "./pages/AdminFoundationDetailPage";
import AdminLoginPage from "./pages/AdminLoginPage";

export default function AdminApp() {
  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
      <Route path="/admin/foundation/:foundationNo" element={<AdminFoundationDetailPage />} />
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
}
