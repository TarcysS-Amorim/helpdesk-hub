import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  Ticket, 
  Users, 
  LogOut,
  Inbox,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_LABELS } from '@/types/database';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export function Sidebar() {
  const { profile, signOut, isAdmin, isTech, isCustomer } = useAuth();
  const location = useLocation();

  const getNavItems = (): NavItem[] => {
    if (isAdmin) {
      return [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Tickets', href: '/admin/tickets', icon: Ticket },
        { label: 'Usuários', href: '/admin/users', icon: Users },
      ];
    }
    
    if (isTech) {
      return [
        { label: 'Dashboard', href: '/tech', icon: LayoutDashboard },
        { label: 'Meus Tickets', href: '/tech/tickets', icon: Ticket },
        { label: 'Fila', href: '/tech/queue', icon: Inbox },
      ];
    }
    
    return [
      { label: 'Dashboard', href: '/customer', icon: LayoutDashboard },
      { label: 'Meus Tickets', href: '/customer/tickets', icon: Ticket },
    ];
  };

  const navItems = getNavItems();

  const getRoleBadgeClass = () => {
    if (isAdmin) return 'role-admin';
    if (isTech) return 'role-tech';
    return 'role-customer';
  };

  return (
    <aside className="w-64 min-h-screen bg-sidebar text-sidebar-foreground flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Ticket className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="font-bold text-lg">HelpDesk</h1>
            <p className="text-xs text-sidebar-foreground/60">Sistema de Chamados</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 text-sidebar-foreground/80"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
            <span className="text-sm font-medium">
              {profile?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{profile?.name}</p>
            <span className={cn("status-badge text-[10px]", getRoleBadgeClass())}>
              {profile?.role && ROLE_LABELS[profile.role]}
            </span>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
}