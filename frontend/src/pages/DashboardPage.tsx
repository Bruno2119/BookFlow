import { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  Store,
  Activity,
  Star
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProfessionalBookings from "../components/ProfessionalBookings";
import ClientBookings from "../components/ClientBookings";
import api from "../lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const userTypeStr = user?.tipo?.toString().toUpperCase();
  const isAdmin = userTypeStr === 'ADMIN' || user?.tipo === 1;
  const isDono = userTypeStr === 'DONO' || user?.tipo === 4;
  const isCliente = userTypeStr === 'CLIENTE' || user?.tipo === 3 || user?.tipo === 0 || user?.tipo === 2;
  const isProfessional = userTypeStr === 'PROFISSIONAL' || user?.tipo === 2;

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        const res = await api.get('/dashboard/admin');
        setStats(res.data);
      } else if (isDono && user?.negocioId) {
        const res = await api.get(`/dashboard/business/${user.negocioId}`);
        setStats(res.data);
      } else {
        const endpoint = isProfessional 
          ? `/bookings/professional/${user?.id}` 
          : `/bookings/client/${user?.id}`;
        const res = await api.get(endpoint);
        setStats({ bookings: res.data });
      }
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
      toast.error("Não foi possível carregar os dados estatísticos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  // --- VIEW: ADMIN ---
  if (isAdmin) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        <header className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full" />
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">Painel de Controlo 🛡️</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Visão holística da rede BookFlow.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Utilizadores" value={stats.totalUtilizadores} icon={Users} color="bg-blue-500/10 text-blue-600" delay={0} />
          <StatCard label="Estabelecimentos" value={stats.totalNegocios} icon={Store} color="bg-indigo-500/10 text-indigo-600" delay={0.1} />
          <StatCard label="Marcações" value={stats.totalMarcacoes} icon={Calendar} color="bg-orange-500/10 text-orange-600" delay={0.2} />
          <StatCard label="Faturação Global" value={`${stats.faturacaoTotal.toFixed(2)}€`} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" delay={0.3} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-card border border-border/50 rounded-[2rem] p-10 shadow-premium">
            <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" /> Atividade em Tempo Real
            </h3>
            <div className="space-y-5">
              {stats.atividadesRecentes.map((act: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl border border-transparent hover:border-primary/10 hover:bg-muted/40 transition-all duration-300 group">
                  <div className="flex items-center gap-4">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                    <span className="font-semibold text-sm text-foreground/80 group-hover:text-foreground transition-colors">{act.descricao}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{new Date(act.data).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </motion.div>
          
          <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary to-primary/80 text-white rounded-[2rem] p-10 shadow-premium flex flex-col justify-between">
            <div>
              <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-4">Estado da Rede</h3>
              <p className="text-white/80 text-sm leading-relaxed font-medium">
                A infraestrutura BookFlow está a operar com 99.9% de uptime. O processamento de slots de disponibilidade foi otimizado.
              </p>
            </div>
            <div className="mt-10 pt-8 border-t border-white/10 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Database</span>
                <span className="flex items-center gap-2 text-xs font-bold bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STABLE
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">API Layer</span>
                <span className="flex items-center gap-2 text-xs font-bold bg-emerald-400/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-400/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  ACTIVE
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // --- VIEW: DONO ---
  if (isDono) {
    return (
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-10"
      >
        <header className="relative">
          <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full" />
          <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">O Seu Negócio 📈</h1>
          <p className="text-muted-foreground mt-2 text-lg font-medium">Performance e métricas operacionais.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Marcações Totais" value={stats.totalMarcacoes} icon={Calendar} color="bg-primary/10 text-primary" delay={0} />
          <StatCard label="Agendadas Hoje" value={stats.marcacoesHoje} icon={Clock} color="bg-orange-500/10 text-orange-600" delay={0.1} />
          <StatCard label="Faturação Mensal" value={`${stats.faturacaoMensal.toFixed(2)}€`} icon={TrendingUp} color="bg-emerald-500/10 text-emerald-600" delay={0.2} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div variants={itemVariants} className="bg-card border border-border/50 rounded-[2rem] p-10 shadow-premium">
            <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
              <TrendingUp className="h-6 w-6 text-primary" /> Serviços Populares
            </h3>
            <div className="space-y-5">
              {stats.topServicos.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-all duration-300">
                  <span className="font-bold text-sm text-foreground/80">{s.nome}</span>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary uppercase tracking-wider">{s.quantidade} MARCAÇÕES</p>
                    <p className="text-[10px] text-muted-foreground font-bold">{s.total.toFixed(2)}€ totais</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-card border border-border/50 rounded-[2rem] p-10 shadow-premium">
            <h3 className="text-2xl font-display font-bold mb-8 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" /> Eficiência da Equipa
            </h3>
            <div className="space-y-5">
              {stats.performanceEquipa.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-5 bg-muted/20 rounded-2xl hover:bg-muted/40 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {e.nome.charAt(0)}
                    </div>
                    <span className="font-bold text-sm text-foreground/80 group-hover:text-foreground">{e.nome}</span>
                  </div>
                  <div className="flex items-center gap-4">
                     <span className="text-xs bg-primary/5 text-primary px-4 py-1.5 rounded-full font-black border border-primary/10 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                       {e.faturacao.toFixed(2)}€
                     </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  }

  // --- VIEW: PROFISSIONAL & CLIENTE ---
  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-10"
    >
      <header className="relative">
        <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full" />
        <h1 className="text-4xl font-display font-bold text-foreground tracking-tight">
          Olá, {user?.nome.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">
          {isProfessional 
            ? "O seu dia de trabalho em resumo." 
            : "Gerencie as suas reservas e favoritos."}
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-premium overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
               <Calendar className="h-32 w-32" />
            </div>
            {isProfessional ? <ProfessionalBookings /> : <ClientBookings />}
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-[2rem] p-8 shadow-card">
             <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center mb-6 text-white shadow-lg shadow-indigo-200">
               <Activity className="h-5 w-5" />
             </div>
             <h3 className="text-xl font-display font-bold mb-4 text-indigo-950">Lembrete Diário</h3>
             <p className="text-indigo-900/60 text-sm leading-relaxed font-medium">
               Mantenha o seu perfil atualizado com a sua melhor Bio e Especialidades para atrair mais clientes.
             </p>
          </div>

          <div className="bg-card border border-border/50 rounded-[2rem] p-8 shadow-premium">
             <h3 className="text-lg font-display font-bold mb-6">Próximos Passos</h3>
             <div className="space-y-4">
                <StepItem icon={CheckCircle2} label="Verificar Agenda" completed={true} />
                <StepItem icon={Clock} label="Confirmar Pendentes" completed={false} />
                <StepItem icon={Star} label="Responder Reviews" completed={false} />
             </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function StatCard({ label, value, icon: Icon, color, delay = 0 }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="bg-card p-8 rounded-[2rem] border border-border/50 shadow-card hover:shadow-premium transition-all duration-300 group cursor-default"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-3 opacity-60">{label}</p>
          <p className="text-3xl font-display font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </motion.div>
  );
}

function StepItem({ icon: Icon, label, completed }: any) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors">
      <div className={`p-1.5 rounded-full ${completed ? 'bg-emerald-100 text-emerald-600' : 'bg-muted text-muted-foreground'}`}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      <span className={`text-sm font-semibold ${completed ? 'text-foreground/60 line-through' : 'text-foreground/80'}`}>{label}</span>
    </div>
  );
}
