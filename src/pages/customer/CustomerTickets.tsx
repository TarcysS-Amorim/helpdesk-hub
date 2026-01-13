import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { TicketCard } from '@/components/tickets/TicketCard';
import { CreateTicketDialog } from '@/components/tickets/CreateTicketDialog';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketFilters as Filters } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Loader2, Plus } from 'lucide-react';

export default function CustomerTickets() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);

  const fetchTickets = async () => {
    if (!profile) return;

    setLoading(true);

    let query = supabase
      .from('tickets')
      .select(`
        *,
        customer:profiles!tickets_customer_id_fkey(*),
        assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
      `)
      .eq('customer_id', profile.id)
      .order('created_at', { ascending: false });

    if (filters.status && filters.status !== 'ALL') {
      query = query.eq('status', filters.status);
    }

    if (filters.priority && filters.priority !== 'ALL') {
      query = query.eq('priority', filters.priority);
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    const { data } = await query;

    if (data) {
      setTickets(data as Ticket[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [profile, filters]);

  return (
    <DashboardLayout title="Meus Tickets">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Ticket
        </Button>
      </div>

      <TicketFilters
        filters={filters}
        onFiltersChange={setFilters}
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum ticket encontrado.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}

      <CreateTicketDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={fetchTickets}
      />
    </DashboardLayout>
  );
}