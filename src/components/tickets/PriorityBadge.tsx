import { TicketPriority, PRIORITY_LABELS } from '@/types/database';

interface Props {
  priority: TicketPriority;
}

export function PriorityBadge({ priority }: Props) {
  const colors: Record<TicketPriority, string> = {
    LOW: 'bg-muted text-muted-foreground border-border',
    MEDIUM: 'bg-primary/20 text-primary border-primary/30',
    HIGH: 'bg-warning/20 text-warning border-warning/30',
    URGENT: 'bg-destructive/20 text-destructive border-destructive/30',
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colors[priority]}`}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}
