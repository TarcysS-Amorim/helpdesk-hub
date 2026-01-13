import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useUsers } from '@/hooks/useUsers';
import { Profile, UserRole, ROLE_LABELS } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminUsers() {
  const { users, loading, refetch } = useUsers();
  const { signUp } = useAuth();
  const [createOpen, setCreateOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'CUSTOMER' as UserRole,
  });

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    const { error } = await signUp(
      newUser.email,
      newUser.password,
      newUser.name,
      newUser.role
    );

    setCreating(false);

    if (error) {
      toast.error('Erro ao criar usuário: ' + error.message);
      return;
    }

    toast.success('Usuário criado com sucesso!');
    setNewUser({ name: '', email: '', password: '', role: 'CUSTOMER' });
    setCreateOpen(false);
    refetch();
  };

  const handleToggleActive = async (user: Profile) => {
    const { error } = await supabase
      .from('profiles')
      .update({ is_active: !user.is_active })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao atualizar usuário');
      return;
    }

    toast.success('Usuário atualizado');
    refetch();
  };

  const handleRoleChange = async (user: Profile, newRole: UserRole) => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', user.id);

    if (error) {
      toast.error('Erro ao atualizar role');
      return;
    }

    toast.success('Role atualizado');
    refetch();
  };

  const getRoleBadgeClass = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'role-admin';
      case 'TECH':
        return 'role-tech';
      case 'CUSTOMER':
        return 'role-customer';
    }
  };

  return (
    <DashboardLayout title="Gerenciar Usuários">
      <div className="flex justify-end mb-6">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ativo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(value) => handleRoleChange(user, value as UserRole)}
                    >
                      <SelectTrigger className="w-[140px]">
                        <span className={cn('status-badge', getRoleBadgeClass(user.role))}>
                          {ROLE_LABELS[user.role]}
                        </span>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
                        <SelectItem value="TECH">{ROLE_LABELS.TECH}</SelectItem>
                        <SelectItem value="CUSTOMER">{ROLE_LABELS.CUSTOMER}</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? 'default' : 'secondary'}>
                      {user.is_active ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={user.is_active}
                      onCheckedChange={() => handleToggleActive(user)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">{ROLE_LABELS.ADMIN}</SelectItem>
                  <SelectItem value="TECH">{ROLE_LABELS.TECH}</SelectItem>
                  <SelectItem value="CUSTOMER">{ROLE_LABELS.CUSTOMER}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Criando...' : 'Criar Usuário'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}