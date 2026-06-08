import { useState } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { ArrowLeft, UserPlus, Mail, Lock, User } from 'lucide-react';

interface RegisterPageProps {
  onBack: () => void;
  onSuccess: () => void;
}

import { motion } from 'framer-motion';

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
        tipo: 3 // 3 = CLIENTE
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
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card p-12 rounded-[2.5rem] shadow-premium w-[500px] border border-border/50 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-10 opacity-5 -rotate-12 translate-x-4 -translate-y-4">
        <UserPlus className="h-32 w-32" />
      </div>

      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-all mb-8 group bg-muted/30 px-4 py-2 rounded-full border border-border/50"
      >
        <ArrowLeft className="h-3 w-3 group-hover:-translate-x-1 transition-transform" />
        Voltar ao Login
      </button>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-display font-bold text-primary tracking-tight">Junte-se ao Flow</h1>
        <p className="text-muted-foreground mt-2 font-medium">Crie a sua conta e comece a agendar hoje.</p>
      </div>
      
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
            <User className="h-3 w-3" /> Nome Completo
          </label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4.5 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
            placeholder="Como gostaria de ser chamado?"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
            <Mail className="h-3 w-3" /> Endereço de Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4.5 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
            placeholder="exemplo@email.com"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
              <Lock className="h-3 w-3" /> Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4.5 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1 flex items-center gap-2">
              <Lock className="h-3 w-3" /> Confirmar
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl p-4.5 focus:bg-white outline-none transition-all font-bold text-sm shadow-sm"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? 'A processar...' : 'Criar Minha Conta'}
        </button>
      </form>
    </motion.div>
  );
}
