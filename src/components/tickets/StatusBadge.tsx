import { TicketStatus, STATUS_LABELS } from '@/types/database';

interface Props {
  status: TicketStatus;
}

export function StatusBadge({ status }: Props) {
  const colors: Record<TicketStatus, string> = {
    OPEN: 'bg-primary/20 text-primary border-primary/30',
    IN_PROGRESS: 'bg-warning/20 text-warning border-warning/30',
    WAITING_CUSTOMER: 'bg-accent/20 text-accent border-accent/30',
    RESOLVED: 'bg-success/20 text-success border-success/30',
    CLOSED: 'bg-muted text-muted-foreground border-border',
    CANCELED: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colors[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
}
