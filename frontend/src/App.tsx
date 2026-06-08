import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import api from './lib/api';
import { toast } from 'sonner';
import BookingFlow from './components/BookingFlow';
import ScheduleManager from './components/ScheduleManager';
import AppSidebar from './components/AppSidebar';
import DashboardPage from './pages/DashboardPage';
import BusinessListPage from './pages/BusinessListPage';
import ProfessionalBookings from './components/ProfessionalBookings';
import ClientBookings from './components/ClientBookings';
import RegisterPage from './pages/RegisterPage';
import AdminBusinessPage from './pages/AdminBusinessPage';
import ManageServicesPage from './pages/ManageServicesPage';
import ManageTeamPage from './pages/ManageTeamPage';
import BusinessDetailsPage from './pages/BusinessDetailsPage';
import ManageBusinessPage from './pages/ManageBusinessPage';
import ProfilePage from './pages/ProfilePage';

function App() {
  const { user, login, logout: authLogout, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedBusinessId, setSelectedBusinessId] = useState<number | null>(null);
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogout = () => {
    authLogout();
    setCurrentPage('dashboard');
    setSelectedBusinessId(null);
  };

  const handleSelectBusiness = (id: number) => {
    setSelectedBusinessId(id);
    setCurrentPage('business-details');
  };

  const handleStartBooking = (id: number) => {
    setSelectedBusinessId(id);
    setCurrentPage('booking');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data.token, response.data.user);
      setCurrentPage('dashboard');
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Erro ao fazer login. Verifique as suas credenciais.');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background font-body">
        {isRegistering ? (
          <RegisterPage 
            onBack={() => setIsRegistering(false)} 
            onSuccess={() => setIsRegistering(false)} 
          />
        ) : (
          <div className="bg-card p-10 rounded-3xl shadow-elevated w-[400px] border border-border animate-in fade-in zoom-in duration-500">
            <div className="flex flex-col items-center text-center mb-10">
              <img src="/bookflow_bigger_text.png" alt="BookFlow" className="h-56 w-auto object-contain mb-2" />
            </div>
            
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Email</label>
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
                <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-muted/50 border-none rounded-2xl p-4 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-4"
              >
                Entrar na Plataforma
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground font-medium">
                Não tem uma conta?{' '}
                <button 
                  onClick={() => setIsRegistering(true)}
                  className="text-primary font-bold hover:underline"
                >
                  Registe-se aqui
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-border space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center">Logins de Desenvolvimento</p>
              
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
                  <span className="block font-bold text-primary">Admin</span>
                  <span className="text-foreground">admin@bookflow.pt</span>
                </div>
                <div className="bg-muted/30 p-2 rounded-xl border border-border/50">
                  <span className="block font-bold text-primary">Cliente</span>
                  <span className="text-foreground">cliente@exemplo.com</span>
                </div>
                
                <div className="bg-blue-50/50 p-2 rounded-xl border border-blue-100 col-span-2">
                  <p className="font-bold text-blue-600 mb-1 border-b border-blue-100 pb-1">Estética</p>
                  <div className="flex justify-between">
                    <span>Dono: <span className="text-foreground">manuel@dono.pt</span></span>
                    <span>Prof: <span className="text-foreground">catia@esteticista.pt</span></span>
                  </div>
                </div>

                <div className="bg-orange-50/50 p-2 rounded-xl border border-orange-100 col-span-2">
                  <p className="font-bold text-orange-600 mb-1 border-b border-orange-100 pb-1">Barbearia</p>
                  <div className="flex justify-between">
                    <span>Dono: <span className="text-foreground">dono@barbearia.pt</span></span>
                    <span className="text-[9px] text-orange-400 font-bold">(Senha: 123456)</span>
                    <span>Prof: <span className="text-foreground">joao@barbearia.pt</span></span>
                  </div>
                </div>
              </div>
              
              <div className="text-[10px] opacity-70 italic text-center">
                Senhas: admin123, prof123, 123456
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  const renderContent = () => {
    const userTypeStr = user?.tipo?.toString().toUpperCase();
    const isAdmin = userTypeStr === 'ADMIN' || user?.tipo === 1;
    const isDono = userTypeStr === 'DONO' || user?.tipo === 4;
    const isCliente = userTypeStr === 'CLIENTE' || user?.tipo === 0 || user?.tipo === 2 || user?.tipo === 3;

    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'admin-businesses':
        return isAdmin ? <AdminBusinessPage /> : <DashboardPage />;
      case 'manage-services':
        return isDono ? <ManageServicesPage /> : <DashboardPage />;
      case 'manage-business':
        return isDono ? <ManageBusinessPage /> : <DashboardPage />;
      case 'manage-team':
        return isDono ? <ManageTeamPage /> : <DashboardPage />;
      case 'businesses':
        return isCliente ? <BusinessListPage onSelectBusiness={handleSelectBusiness} /> : <DashboardPage />;
      case 'business-details':
        return isCliente && selectedBusinessId ? (
          <BusinessDetailsPage 
            businessId={selectedBusinessId} 
            onBack={() => setCurrentPage('businesses')} 
            onStartBooking={handleStartBooking}
          />
        ) : <DashboardPage />;
      case 'availability':
        return !isCliente ? <ScheduleManager /> : <DashboardPage />;
      case 'profile':
        return <ProfilePage />;
      case 'booking':
        return isCliente ? <BookingFlow businessId={selectedBusinessId || undefined} /> : <DashboardPage />;
      case 'bookings':
        return !isCliente ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
             <ProfessionalBookings />
          </div>
        ) : <DashboardPage />;
      case 'my-bookings':
        return isCliente ? (
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
             <ClientBookings />
          </div>
        ) : <DashboardPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background font-body selection:bg-primary/10">
      <AppSidebar 
        currentPage={currentPage} 
        onNavigate={setCurrentPage} 
        onLogout={handleLogout} 
      />
      <main className="flex-1 p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default App;
