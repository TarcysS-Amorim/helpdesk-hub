import { cn } from '@/lib/utils';
import { TicketPriority, PRIORITY_LABELS } from '@/types/database';

interface PriorityBadgeProps {
  priority: TicketPriority;
  className?: string;
}

const priorityClasses: Record<TicketPriority, string> = {
  LOW: 'priority-low',
  MEDIUM: 'priority-medium',
  HIGH: 'priority-high',
  URGENT: 'priority-urgent',
};

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span className={cn('status-badge', priorityClasses[priority], className)}>
      {PRIORITY_LABELS[priority]}
    </span>
  );
}