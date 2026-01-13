-- Fix function search paths for security
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.record_ticket_history() SET search_path = public;
ALTER FUNCTION public.record_ticket_created() SET search_path = public;
ALTER FUNCTION public.get_user_role(UUID) SET search_path = public;

-- Fix permissive RLS policy on ticket_history
DROP POLICY IF EXISTS "System can insert history" ON public.ticket_history;

-- History is inserted by triggers, not directly by users
-- Allow insert only through trigger context (authenticated user context)
CREATE POLICY "Authenticated users can insert history via triggers"
  ON public.ticket_history FOR INSERT
  TO authenticated
  WITH CHECK (
    actor_id = auth.uid() OR
    public.get_user_role(auth.uid()) IN ('ADMIN', 'TECH')
  );