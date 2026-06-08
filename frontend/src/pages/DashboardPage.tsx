import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Wallet, 
  Users, 
  Store,
  ArrowUpRight,
  Activity
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import ProfessionalBookings from "../components/ProfessionalBookings";
import ClientBookings from "../components/ClientBookings";
import api from "../lib/api";
import { toast } from "sonner";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const userTypeStr = user?.tipo?.toString().toUpperCase();
  const isAdmin = userTypeStr === 'ADMIN' || user?.tipo === 1;
  const isDono = userTypeStr === 'DONO' || user?.tipo === 4;
  const isCliente = userTypeStr === 'CLIENTE' || user?.tipo === 3;
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
        // Lógica simplificada para Profissional/Cliente (pode ser expandida)
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // --- VIEW: ADMIN ---
  if (isAdmin) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">Painel de Administração 🛡️</h1>
          <p className="text-muted-foreground mt-1 text-lg">Visão geral de toda a plataforma Booker.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Utilizadores" value={stats.totalUtilizadores} icon={Users} color="text-blue-500" />
          <StatCard label="Estabelecimentos" value={stats.totalNegocios} icon={Store} color="text-purple-500" />
          <StatCard label="Total Marcações" value={stats.totalMarcacoes} icon={Calendar} color="text-orange-500" />
          <StatCard label="Faturação Global" value={`${stats.faturacaoTotal.toFixed(2)}€`} icon={TrendingUp} color="text-green-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-8 shadow-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" /> Atividade Recente na Rede
            </h3>
            <div className="space-y-4">
              {stats.atividadesRecentes.map((act: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="font-medium text-sm">{act.descricao}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground font-bold">{new Date(act.data).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-primary text-primary-foreground rounded-3xl p-8 shadow-elevated">
            <h3 className="text-xl font-bold mb-4">Estado do Sistema</h3>
            <p className="opacity-80 text-sm leading-relaxed">
              Todos os serviços estão operacionais. O volume de marcações cresceu 15% esta semana em comparação com a anterior.
            </p>
            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                <span>Base de Dados</span>
                <span className="text-green-300">Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: DONO ---
  if (isDono) {
    return (
      <div className="space-y-8 animate-in fade-in duration-700">
        <header>
          <h1 className="text-3xl font-display font-bold text-foreground">Gestão do Negócio 📈</h1>
          <p className="text-muted-foreground mt-1 text-lg">Estatísticas e performance do seu estabelecimento.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard label="Marcações Totais" value={stats.totalMarcacoes} icon={Calendar} color="text-primary" />
          <StatCard label="Hoje" value={stats.marcacoesHoje} icon={Clock} color="text-accent" />
          <StatCard label="Faturação Mensal" value={`${stats.faturacaoMensal.toFixed(2)}€`} icon={TrendingUp} color="text-green-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" /> Top Serviços
            </h3>
            <div className="space-y-4">
              {stats.topServicos.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <span className="font-bold text-sm">{s.nome}</span>
                  <div className="text-right">
                    <p className="text-xs font-bold text-primary">{s.quantidade} marcações</p>
                    <p className="text-[10px] text-muted-foreground">{s.total.toFixed(2)}€ gerados</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Performance da Equipa
            </h3>
            <div className="space-y-4">
              {stats.performanceEquipa.map((e: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl">
                  <span className="font-bold text-sm">{e.nome}</span>
                  <div className="flex items-center gap-4">
                     <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-bold">{e.faturacao.toFixed(2)}€</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VIEW: PROFISSIONAL & CLIENTE (Legacy/Standard) ---
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">
          Olá, {user?.nome.split(' ')[0]} 👋
        </h1>
        <p className="text-muted-foreground mt-1">
          {isProfessional 
            ? "Bem-vindo de volta ao seu painel de gestão." 
            : "Bem-vindo ao seu painel de marcações."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isProfessional ? <ProfessionalBookings /> : <ClientBookings />}
        </div>
        <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
           <h3 className="text-xl font-bold mb-4">Lembrete</h3>
           <p className="text-muted-foreground text-sm leading-relaxed">
             Não se esqueça de verificar as suas marcações para amanhã.
           </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: any) {
  return (
    <div className="bg-card p-6 rounded-3xl border border-border shadow-card hover:shadow-elevated transition-all duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-bold text-foreground mt-2">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl bg-muted/50 ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
