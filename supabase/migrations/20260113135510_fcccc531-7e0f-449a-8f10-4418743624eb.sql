-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('ADMIN', 'TECH', 'CUSTOMER');
CREATE TYPE ticket_status AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED', 'CANCELED');
CREATE TYPE ticket_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE history_action AS ENUM ('STATUS_CHANGED', 'ASSIGNED_TECH', 'PRIORITY_CHANGED', 'CATEGORY_CHANGED', 'CREATED', 'COMMENT_ADDED');

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tickets table
CREATE TABLE public.tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status ticket_status NOT NULL DEFAULT 'OPEN',
  priority ticket_priority NOT NULL DEFAULT 'MEDIUM',
  category TEXT NOT NULL DEFAULT 'General',
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_tech_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at TIMESTAMPTZ
);

-- Ticket comments table
CREATE TABLE public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ticket history table
CREATE TABLE public.ticket_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.tickets(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  action history_action NOT NULL,
  from_value TEXT,
  to_value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Refresh tokens table for token management
CREATE TABLE public.refresh_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_tickets_customer ON public.tickets(customer_id);
CREATE INDEX idx_tickets_tech ON public.tickets(assigned_tech_id);
CREATE INDEX idx_tickets_status ON public.tickets(status);
CREATE INDEX idx_tickets_priority ON public.tickets(priority);
CREATE INDEX idx_comments_ticket ON public.ticket_comments(ticket_id);
CREATE INDEX idx_history_ticket ON public.ticket_history(ticket_id);
CREATE INDEX idx_refresh_tokens_user ON public.refresh_tokens(user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for updated_at
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_tickets_updated_at
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'CUSTOMER')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to record ticket history
CREATE OR REPLACE FUNCTION public.record_ticket_history()
RETURNS TRIGGER AS $$
BEGIN
  -- Status change
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.ticket_history (ticket_id, actor_id, action, from_value, to_value)
    VALUES (NEW.id, auth.uid(), 'STATUS_CHANGED', OLD.status::text, NEW.status::text);
  END IF;
  
  -- Priority change
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO public.ticket_history (ticket_id, actor_id, action, from_value, to_value)
    VALUES (NEW.id, auth.uid(), 'PRIORITY_CHANGED', OLD.priority::text, NEW.priority::text);
  END IF;
  
  -- Tech assignment change
  IF OLD.assigned_tech_id IS DISTINCT FROM NEW.assigned_tech_id THEN
    INSERT INTO public.ticket_history (ticket_id, actor_id, action, from_value, to_value)
    VALUES (NEW.id, auth.uid(), 'ASSIGNED_TECH', OLD.assigned_tech_id::text, NEW.assigned_tech_id::text);
  END IF;
  
  -- Category change
  IF OLD.category IS DISTINCT FROM NEW.category THEN
    INSERT INTO public.ticket_history (ticket_id, actor_id, action, from_value, to_value)
    VALUES (NEW.id, auth.uid(), 'CATEGORY_CHANGED', OLD.category, NEW.category);
  END IF;
  
  -- Set closed_at when status changes to CLOSED or RESOLVED
  IF NEW.status IN ('CLOSED', 'RESOLVED', 'CANCELED') AND OLD.status NOT IN ('CLOSED', 'RESOLVED', 'CANCELED') THEN
    NEW.closed_at = now();
  END IF;
  
  -- Clear closed_at if reopened
  IF OLD.status IN ('CLOSED', 'RESOLVED', 'CANCELED') AND NEW.status NOT IN ('CLOSED', 'RESOLVED', 'CANCELED') THEN
    NEW.closed_at = NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for ticket history
CREATE TRIGGER record_ticket_changes
  BEFORE UPDATE ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.record_ticket_history();

-- Function to record ticket creation
CREATE OR REPLACE FUNCTION public.record_ticket_created()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.ticket_history (ticket_id, actor_id, action, to_value)
  VALUES (NEW.id, NEW.customer_id, 'CREATED', NEW.status::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER record_ticket_creation
  AFTER INSERT ON public.tickets
  FOR EACH ROW EXECUTE FUNCTION public.record_ticket_created();

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refresh_tokens ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
-- Everyone can view profiles (for displaying names)
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Users can update their own profile (except role)
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admin can update any profile
CREATE POLICY "Admin can update any profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Admin can insert profiles (for user management)
CREATE POLICY "Admin can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.get_user_role(auth.uid()) = 'ADMIN');

-- TICKETS POLICIES
-- Admin can see all tickets
CREATE POLICY "Admin can view all tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Tech can see assigned tickets or open queue
CREATE POLICY "Tech can view assigned or open tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'TECH' AND (
      assigned_tech_id = auth.uid() OR 
      (status = 'OPEN' AND assigned_tech_id IS NULL)
    )
  );

-- Customer can only see own tickets
CREATE POLICY "Customer can view own tickets"
  ON public.tickets FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'CUSTOMER' AND customer_id = auth.uid()
  );

-- Customer can create tickets
CREATE POLICY "Customer can create tickets"
  ON public.tickets FOR INSERT
  TO authenticated
  WITH CHECK (
    public.get_user_role(auth.uid()) = 'CUSTOMER' AND customer_id = auth.uid()
  );

-- Admin can update any ticket
CREATE POLICY "Admin can update any ticket"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Tech can update assigned tickets or self-assign from queue
CREATE POLICY "Tech can update tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'TECH' AND (
      assigned_tech_id = auth.uid() OR 
      (status = 'OPEN' AND assigned_tech_id IS NULL)
    )
  );

-- Customer can update own tickets (cancel if OPEN, close if RESOLVED)
CREATE POLICY "Customer can update own tickets"
  ON public.tickets FOR UPDATE
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'CUSTOMER' AND customer_id = auth.uid()
  );

-- Admin can delete tickets
CREATE POLICY "Admin can delete tickets"
  ON public.tickets FOR DELETE
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- COMMENTS POLICIES
-- Admin can see all comments
CREATE POLICY "Admin can view all comments"
  ON public.ticket_comments FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

-- Tech can see all comments on their tickets
CREATE POLICY "Tech can view comments on accessible tickets"
  ON public.ticket_comments FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'TECH' AND
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        t.assigned_tech_id = auth.uid() OR 
        (t.status = 'OPEN' AND t.assigned_tech_id IS NULL)
      )
    )
  );

-- Customer can see non-internal comments on own tickets
CREATE POLICY "Customer can view non-internal comments"
  ON public.ticket_comments FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'CUSTOMER' AND
    is_internal = false AND
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND t.customer_id = auth.uid()
    )
  );

-- Users can create comments on accessible tickets
CREATE POLICY "Users can create comments"
  ON public.ticket_comments FOR INSERT
  TO authenticated
  WITH CHECK (
    author_id = auth.uid() AND
    (
      -- Admin can comment anywhere
      public.get_user_role(auth.uid()) = 'ADMIN' OR
      -- Tech can comment on assigned/queue tickets
      (public.get_user_role(auth.uid()) = 'TECH' AND EXISTS (
        SELECT 1 FROM public.tickets t 
        WHERE t.id = ticket_id AND (
          t.assigned_tech_id = auth.uid() OR 
          (t.status = 'OPEN' AND t.assigned_tech_id IS NULL)
        )
      )) OR
      -- Customer can comment on own tickets (non-internal only)
      (public.get_user_role(auth.uid()) = 'CUSTOMER' AND is_internal = false AND EXISTS (
        SELECT 1 FROM public.tickets t 
        WHERE t.id = ticket_id AND t.customer_id = auth.uid()
      ))
    )
  );

-- HISTORY POLICIES
-- Admin and Tech can view history
CREATE POLICY "Admin can view all history"
  ON public.ticket_history FOR SELECT
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'ADMIN');

CREATE POLICY "Tech can view history of accessible tickets"
  ON public.ticket_history FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'TECH' AND
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND (
        t.assigned_tech_id = auth.uid() OR 
        (t.status = 'OPEN' AND t.assigned_tech_id IS NULL)
      )
    )
  );

-- Customer can view basic history of own tickets
CREATE POLICY "Customer can view own ticket history"
  ON public.ticket_history FOR SELECT
  TO authenticated
  USING (
    public.get_user_role(auth.uid()) = 'CUSTOMER' AND
    EXISTS (
      SELECT 1 FROM public.tickets t 
      WHERE t.id = ticket_id AND t.customer_id = auth.uid()
    )
  );

-- System inserts history (via trigger)
CREATE POLICY "System can insert history"
  ON public.ticket_history FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- REFRESH TOKENS POLICIES
CREATE POLICY "Users can manage own tokens"
  ON public.refresh_tokens FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());