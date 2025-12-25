import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/public/About";
import Services from "./pages/public/Services";
import Contact from "./pages/public/Contact";
import FAQs from "./pages/public/FAQs";
import Announcements from "./pages/public/Announcements";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import VerifyOTP from "./pages/auth/VerifyOTP";
import ResetPassword from "./pages/auth/ResetPassword";

// Citizen Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import MyVehicles from "./pages/citizen/MyVehicles";
import DrivingLicense from "./pages/citizen/DrivingLicense";
import MyChallans from "./pages/citizen/MyChallans";
import PaymentHistory from "./pages/citizen/PaymentHistory";
import MyAppointments from "./pages/citizen/MyAppointments";
import MyProfile from "./pages/citizen/MyProfile";
import MyNotifications from "./pages/citizen/MyNotifications";
import MyDocuments from "./pages/citizen/MyDocuments";

// Police Pages
import PoliceDashboard from "./pages/police/PoliceDashboard";
import IssueChallan from "./pages/police/IssueChallan";
import ChallanList from "./pages/police/ChallanList";
import PoliceAnalytics from "./pages/police/PoliceAnalytics";

// Officer Pages
import OfficerDashboard from "./pages/officer/OfficerDashboard";
import DocumentVerification from "./pages/officer/DocumentVerification";
import TestResults from "./pages/officer/TestResults";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import VehicleManagement from "./pages/admin/VehicleManagement";
import DLManagement from "./pages/admin/DLManagement";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

// Super Admin Pages
import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import RTOOfficeManagement from "./pages/superadmin/RTOOfficeManagement";
import UserManagement from "./pages/superadmin/UserManagement";
import RoleAssignment from "./pages/superadmin/RoleAssignment";
import SystemSettings from "./pages/superadmin/SystemSettings";

// Auditor Pages
import AuditorDashboard from "./pages/auditor/AuditorDashboard";
import RevenueReports from "./pages/auditor/RevenueReports";
import PaymentsAudit from "./pages/auditor/PaymentsAudit";
import ViolationReports from "./pages/auditor/ViolationReports";

// System Pages
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import ServerError from "./pages/ServerError";
import Maintenance from "./pages/Maintenance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<FAQs />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/profile" element={<MyProfile />} />
            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/verify-otp" element={<VerifyOTP />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />

            {/* Citizen Dashboard */}
            <Route path="/citizen" element={<ProtectedRoute allowedRoles={['CITIZEN']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="profile" element={<MyProfile />} />
              <Route path="vehicles" element={<MyVehicles />} />
              <Route path="license" element={<DrivingLicense />} />
              <Route path="challans" element={<MyChallans />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="documents" element={<MyDocuments />} />
              <Route path="notifications" element={<MyNotifications />} />
            </Route>

            {/* Police Dashboard */}
            <Route path="/police" element={<ProtectedRoute allowedRoles={['POLICE']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<PoliceDashboard />} />
              <Route path="issue-challan" element={<IssueChallan />} />
              <Route path="challans" element={<ChallanList />} />
              <Route path="analytics" element={<PoliceAnalytics />} />
              <Route path="profile" element={<MyProfile />} />
            </Route>

            {/* Officer Dashboard */}
            <Route path="/officer" element={<ProtectedRoute allowedRoles={['RTO_OFFICER']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<OfficerDashboard />} />
              <Route path="applications" element={<DocumentVerification />} />
              <Route path="verification" element={<DocumentVerification />} />
              <Route path="test-results" element={<TestResults />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="profile" element={<MyProfile />} />
            </Route>

            {/* Admin Dashboard */}
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['RTO_ADMIN']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="vehicles" element={<VehicleManagement />} />
              <Route path="dl-applications" element={<DLManagement />} />
              <Route path="challans" element={<ChallanList />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="appointments" element={<MyAppointments />} />
              <Route path="notifications" element={<MyNotifications />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="users" element={<UserManagement />} />
            </Route>

            {/* Super Admin Dashboard */}
            <Route path="/super-admin" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<SuperAdminDashboard />} />
              <Route path="offices" element={<RTOOfficeManagement />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="roles" element={<RoleAssignment />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="settings" element={<SystemSettings />} />
            </Route>

            {/* Auditor Dashboard */}
            <Route path="/auditor" element={<ProtectedRoute allowedRoles={['AUDITOR']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<AuditorDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="revenue" element={<RevenueReports />} />
              <Route path="violations" element={<ViolationReports />} />
              <Route path="payments" element={<PaymentsAudit />} />
              <Route path="profile" element={<MyProfile />} />
            </Route>

            {/* System Routes */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/server-error" element={<ServerError />} />
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
