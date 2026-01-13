import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { TicketComment } from '@/types/database';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { MessageSquare, Lock, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface CommentTimelineProps {
  ticketId: string;
  comments: TicketComment[];
  onCommentAdded?: () => void;
}

export function CommentTimeline({ ticketId, comments, onCommentAdded }: CommentTimelineProps) {
  const { profile, isAdmin, isTech } = useAuth();
  const [message, setMessage] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !profile) return;

    setLoading(true);

    const { error } = await supabase
      .from('ticket_comments')
      .insert({
        ticket_id: ticketId,
        author_id: profile.id,
        message: message.trim(),
        is_internal: (isAdmin || isTech) ? isInternal : false,
      });

    setLoading(false);

    if (error) {
      console.error('Error adding comment:', error);
      toast.error('Erro ao adicionar comentário');
      return;
    }

    setMessage('');
    setIsInternal(false);
    toast.success('Comentário adicionado');
    onCommentAdded?.();
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <MessageSquare className="w-5 h-5" />
        Comentários ({comments.length})
      </h3>

      {/* Comment list */}
      <div className="space-y-3">
        {comments.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum comentário ainda.
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                "p-4 rounded-lg border",
                comment.is_internal
                  ? "bg-warning/5 border-warning/20"
                  : "bg-card border-border"
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {comment.author?.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-sm">{comment.author?.name}</span>
                  {comment.is_internal && (
                    <span className="inline-flex items-center gap-1 text-xs text-warning">
                      <Lock className="w-3 h-3" />
                      Interno
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(comment.created_at), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </span>
              </div>
              <p className="text-sm text-foreground whitespace-pre-wrap">
                {comment.message}
              </p>
            </div>
          ))
        )}
      </div>

      {/* Add comment form */}
      <form onSubmit={handleSubmit} className="space-y-3 pt-4 border-t">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Escreva um comentário..."
          rows={3}
        />
        
        <div className="flex items-center justify-between">
          {(isAdmin || isTech) && (
            <div className="flex items-center gap-2">
              <Checkbox
                id="internal"
                checked={isInternal}
                onCheckedChange={(checked) => setIsInternal(checked as boolean)}
              />
              <Label htmlFor="internal" className="text-sm text-muted-foreground cursor-pointer">
                Comentário interno (invisível para cliente)
              </Label>
            </div>
          )}
          
          <Button type="submit" disabled={loading || !message.trim()} size="sm">
            <Send className="w-4 h-4 mr-2" />
            {loading ? 'Enviando...' : 'Enviar'}
          </Button>
        </div>
      </form>
    </div>
  );
}