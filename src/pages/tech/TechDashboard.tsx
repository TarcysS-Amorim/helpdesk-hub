import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/stats/StatsCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/database';

export default function TechDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ assigned: 0, queue: 0, inProgress: 0, resolved: 0 });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function load() {
      // Meus tickets
      const { data: mine } = await supabase
        .from('tickets')
        .select('status')
        .eq('assigned_tech_id', profile!.id);

      // Fila
      const { data: queue } = await supabase
        .from('tickets')
        .select('id')
        .eq('status', 'OPEN')
        .is('assigned_tech_id', null);

      if (mine) {
        setStats({
          assigned: mine.length,
          queue: queue?.length || 0,
          inProgress: mine.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: mine.filter(t => t.status === 'RESOLVED').length,
        });
      }

      // Tickets recentes
      const { data } = await supabase
        .from('tickets')
        .select('*, customer:profiles!tickets_customer_id_fkey(*), assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)')
        .eq('assigned_tech_id', profile!.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (data) setTickets(data as Ticket[]);
      setLoading(false);
    }

    load();
  }, [profile]);

  return (
    <DashboardLayout title="Dashboard Técnico">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard title="Meus Tickets" value={stats.assigned} icon="🎫" color="primary" />
        <StatsCard title="Na Fila" value={stats.queue} icon="📥" color="accent" />
        <StatsCard title="Em Andamento" value={stats.inProgress} icon="⚡" color="warning" />
        <StatsCard title="Resolvidos" value={stats.resolved} icon="✅" color="success" />
      </div>

      {/* Tickets */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Meus Tickets</h2>
          <Link to="/tech/tickets" className="text-primary hover:underline font-medium">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : tickets.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">Nenhum ticket atribuído</p>
            <Link to="/tech/queue" className="text-primary hover:underline font-medium">
              Ver fila de tickets →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
