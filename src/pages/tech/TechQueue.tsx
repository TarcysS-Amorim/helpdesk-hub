import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TicketCard } from '@/components/tickets/TicketCard';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Loader2, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function TechQueue() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState<string | null>(null);

  const fetchQueue = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('tickets')
      .select(`
        *,
        customer:profiles!tickets_customer_id_fkey(*),
        assigned_tech:profiles!tickets_assigned_tech_id_fkey(*)
      `)
      .eq('status', 'OPEN')
      .is('assigned_tech_id', null)
      .order('priority', { ascending: false })
      .order('created_at', { ascending: true });

    if (data) {
      setTickets(data as Ticket[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleAssignToMe = async (ticketId: string) => {
    if (!profile) return;

    setAssigning(ticketId);

    const { error } = await supabase
      .from('tickets')
      .update({ 
        assigned_tech_id: profile.id,
        status: 'IN_PROGRESS'
      })
      .eq('id', ticketId);

    setAssigning(null);

    if (error) {
      toast.error('Erro ao atribuir ticket');
      return;
    }

    toast.success('Ticket atribuído a você!');
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <DashboardLayout title="Fila de Tickets">
      <p className="text-muted-foreground mb-6">
        Tickets abertos aguardando atribuição. Clique em "Pegar" para atribuir a você.
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum ticket na fila no momento.
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div key={ticket.id} className="relative">
              <TicketCard ticket={ticket} />
              <div className="absolute top-4 right-4">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleAssignToMe(ticket.id);
                  }}
                  disabled={assigning === ticket.id}
                >
                  {assigning === ticket.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Pegar
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}