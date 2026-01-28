import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    setLoading(false);

    if (error) {
      toast.error('Email ou senha incorretos!');
      return;
    }

    toast.success('Bem-vindo!');
    navigate('/');
  };

  // Preenche credenciais automaticamente
  const fillCredentials = (userEmail: string, userPassword: string) => {
    setEmail(userEmail);
    setPassword(userPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* Background com gradiente */}
      <div className="fixed inset-0 bg-gradient-to-br from-background via-background to-accent/10" />
      
      <div className="relative w-full max-w-md">
        {/* Card principal */}
        <div className="bg-card border border-border rounded-2xl p-8 glow">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 glow">
              <span className="text-3xl">🎫</span>
            </div>
            <h1 className="text-3xl font-black text-foreground">HelpDesk</h1>
            <p className="text-muted-foreground mt-1">Sistema de Chamados</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 glow"
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Credenciais de teste - clicáveis! */}
          <div className="mt-8 p-4 bg-secondary/50 rounded-xl border border-border">
            <p className="text-sm font-bold text-foreground mb-3">👆 Clique para testar:</p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillCredentials('admin@local.dev', 'Admin123!')}
                className="w-full text-left px-3 py-2 text-sm bg-accent/10 hover:bg-accent/20 rounded-lg transition-colors"
              >
                <span className="font-bold text-accent">Admin:</span>{' '}
                <span className="text-muted-foreground">admin@local.dev</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('tech@local.dev', 'Tech123!')}
                className="w-full text-left px-3 py-2 text-sm bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
              >
                <span className="font-bold text-primary">Técnico:</span>{' '}
                <span className="text-muted-foreground">tech@local.dev</span>
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('customer@local.dev', 'Customer123!')}
                className="w-full text-left px-3 py-2 text-sm bg-success/10 hover:bg-success/20 rounded-lg transition-colors"
              >
                <span className="font-bold text-success">Cliente:</span>{' '}
                <span className="text-muted-foreground">customer@local.dev</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
