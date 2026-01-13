import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';
import { Ticket } from '@/types/database';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketCardProps {
  ticket: Ticket;
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Link
      to={`/tickets/${ticket.id}`}
      className="block bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3 className="font-medium text-foreground line-clamp-1">{ticket.title}</h3>
        <div className="flex gap-2 flex-shrink-0">
          <PriorityBadge priority={ticket.priority} />
          <StatusBadge status={ticket.status} />
        </div>
      </div>
      
      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
        {ticket.description}
      </p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-1">
            <User className="w-3.5 h-3.5" />
            {ticket.customer?.name || 'Cliente'}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatDistanceToNow(new Date(ticket.created_at), { 
              addSuffix: true, 
              locale: ptBR 
            })}
          </span>
        </div>
        <span className="px-2 py-0.5 bg-muted rounded text-xs">
          {ticket.category}
        </span>
      </div>
    </Link>
  );
}