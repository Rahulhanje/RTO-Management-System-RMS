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

// Dashboard Pages
import CitizenDashboard from "./pages/citizen/CitizenDashboard";
import NotFound from "./pages/NotFound";

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

            {/* Auth Routes */}
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />

            {/* Citizen Dashboard */}
            <Route path="/citizen" element={<ProtectedRoute allowedRoles={['CITIZEN']}><DashboardLayout /></ProtectedRoute>}>
              <Route path="dashboard" element={<CitizenDashboard />} />
              <Route path="profile" element={<CitizenDashboard />} />
              <Route path="vehicles" element={<CitizenDashboard />} />
              <Route path="license" element={<CitizenDashboard />} />
              <Route path="challans" element={<CitizenDashboard />} />
              <Route path="payments" element={<CitizenDashboard />} />
              <Route path="appointments" element={<CitizenDashboard />} />
              <Route path="documents" element={<CitizenDashboard />} />
              <Route path="notifications" element={<CitizenDashboard />} />
            </Route>

            {/* Other Role Dashboards - placeholder routes */}
            <Route path="/police/*" element={<ProtectedRoute allowedRoles={['POLICE']}><DashboardLayout /></ProtectedRoute>} />
            <Route path="/officer/*" element={<ProtectedRoute allowedRoles={['RTO_OFFICER']}><DashboardLayout /></ProtectedRoute>} />
            <Route path="/admin/*" element={<ProtectedRoute allowedRoles={['RTO_ADMIN']}><DashboardLayout /></ProtectedRoute>} />
            <Route path="/super-admin/*" element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']}><DashboardLayout /></ProtectedRoute>} />
            <Route path="/auditor/*" element={<ProtectedRoute allowedRoles={['AUDITOR']}><DashboardLayout /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
