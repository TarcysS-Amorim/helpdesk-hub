import { cn } from '@/lib/utils';
import { TicketStatus, STATUS_LABELS } from '@/types/database';

interface StatusBadgeProps {
  status: TicketStatus;
  className?: string;
}

const statusClasses: Record<TicketStatus, string> = {
  OPEN: 'status-open',
  IN_PROGRESS: 'status-in-progress',
  WAITING_CUSTOMER: 'status-waiting',
  RESOLVED: 'status-resolved',
  CLOSED: 'status-closed',
  CANCELED: 'status-canceled',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn('status-badge', statusClasses[status], className)}>
      {STATUS_LABELS[status]}
    </span>
  );
}