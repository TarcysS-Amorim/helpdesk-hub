import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatsCard } from '@/components/stats/StatsCard';
import { TicketCard } from '@/components/tickets/TicketCard';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket } from '@/types/database';

export default function CustomerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, resolved: 0 });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);

  const load = async () => {
    if (!profile) return;

    const { data: all } = await supabase
      .from('tickets')
      .select('status')
      .eq('customer_id', profile.id);

    if (all) {
      setStats({
        total: all.length,
        open: all.filter(t => !['CLOSED', 'RESOLVED', 'CANCELED'].includes(t.status)).length,
        resolved: all.filter(t => ['RESOLVED', 'CLOSED'].includes(t.status)).length,
      });
    }

    const { data } = await supabase
      .from('tickets')
      .select('*, customer:profiles!tickets_customer_id_fkey(*), assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)')
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) setTickets(data as Ticket[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, [profile]);

  return (
    <DashboardLayout title="Meu Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatsCard title="Total" value={stats.total} icon="🎫" color="primary" />
        <StatsCard title="Em Aberto" value={stats.open} icon="⏳" color="warning" />
        <StatsCard title="Resolvidos" value={stats.resolved} icon="✅" color="success" />
      </div>

      {/* Botão criar */}
      <div className="flex justify-end mb-6">
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity glow"
        >
          + Novo Ticket
        </button>
      </div>

      {/* Tickets */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Meus Tickets</h2>
          <Link to="/customer/tickets" className="text-primary hover:underline font-medium">
            Ver todos →
          </Link>
        </div>

        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Carregando...</p>
        ) : tickets.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Você ainda não criou nenhum ticket</p>
        ) : (
          <div className="space-y-3">
            {tickets.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>

      <CreateTicketDialog open={showCreate} onOpenChange={setShowCreate} onSuccess={load} />
    </DashboardLayout>
  );
}
