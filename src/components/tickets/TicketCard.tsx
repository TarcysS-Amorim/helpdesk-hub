import { Link } from 'react-router-dom';
import { Ticket } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  ticket: Ticket;
}

export function TicketCard({ ticket }: Props) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-bold text-foreground line-clamp-1">{ticket.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
        {ticket.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>👤 {ticket.customer?.name || 'Cliente'}</span>
          <span>🕐 {formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: ptBR })}</span>
        </div>
        <span className="px-2 py-1 bg-secondary rounded-lg">{ticket.category}</span>
      </div>
    </Link>
  );
}
