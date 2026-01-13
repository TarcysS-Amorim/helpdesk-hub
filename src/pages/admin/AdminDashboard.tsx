import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/stats/StatsCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/database';
import { Ticket as TicketIcon, Users, Clock, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  urgent: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, inProgress: 0, resolved: 0, urgent: 0 });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Fetch stats
      const { data: tickets } = await supabase
        .from('tickets')
        .select('status, priority');

      if (tickets) {
        setStats({
          total: tickets.length,
          open: tickets.filter(t => t.status === 'OPEN').length,
          inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: tickets.filter(t => t.status === 'RESOLVED').length,
          urgent: tickets.filter(t => t.priority === 'URGENT').length,
        });
      }

      // Fetch recent tickets
      const { data: recent } = await supabase
        .from('tickets')
        .select(`
          *,
          customer:profiles!tickets_customer_id_fkey(*),
          assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recent) {
        setRecentTickets(recent as Ticket[]);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  return (
    <DashboardLayout title="Dashboard Admin">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatsCard
          title="Total de Tickets"
          value={stats.total}
          icon={TicketIcon}
        />
        <StatsCard
          title="Abertos"
          value={stats.open}
          icon={Clock}
        />
        <StatsCard
          title="Em Andamento"
          value={stats.inProgress}
          icon={Clock}
        />
        <StatsCard
          title="Resolvidos"
          value={stats.resolved}
          icon={CheckCircle}
        />
        <StatsCard
          title="Urgentes"
          value={stats.urgent}
          icon={AlertTriangle}
        />
      </div>

      {/* Recent Tickets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Tickets Recentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin/tickets">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : recentTickets.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">Nenhum ticket encontrado</div>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}