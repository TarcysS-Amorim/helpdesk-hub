import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Ticket, TicketFilters, TicketStatus, TicketPriority } from '@/types/database';

export function useTickets(filters: TicketFilters = {}) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('tickets')
        .select(`
          *,
          customer:profiles!tickets_customer_id_fkey(*),
          assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.status && filters.status !== 'ALL') {
        query = query.eq('status', filters.status);
      }

      if (filters.priority && filters.priority !== 'ALL') {
        query = query.eq('priority', filters.priority);
      }

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.assignedTechId) {
        if (filters.assignedTechId === 'UNASSIGNED') {
          query = query.is('assigned_tech_id', null);
        } else {
          query = query.eq('assigned_tech_id', filters.assignedTechId);
        }
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;

      setTickets(data as Ticket[]);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.priority, filters.category, filters.assignedTechId, filters.search]);

  return { tickets, loading, error, refetch: fetchTickets };
}

export function useTicket(id: string) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTicket = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('tickets')
        .select(`
          *,
          customer:profiles!tickets_customer_id_fkey(*),
          assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      setTicket(data as Ticket);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchTicket();
    }
  }, [id]);

  const updateTicket = async (updates: Partial<Ticket>) => {
    if (!ticket) return { error: new Error('No ticket loaded') };

    const { data, error } = await supabase
      .from('tickets')
      .update(updates as Record<string, unknown>)
      .eq('id', ticket.id)
      .select()
      .single();

    if (!error) {
      await fetchTicket();
    }

    return { data, error };
  };

  return { ticket, loading, error, refetch: fetchTicket, updateTicket };
}

export function useTicketComments(ticketId: string) {
  const [comments, setComments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = async () => {
    const { data, error } = await supabase
      .from('ticket_comments')
      .select(`
        *,
        author:profiles(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (!error) {
      setComments(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ticketId) {
      fetchComments();
    }
  }, [ticketId]);

  return { comments, loading, refetch: fetchComments };
}

export function useTicketHistory(ticketId: string) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    const { data, error } = await supabase
      .from('ticket_history')
      .select(`
        *,
        actor:profiles(*)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: false });

    if (!error) {
      setHistory(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (ticketId) {
      fetchHistory();
    }
  }, [ticketId]);

  return { history, loading, refetch: fetchHistory };
}