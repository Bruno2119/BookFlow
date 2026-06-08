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
        { id: 'admin-businesses', label: 'Estabelecimentos', icon: Store },
        { id: 'profile', label: 'Perfil', icon: User },
      ]
    : isDono
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'manage-business', label: 'Negócio', icon: Store },
        { id: 'manage-services', label: 'Serviços', icon: ClipboardList },
        { id: 'manage-team', label: 'Equipa', icon: User },
        { id: 'profile', label: 'Meu Perfil', icon: User },
      ]
    : isCliente 
    ? [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'businesses', label: 'Explorar', icon: Store },
        { id: 'my-bookings', label: 'Marcações', icon: ClipboardList },
        { id: 'profile', label: 'Perfil', icon: User },
      ]
    : [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'availability', label: 'Agenda', icon: Clock },
        { id: 'bookings', label: 'Marcações', icon: ClipboardList },
        { id: 'profile', label: 'Perfil', icon: User },
      ];

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground flex flex-col h-screen sticky top-0 border-r border-sidebar-border/50 shadow-premium z-50">
      <div className="p-8 pb-10">
        <div className="flex flex-col items-center gap-4 mb-1">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 to-primary/0 rounded-2xl blur-sm group-hover:bg-primary/30 transition-all duration-500"></div>
            <img 
              src="/bookflow_logo_only.png" 
              alt="BookFlow Icon" 
              className="h-16 w-16 object-cover rounded-2xl border border-white/10 shadow-lg relative z-10" 
            />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-display font-bold text-white tracking-tight">BookFlow</h1>
            <p className="text-[9px] uppercase tracking-wider text-sidebar-muted font-bold opacity-80 mt-1 leading-tight">
              Agendamentos que fluem,<br />negócios que crescem.
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive 
                  ? 'bg-primary text-white shadow-lg shadow-primary/20 translate-x-1' 
                  : 'text-sidebar-foreground/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className={`h-5 w-5 transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
              <span className={`font-semibold text-sm tracking-tight ${isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'}`}>
                {item.label}
              </span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_10px_white]"></div>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-6 mt-auto border-t border-sidebar-border/50 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6 p-2 rounded-2xl bg-white/5 border border-white/5 transition-colors hover:bg-white/10 group cursor-pointer" onClick={() => onNavigate('profile')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-sm font-bold text-white shadow-lg group-hover:scale-110 transition-transform">
            {user?.nome.charAt(0)}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{user?.nome}</p>
            <p className="text-[10px] text-sidebar-muted font-bold uppercase tracking-wider truncate opacity-70">
              {userTypeStr || 'Utilizador'}
            </p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400/80 hover:bg-red-500/10 hover:text-red-400 transition-all duration-300 group"
        >
          <div className="p-2 rounded-lg bg-red-500/5 group-hover:bg-red-500/10 transition-colors">
            <LogOut className="h-4 w-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">Sair</span>
        </button>
      </div>
    </aside>
  );
}
