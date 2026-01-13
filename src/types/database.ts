export type UserRole = 'ADMIN' | 'TECH' | 'CUSTOMER';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_CUSTOMER' | 'RESOLVED' | 'CLOSED' | 'CANCELED';
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type HistoryAction = 'STATUS_CHANGED' | 'ASSIGNED_TECH' | 'PRIORITY_CHANGED' | 'CATEGORY_CHANGED' | 'CREATED' | 'COMMENT_ADDED';

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  customer_id: string;
  assigned_tech_id: string | null;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  // Joined data
  customer?: Profile;
  assigned_tech?: Profile;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  author_id: string;
  message: string;
  is_internal: boolean;
  created_at: string;
  // Joined data
  author?: Profile;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  actor_id: string;
  action: HistoryAction;
  from_value: string | null;
  to_value: string | null;
  created_at: string;
  // Joined data
  actor?: Profile;
}

export interface TicketFilters {
  status?: TicketStatus | 'ALL';
  priority?: TicketPriority | 'ALL';
  category?: string;
  assignedTechId?: string;
  search?: string;
}

export const TICKET_CATEGORIES = [
  'General',
  'Technical',
  'Billing',
  'Account',
  'Feature Request',
  'Bug Report',
  'Other'
] as const;

export const STATUS_LABELS: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Andamento',
  WAITING_CUSTOMER: 'Aguardando Cliente',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
  CANCELED: 'Cancelado'
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente'
};

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  TECH: 'Técnico',
  CUSTOMER: 'Cliente'
};

export const ACTION_LABELS: Record<HistoryAction, string> = {
  STATUS_CHANGED: 'Status alterado',
  ASSIGNED_TECH: 'Técnico atribuído',
  PRIORITY_CHANGED: 'Prioridade alterada',
  CATEGORY_CHANGED: 'Categoria alterada',
  CREATED: 'Ticket criado',
  COMMENT_ADDED: 'Comentário adicionado'
};