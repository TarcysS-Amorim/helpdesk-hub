import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatusBadge } from '@/components/tickets/StatusBadge';
import { PriorityBadge } from '@/components/tickets/PriorityBadge';
import { CommentTimeline } from '@/components/tickets/CommentTimeline';
import { TicketHistory } from '@/components/tickets/TicketHistory';
import { useAuth } from '@/contexts/AuthContext';
import { useTicket, useTicketComments, useTicketHistory } from '@/hooks/useTickets';
import { useUsers } from '@/hooks/useUsers';
import { 
  TicketStatus, 
  TicketPriority, 
  STATUS_LABELS, 
  PRIORITY_LABELS,
  TICKET_CATEGORIES 
} from '@/types/database';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Clock, User, Tag, Loader2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { profile, isAdmin, isTech, isCustomer } = useAuth();
  const { ticket, loading, updateTicket, refetch } = useTicket(id!);
  const { comments, refetch: refetchComments } = useTicketComments(id!);
  const { history, refetch: refetchHistory } = useTicketHistory(id!);
  const { users: techs } = useUsers('TECH');
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (newStatus: TicketStatus) => {
    // Validate customer actions
    if (isCustomer) {
      if (newStatus === 'CANCELED' && ticket?.status !== 'OPEN') {
        toast.error('Só é possível cancelar tickets abertos');
        return;
      }
      if (newStatus === 'CLOSED' && ticket?.status !== 'RESOLVED') {
        toast.error('Só é possível fechar tickets resolvidos');
        return;
      }
    }

    setUpdating(true);
    const { error } = await updateTicket({ status: newStatus });
    setUpdating(false);

    if (error) {
      toast.error('Erro ao atualizar status');
      return;
    }

    toast.success('Status atualizado');
    refetchHistory();
  };

  const handlePriorityChange = async (newPriority: TicketPriority) => {
    setUpdating(true);
    const { error } = await updateTicket({ priority: newPriority });
    setUpdating(false);

    if (error) {
      toast.error('Erro ao atualizar prioridade');
      return;
    }

    toast.success('Prioridade atualizada');
    refetchHistory();
  };

  const handleTechChange = async (techId: string) => {
    setUpdating(true);
    const { error } = await updateTicket({ 
      assigned_tech_id: techId === 'UNASSIGNED' ? null : techId 
    });
    setUpdating(false);

    if (error) {
      toast.error('Erro ao atribuir técnico');
      return;
    }

    toast.success('Técnico atribuído');
    refetchHistory();
  };

  const getAvailableStatuses = (): TicketStatus[] => {
    if (isAdmin) {
      return ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELED'];
    }
    if (isTech) {
      return ['IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED'];
    }
    // Customer
    const statuses: TicketStatus[] = [];
    if (ticket?.status === 'OPEN') statuses.push('CANCELED');
    if (ticket?.status === 'RESOLVED') statuses.push('CLOSED');
    return statuses;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Ticket não encontrado</p>
          <Button variant="ghost" onClick={() => navigate(-1)} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{ticket.title}</h1>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <User className="w-4 h-4" />
                {ticket.customer?.name}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {format(new Date(ticket.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                {ticket.category}
              </span>
            </div>
          </div>

          {/* Actions based on role */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status selector */}
            {getAvailableStatuses().length > 0 && (
              <Select
                value={ticket.status}
                onValueChange={(value) => handleStatusChange(value as TicketStatus)}
                disabled={updating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatuses().map((status) => (
                    <SelectItem key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Priority selector (Admin only) */}
            {isAdmin && (
              <Select
                value={ticket.priority}
                onValueChange={(value) => handlePriorityChange(value as TicketPriority)}
                disabled={updating}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_LABELS) as TicketPriority[]).map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {PRIORITY_LABELS[priority]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {/* Tech assignment (Admin only) */}
            {isAdmin && (
              <Select
                value={ticket.assigned_tech_id || 'UNASSIGNED'}
                onValueChange={handleTechChange}
                disabled={updating}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Atribuir técnico" />
                </SelectTrigger>
                <SelectContent>
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
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-3">Descrição</h3>
            <p className="text-foreground whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comments */}
          <div className="bg-card border border-border rounded-lg p-6">
            <CommentTimeline
              ticketId={ticket.id}
              comments={comments}
              onCommentAdded={refetchComments}
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Info card */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Informações</h3>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Status</dt>
                <dd><StatusBadge status={ticket.status} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Prioridade</dt>
                <dd><PriorityBadge priority={ticket.priority} /></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Categoria</dt>
                <dd className="font-medium">{ticket.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Cliente</dt>
                <dd className="font-medium">{ticket.customer?.name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Técnico</dt>
                <dd className="font-medium">{ticket.assigned_tech?.name || 'Não atribuído'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Criado</dt>
                <dd>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true, locale: ptBR })}</dd>
              </div>
              {ticket.closed_at && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Fechado</dt>
                  <dd>{formatDistanceToNow(new Date(ticket.closed_at), { addSuffix: true, locale: ptBR })}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* History (Admin/Tech only) */}
          {(isAdmin || isTech) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <TicketHistory history={history} />
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}