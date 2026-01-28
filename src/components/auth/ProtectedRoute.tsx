import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();

  // Ainda carregando? Mostra loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl animate-pulse">⏳</div>
      </div>
    );
  }

  // Não tem user? Vai pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Tem user mas não tem profile ainda? Espera carregar
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-4xl animate-pulse">🔄</div>
      </div>
    );
  }

  // Tem role específico pra checar?
  if (allowedRoles && !allowedRoles.includes(profile.role)) {
    return <Navigate to="/forbidden" replace />;
  }

  // Tudo certo, renderiza o children
  return <>{children}</>;
}
