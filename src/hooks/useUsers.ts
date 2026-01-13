import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile, UserRole } from '@/types/database';

export function useUsers(roleFilter?: UserRole) {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter) {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setUsers(data as Profile[]);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  return { users, loading, error, refetch: fetchUsers };
}

export function useTechs() {
  return useUsers('TECH');
}