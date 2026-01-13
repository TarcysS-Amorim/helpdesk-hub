import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketFilters as Filters } from '@/types/database';
import { Loader2 } from 'lucide-react';

export default function TechTickets() {
  const { profile } = useAuth();
  const [filters, setFilters] = useState<Filters>({});
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    async function fetchTickets() {
      setLoading(true);

      let query = supabase
        .from('tickets')
        .select(`
          *,
          customer:profiles!tickets_customer_id_fkey(*),
          assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
        `)
        .eq('assigned_tech_id', profile!.id)
        .order('updated_at', { ascending: false });

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
    }

    fetchTickets();
  }, [profile, filters]);

  return (
    <DashboardLayout title="Meus Tickets">
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
          Nenhum ticket atribuído a você.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <TicketCard key={ticket.id} ticket={ticket} />
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}