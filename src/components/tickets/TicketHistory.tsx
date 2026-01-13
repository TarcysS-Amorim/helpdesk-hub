import { TicketHistory as HistoryType, ACTION_LABELS, STATUS_LABELS, PRIORITY_LABELS } from '@/types/database';
import { History, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TicketHistoryProps {
  history: HistoryType[];
}

function formatValue(action: HistoryType['action'], value: string | null): string {
  if (!value) return '-';
  
  if (action === 'STATUS_CHANGED') {
    return STATUS_LABELS[value as keyof typeof STATUS_LABELS] || value;
  }
  
  if (action === 'PRIORITY_CHANGED') {
    return PRIORITY_LABELS[value as keyof typeof PRIORITY_LABELS] || value;
  }
  
  return value;
}

export function TicketHistory({ history }: TicketHistoryProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <History className="w-5 h-5" />
        Histórico
      </h3>

      <div className="space-y-3">
        {history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum histórico disponível.
          </p>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
            >
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium flex-shrink-0">
                {item.actor?.name?.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">{item.actor?.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {ACTION_LABELS[item.action]}
                  </span>
                </div>
                
                {item.from_value || item.to_value ? (
                  <div className="flex items-center gap-2 mt-1 text-sm">
                    {item.from_value && (
                      <span className="px-2 py-0.5 bg-background rounded text-muted-foreground">
                        {formatValue(item.action, item.from_value)}
                      </span>
                    )}
                    {item.from_value && item.to_value && (
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {item.to_value && (
                      <span className="px-2 py-0.5 bg-primary/10 rounded text-primary">
                        {formatValue(item.action, item.to_value)}
                      </span>
                    )}
                  </div>
                ) : null}
                
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDistanceToNow(new Date(item.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}