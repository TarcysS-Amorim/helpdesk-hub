import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/stats/StatsCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/database';
import { Ticket as TicketIcon, Clock, CheckCircle, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Stats {
  total: number;
  open: number;
  resolved: number;
}

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<Stats>({ total: 0, open: 0, resolved: 0 });
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchData = async () => {
    if (!profile) return;

    // Fetch stats
    const { data: tickets } = await supabase
      .from('tickets')
      .select('status')
      .eq('customer_id', profile.id);

    if (tickets) {
      setStats({
        total: tickets.length,
        open: tickets.filter(t => !['CLOSED', 'RESOLVED', 'CANCELED'].includes(t.status)).length,
        resolved: tickets.filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
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
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recent) {
      setRecentTickets(recent as Ticket[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [profile]);

  return (
    <DashboardLayout title="Meu Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard
          title="Total de Tickets"
          value={stats.total}
          icon={TicketIcon}
        />
        <StatsCard
          title="Em Aberto"
          value={stats.open}
          icon={Clock}
        />
        <StatsCard
          title="Resolvidos"
          value={stats.resolved}
          icon={CheckCircle}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end mb-6">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      {/* Recent Tickets */}
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Meus Tickets Recentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer/tickets">
              Ver todos
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">Carregando...</div>
        ) : recentTickets.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Você ainda não criou nenhum ticket.
          </div>
        ) : (
          <div className="space-y-3">
            {recentTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchData}
      />
    </DashboardLayout>
  );
}