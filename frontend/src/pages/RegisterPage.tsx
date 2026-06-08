import { useState } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Mail, Lock, User } from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

export default function RegisterPage({ onBack, onSuccess }: RegisterPageProps) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', {
        nome,
        email,
        password,
        tipo: 3 // 3 = CLIENTE (De acordo com o mapeamento do projeto)
      });
      
      toast.success('Conta criada com sucesso! Já pode fazer login.');
      onSuccess();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta. Verifique os dados.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-card p-10 rounded-3xl shadow-elevated w-[450px] border border-border animate-in fade-in zoom-in duration-500">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        Voltar ao Login
      </button>

      <div className="text-center mb-10">
        <div className="bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-primary">
          <UserPlus className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-display font-bold text-primary tracking-tight">Criar Conta</h1>
        <p className="text-muted-foreground mt-2 font-medium">Junte-se à nossa plataforma de agendamentos</p>
      </div>
      
      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
            <User className="h-3 w-3" /> Nome Completo
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            placeholder="Seu nome"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
            <Mail className="h-3 w-3" /> Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            placeholder="exemplo@email.com"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
            <Lock className="h-3 w-3" /> Senha
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            placeholder="••••••••"
            required
            minLength={6}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
            <Lock className="h-3 w-3" /> Confirmar Senha
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'Criando conta...' : 'Registrar'}
        </button>
      </form>
    </div>
  );
}
