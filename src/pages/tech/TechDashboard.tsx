import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/stats/StatsCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/database';
import { Ticket as TicketIcon, Inbox, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  assigned: number;
  queue: number;
  inProgress: number;
  resolved: number;
}

export default function TechDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ assigned: 0, queue: 0, inProgress: 0, resolved: 0 });
  const [myTickets, setMyTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function fetchData() {
      // Fetch assigned tickets for stats
      const { data: assigned } = await supabase
        .from('tickets')
        .select('status')
        .eq('assigned_tech_id', profile!.id);

      // Fetch queue tickets
      const { data: queue } = await supabase
        .from('tickets')
        .select('id')
        .eq('status', 'OPEN')
        .is('assigned_tech_id', null);

      if (assigned) {
        setStats({
          assigned: assigned.length,
          queue: queue?.length || 0,
          inProgress: assigned.filter(t => t.status === 'IN_PROGRESS').length,
          resolved: assigned.filter(t => t.status === 'RESOLVED').length,
        });
      }

      // Fetch my recent tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select(`
          *,
          customer:profiles!tickets_customer_id_fkey(*),
          assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
        `)
        .eq('assigned_tech_id', profile!.id)
        .order('updated_at', { ascending: false })
        .limit(5);

      if (tickets) {
        setMyTickets(tickets as Ticket[]);
      }

      setLoading(false);
    }

    fetchData();
  }, [profile]);

  return (
    <DashboardLayout title="Dashboard Técnico">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Meus Tickets"
          value={stats.assigned}
          icon={TicketIcon}
        />
        <StatsCard
          title="Fila Aberta"
          value={stats.queue}
          icon={Inbox}
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
      </div>

      {/* My Tickets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meus Tickets Recentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/tech/tickets">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : myTickets.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Nenhum ticket atribuído. Verifique a{' '}
            <Link to="/tech/queue" className="text-primary hover:underline">
              fila de tickets
            </Link>
            .
          </div>
        ) : (
          <div className="space-y-3">
            {myTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}