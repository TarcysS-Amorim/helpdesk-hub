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

// Redireciona baseado no role do usuário
function RoleBasedRedirect() {
  const { profile, loading, user } = useAuth();

  // Ainda carregando? Mostra nada
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    );
  }

  // Não logado? Vai pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Esperando profile carregar
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl animate-pulse">🔄</div>
      </div>
    );
  }

  // Redireciona baseado no role
  if (profile.role === 'ADMIN') {
    return <Navigate to="/admin" replace />;
  }

  if (profile.role === 'TECH') {
    return <Navigate to="/tech" replace />;
  }

  return <Navigate to="/customer" replace />;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  // Ainda carregando auth? Não renderiza rotas ainda
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Login - se já logado, vai pra home */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
      <Route path="/forbidden" element={<Forbidden />} />

      {/* Home - redireciona baseado no role */}
      <Route path="/" element={<RoleBasedRedirect />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/tickets" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminTickets /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminUsers /></ProtectedRoute>} />

      {/* Tech */}
      <Route path="/tech" element={<ProtectedRoute allowedRoles={['TECH']}><TechDashboard /></ProtectedRoute>} />
      <Route path="/tech/tickets" element={<ProtectedRoute allowedRoles={['TECH']}><TechTickets /></ProtectedRoute>} />
      <Route path="/tech/queue" element={<ProtectedRoute allowedRoles={['TECH']}><TechQueue /></ProtectedRoute>} />

      {/* Customer */}
      <Route path="/customer" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/tickets" element={<ProtectedRoute allowedRoles={['CUSTOMER']}><CustomerTickets /></ProtectedRoute>} />

      {/* Detalhe do ticket - qualquer role logado */}
      <Route path="/tickets/:id" element={<ProtectedRoute><TicketDetail /></ProtectedRoute>} />

      {/* 404 */}
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
