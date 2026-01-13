import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Pages
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Forbidden from "./pages/Forbidden";
import TicketDetail from "./pages/TicketDetail";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTickets from "./pages/admin/AdminTickets";
import AdminUsers from "./pages/admin/AdminUsers";

// Tech pages
import TechDashboard from "./pages/tech/TechDashboard";
import TechTickets from "./pages/tech/TechTickets";
import TechQueue from "./pages/tech/TechQueue";

// Customer pages
import CustomerDashboard from "./pages/customer/CustomerDashboard";
import CustomerTickets from "./pages/customer/CustomerTickets";

const queryClient = new QueryClient();

function RoleBasedRedirect() {
  const { profile, loading, user } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile?.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (profile?.role === 'TECH') {
    return <Navigate to="/tech" replace />;
  }

  return <Navigate to="/customer" replace />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Role-based redirect */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Admin routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute allowedRoles={['ADMIN']}>
            <AdminUsers />
          </ProtectedRoute>
        }
      />

      {/* Tech routes */}
      <Route
        path="/tech"
        element={
          <ProtectedRoute allowedRoles={['TECH']}>
            <TechDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tech/tickets"
        element={
          <ProtectedRoute allowedRoles={['TECH']}>
            <TechTickets />
          </ProtectedRoute>
        }
      />
      <Route
        path="/tech/queue"
        element={
          <ProtectedRoute allowedRoles={['TECH']}>
            <TechQueue />
          </ProtectedRoute>
        }
      />

      {/* Customer routes */}
      <Route
        path="/customer"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/customer/tickets"
        element={
          <ProtectedRoute allowedRoles={['CUSTOMER']}>
            <CustomerTickets />
          </ProtectedRoute>
        }
      />

      {/* Shared routes */}
      <Route
        path="/tickets/:id"
        element={
          <ProtectedRoute>
            <TicketDetail />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;