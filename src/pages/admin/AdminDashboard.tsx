import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/stats/StatsCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/database';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, urgent: 0 });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Stats
      const { data: all } = await supabase.from('tickets').select('status, priority');
      if (all) {
        setStats({
          total: all.length,
          open: all.filter(t => t.status === 'OPEN').length,
          inProgress: all.filter(t => t.status === 'IN_PROGRESS').length,
          urgent: all.filter(t => t.priority === 'URGENT').length,
        });
      }

      // Tickets recentes
      const { data } = await supabase
        .from('tickets')
        .select('*, customer:profiles!tickets_customer_id_fkey(*), assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (data) setTickets(data as Ticket[]);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <DashboardLayout title="Dashboard Admin">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Total" value={stats.total} icon="🎫" color="primary" />
        <StatsCard title="Abertos" value={stats.open} icon="📬" color="accent" />
        <StatsCard title="Em Andamento" value={stats.inProgress} icon="⚡" color="warning" />
        <StatsCard title="Urgentes" value={stats.urgent} icon="🚨" color="destructive" />
      </div>

      {/* Tickets */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Tickets Recentes</h2>
          <Link to="/admin/tickets" className="text-primary hover:underline font-medium">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Nenhum ticket ainda</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
