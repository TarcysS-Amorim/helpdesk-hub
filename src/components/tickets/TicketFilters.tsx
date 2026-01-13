import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  TicketFilters as Filters, 
  TicketStatus, 
  TicketPriority,
  STATUS_LABELS,
  PRIORITY_LABELS,
  TICKET_CATEGORIES,
  Profile
} from '@/types/database';

interface TicketFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  techs?: Profile[];
  showTechFilter?: boolean;
}

export function TicketFilters({ 
  filters, 
  onFiltersChange, 
  techs = [],
  showTechFilter = false 
}: TicketFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3 mb-6">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar tickets..."
          value={filters.search || ''}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="pl-9"
        />
      </div>

      <Select
        value={filters.status || 'ALL'}
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          status: value as TicketStatus | 'ALL' 
        })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todos os status</SelectItem>
          {(Object.keys(STATUS_LABELS) as TicketStatus[]).map((status) => (
            <SelectItem key={status} value={status}>
              {STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.priority || 'ALL'}
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          priority: value as TicketPriority | 'ALL' 
        })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Prioridade" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas prioridades</SelectItem>
          {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((priority) => (
            <SelectItem key={priority} value={priority}>
              {PRIORITY_LABELS[priority]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.category || 'ALL'}
        onValueChange={(value) => onFiltersChange({ 
          ...filters, 
          category: value === 'ALL' ? undefined : value 
        })}
      >
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Todas categorias</SelectItem>
          {TICKET_CATEGORIES.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {showTechFilter && (
        <Select
          value={filters.assignedTechId || 'ALL'}
          onValueChange={(value) => onFiltersChange({ 
            ...filters, 
            assignedTechId: value === 'ALL' ? undefined : value 
          })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Técnico" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Todos técnicos</SelectItem>
            <SelectItem value="UNASSIGNED">Não atribuído</SelectItem>
            {techs.map((tech) => (
              <SelectItem key={tech.id} value={tech.id}>
                {tech.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}