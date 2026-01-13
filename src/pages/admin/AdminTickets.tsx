import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TicketFilters } from '@/components/tickets/TicketFilters';
import { TicketCard } from '@/components/tickets/TicketCard';
import { useTickets } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { TicketFilters as Filters } from '@/types/database';
import { Loader2 } from 'lucide-react';

export default function AdminTickets() {
  const [filters, setFilters] = useState<Filters>({});
  const { tickets, loading } = useTickets(filters);
  const { users: techs } = useUsers('TECH');

  return (
    <DashboardLayout title="Todos os Tickets">
      <TicketFilters
        filters={filters}
        onFiltersChange={setFilters}
        techs={techs}
        showTechFilter
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum ticket encontrado com os filtros atuais.
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