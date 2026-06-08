import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'sonner';
import { User, Mail, Lock, Save, ShieldCheck, Briefcase, Star, BadgeCheck, ShieldAlert } from 'lucide-react';

export default function ProfilePage() {
  const { user, login, token } = useAuth();
  
  const userTypeStr = user?.tipo?.toString().toUpperCase();
  const isAdmin = userTypeStr === 'ADMIN' || user?.tipo === 1;
  const isDono = userTypeStr === 'DONO' || user?.tipo === 4;
  const isProfessional = userTypeStr === 'PROFISSIONAL' || user?.tipo === 2;

  const [nome, setNome] = useState(user?.nome || '');
  const [email, setEmail] = useState(user?.email || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [especialidades, setEspecialidades] = useState(user?.especialidades || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setPasswordConfirm] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (password && password !== confirmPassword) {
      toast.error('As senhas não coincidem.');
      return;
    }

    setIsSaving(true);
    try {
      await api.put(`/auth/profile/${user.id}`, {
        nome,
        email,
        bio,
        especialidades,
        password: password || null
      });

      // Atualizar o utilizador no contexto e no localStorage
      const updatedUser = { ...user, nome, email, bio, especialidades };
      if (token) {
        login(token, updatedUser);
      }

      toast.success('Perfil atualizado com sucesso!');
      setPassword('');
      setPasswordConfirm('');
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast.error(error.response?.data?.message || 'Erro ao atualizar perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return { label: 'Administrador Global', icon: ShieldAlert, color: 'bg-purple-100 text-purple-700 border-purple-200' };
    if (isDono) return { label: 'Gestor de Negócio', icon: BadgeCheck, color: 'bg-blue-100 text-blue-700 border-blue-200' };
    if (isProfessional) return { label: 'Profissional Parceiro', icon: Briefcase, color: 'bg-orange-100 text-orange-700 border-orange-200' };
    return { label: 'Cliente Booker', icon: User, color: 'bg-green-100 text-green-700 border-green-200' };
  };

  const badge = getRoleBadge();

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
            <User className="h-8 w-8 text-primary" /> O Meu Perfil
          </h2>
          <p className="text-muted-foreground mt-1 font-medium">Gira os teus dados e visibilidade na plataforma.</p>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold ${badge.color}`}>
          <badge.icon className="h-4 w-4" />
          {badge.label}
        </div>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Coluna Esquerda: Dados de Conta */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-card space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-4">
              <ShieldCheck className="h-5 w-5 text-primary" /> Informações de Conta
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-muted/50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Endereço de Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-muted/50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-4">
              <h4 className="text-sm font-bold text-foreground/70 flex items-center gap-2">
                <Lock className="h-4 w-4" /> Segurança da Conta
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nova senha (deixe vazio para manter)"
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  placeholder="Confirmar nova senha"
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          {isProfessional && (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-card space-y-6">
              <h3 className="text-lg font-bold flex items-center gap-2 border-b border-border pb-4">
                <Briefcase className="h-5 w-5 text-primary" /> Informação Profissional
              </h3>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Biografia Curta</label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Conta um pouco sobre a tua experiência..."
                    className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground ml-1">Especialidades</label>
                  <div className="relative">
                    <Star className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      value={especialidades}
                      onChange={(e) => setEspecialidades(e.target.value)}
                      placeholder="Ex: Corte degradê, Barba clássica, Coloração"
                      className="w-full bg-muted/50 border-none rounded-2xl p-4 pl-12 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Coluna Direita: Ajuda e Guardar */}
        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-elevated">
            <h3 className="text-xl font-bold mb-4">Dica de Perfil</h3>
            <p className="opacity-80 text-sm leading-relaxed mb-6 font-medium">
              {isProfessional 
                ? "Um perfil completo aumenta a confiança dos clientes em 40%. Adiciona as tuas especialidades para te destacares!"
                : "Mantém os teus dados atualizados para receberes todas as notificações e confirmações de marcação corretamente."}
            </p>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-white text-primary py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSaving ? (
                <div className="h-5 w-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}
              Guardar Perfil
            </button>
          </div>

          <div className="bg-muted/30 border border-border rounded-3xl p-6">
            <h4 className="font-bold text-sm mb-2">Privacidade</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              O Booker protege os teus dados. Nunca partilhamos o teu email com terceiros sem a tua autorização explícita.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
