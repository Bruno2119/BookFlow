import { LayoutDashboard, Calendar, User, LogOut, Clock, ClipboardList, Store } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

interface AppSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function AppSidebar({ currentPage, onNavigate, onLogout }: AppSidebarProps) {
  const { user } = useAuth();

  const userTypeStr = user?.tipo?.toString().toUpperCase();
  const isAdmin = userTypeStr === 'ADMIN' || user?.tipo === 1;
  const isDono = userTypeStr === 'DONO' || user?.tipo === 4;
  const isCliente = userTypeStr === 'CLIENTE' || user?.tipo === 0 || user?.tipo === 2 || user?.tipo === 3;

  const menuItems = isAdmin
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'admin-businesses', label: 'Gestão de Estabelecimentos', icon: Store },
        { id: 'profile', label: 'Perfil', icon: User },
      ]
    : isDono
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'manage-business', label: 'Meu Estabelecimento', icon: Store },
        { id: 'manage-services', label: 'Serviços', icon: ClipboardList },
        { id: 'manage-team', label: 'Equipa', icon: User },
        { id: 'profile', label: 'Perfil', icon: User },
      ]
    : isCliente 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'businesses', label: 'Explorar Estabelecimentos', icon: Store },
        { id: 'my-bookings', label: 'Minhas Marcações', icon: ClipboardList },
        { id: 'profile', label: 'Perfil', icon: User },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'availability', label: 'Gerir Agenda', icon: Clock },
        { id: 'bookings', label: 'Marcações', icon: ClipboardList },
        { id: 'profile', label: 'Perfil', icon: User },
      ];

  return (
    <aside className="w-64 bg-sidebar-background text-sidebar-foreground flex flex-col h-screen sticky top-0 border-r border-sidebar-border shadow-elevated">
      <div className="p-6">
        <h1 className="text-2xl font-display font-bold text-sidebar-primary tracking-tight">Website Booker</h1>
        <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-muted mt-1 opacity-70">SaaS Management</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
                isActive 
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg border-sidebar-primary' 
                  : 'bg-sidebar-accent/50 text-sidebar-foreground/80 border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-foreground'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className="font-medium text-sm">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 mt-auto border-t border-sidebar-border bg-sidebar-accent/30">
        <div className="flex items-center gap-3 px-2 mb-4">
          <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center text-xs font-bold text-sidebar-primary-foreground">
            {user?.nome.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate">{user?.nome}</p>
            <p className="text-[10px] text-sidebar-muted truncate">{user?.tipo}</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors duration-200"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sair da Conta</span>
        </button>
      </div>
    </aside>
  );
}
