import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function Sidebar() {
  const { profile, signOut, isAdmin, isTech } = useAuth();
  const location = useLocation();

  // Links simples baseados no role
  const links = isAdmin
    ? [
        { href: '/admin', label: 'Dashboard', icon: '📊' },
        { href: '/admin/tickets', label: 'Tickets', icon: '🎫' },
        { href: '/admin/users', label: 'Usuários', icon: '👥' },
      ]
    : isTech
    ? [
        { href: '/tech', label: 'Dashboard', icon: '📊' },
        { href: '/tech/tickets', label: 'Meus Tickets', icon: '🎫' },
        { href: '/tech/queue', label: 'Fila', icon: '📥' },
      ]
    : [
        { href: '/customer', label: 'Dashboard', icon: '📊' },
        { href: '/customer/tickets', label: 'Meus Tickets', icon: '🎫' },
      ];

  const roleLabel = isAdmin ? 'Admin' : isTech ? 'Técnico' : 'Cliente';
  const roleColor = isAdmin ? 'text-accent' : isTech ? 'text-primary' : 'text-success';

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col border-r border-sidebar-border">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl">
            🎫
          </div>
          <div>
            <h1 className="font-black text-lg text-sidebar-foreground">HelpDesk</h1>
            <p className="text-xs text-muted-foreground">Chamados</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = location.pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  to={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground font-bold'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent'
                  }`}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Usuário */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center font-bold">
            {profile?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-sm text-sidebar-foreground">{profile?.name}</p>
            <p className={`text-xs font-bold ${roleColor}`}>{roleLabel}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          🚪 Sair
        </button>
      </div>
    </aside>
  );
}
