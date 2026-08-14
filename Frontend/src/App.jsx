import { Navigate, Route, Routes } from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterDonorPage from "./pages/auth/RegisterDonorPage.jsx";
import RegisterNGOPage from "./pages/auth/RegisterNGOPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

import DonorDashboard from "./pages/donor/DonorDashboard.jsx";
import DonatePage from "./pages/donor/DonatePage.jsx";
import DonationsListPage from "./pages/donor/DonationsListPage.jsx";
import DonationDetailPage from "./pages/donor/DonationDetailPage.jsx";
import NGOsListPage from "./pages/donor/NGOsListPage.jsx";
import NGODetailPage from "./pages/donor/NGODetailPage.jsx";
import RequestsPage from "./pages/donor/RequestsPage.jsx";
import NotificationsPage from "./pages/donor/NotificationsPage.jsx";
import ProfilePage from "./pages/donor/ProfilePage.jsx";

import NGODashboard from "./pages/ngo/NGODashboard.jsx";
import RequirementsPage from "./pages/ngo/RequirementsPage.jsx";
import NGORequestsPage from "./pages/ngo/NGORequestsPage.jsx";
import NGOProfilePage from "./pages/ngo/NGOProfilePage.jsx";
import NGONotificationsPage from "./pages/ngo/NGONotificationsPage.jsx";

import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import NGOApplicationsPage from "./pages/admin/NGOApplicationsPage.jsx";

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const home = { donor: "/donor/dashboard", ngo: "/ngo/dashboard", admin: "/admin/dashboard" }[user.role];
  return <Navigate to={home} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register/donor" element={<RegisterDonorPage />} />
      <Route path="/register/ngo" element={<RegisterNGOPage />} />

      <Route element={<ProtectedRoute allowedRoles={["donor"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/donate" element={<DonatePage />} />
          <Route path="/donor/donations" element={<DonationsListPage />} />
          <Route path="/donor/donations/:id" element={<DonationDetailPage />} />
          <Route path="/donor/ngos" element={<NGOsListPage />} />
          <Route path="/donor/ngos/:id" element={<NGODetailPage />} />
          <Route path="/donor/requests" element={<RequestsPage />} />
          <Route path="/donor/notifications" element={<NotificationsPage />} />
          <Route path="/donor/profile" element={<ProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["ngo"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/ngo/dashboard" element={<NGODashboard />} />
          <Route path="/ngo/requirements" element={<RequirementsPage />} />
          <Route path="/ngo/requests" element={<NGORequestsPage />} />
          <Route path="/ngo/notifications" element={<NGONotificationsPage />} />
          <Route path="/ngo/profile" element={<NGOProfilePage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/ngo-applications" element={<NGOApplicationsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
