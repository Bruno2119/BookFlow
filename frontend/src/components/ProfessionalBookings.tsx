import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  X,
  Mail,
  Euro,
  Store,
  RefreshCw
} from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import { 
  format, 
  addDays, 
  startOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameDay,
  parseISO
} from 'date-fns';
import { pt } from 'date-fns/locale';

interface Booking {
  id: number;
  cliente?: { nome: string; email: string };
  servico?: { nome: string; preco: number; duracaoMinutos: number };
  negocio?: { nome: string };
  dataHoraInicio: string;
  estado: any;
}

/**
 * MAPEAMENTO RIGOROSO DE ACORDO COM O ENUM DO BACKEND:
 * Pendente = 1
 * Confirmada = 2
 * Concluida = 3
 * Cancelada = 4
 * Rejeitada = 5
 */
const STATUS_DATA: Record<number, { label: string; color: string; icon: any }> = {
  1: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-600', icon: AlertCircle },
  2: { label: 'Confirmada', color: 'bg-green-100 text-green-600', icon: CheckCircle2 },
  3: { label: 'Concluída', color: 'bg-blue-100 text-blue-600', icon: CheckCircle2 },
  4: { label: 'Cancelada', color: 'bg-red-100 text-red-600', icon: XCircle },
  5: { label: 'Rejeitada', color: 'bg-gray-100 text-gray-600', icon: XCircle },
};

export default function ProfessionalBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [confirmation, setConfirmation] = useState<{ id: number, status: number } | null>(null);

  useEffect(() => {
    if (user?.id) fetchBookings();
  }, [user, currentWeekStart]);

  const fetchBookings = async () => {
    try {
      const response = await api.get(`/bookings/professional/${user?.id}`);
      const data = Array.isArray(response.data) ? response.data : [];
      setBookings(data);
      if (selectedBooking) {
        const updated = data.find(b => b.id === selectedBooking.id);
        if (updated) setSelectedBooking(updated);
      }
    } catch (error) {
      toast.error('Erro ao carregar marcações.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusId = (estado: any): number => {
    if (typeof estado === 'number') return estado;
    const str = String(estado).toUpperCase();
    if (str === 'PENDENTE' || str === '1') return 1;
    if (str === 'CONFIRMADA' || str === '2') return 2;
    if (str === 'CONCLUIDA' || str === '3') return 3;
    if (str === 'CANCELADA' || str === '4') return 4;
    if (str === 'REJEITADA' || str === '5') return 5;
    return 1;
  };

  const updateStatus = async () => {
    if (!confirmation) return;
    try {
      await api.patch(`/bookings/${confirmation.id}/status`, confirmation.status, {
        headers: { 'Content-Type': 'application/json' }
      });
      toast.success('Estado atualizado!');
      setConfirmation(null);
      await fetchBookings();
    } catch (error) {
      toast.error('Erro ao atualizar estado.');
    }
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  if (loading) return <div className="p-12 text-center animate-pulse">Carregando calendário...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      {/* HEADER */}
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-foreground">
            <CalendarIcon className="text-primary h-6 w-6" />
            Agenda Semanal
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            {format(currentWeekStart, "dd 'de' MMMM", { locale: pt })} - {format(addDays(currentWeekStart, 6), "dd 'de' MMMM 'de' yyyy", { locale: pt })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchBookings} className="p-2 hover:bg-muted rounded-xl transition-colors"><RefreshCw className="h-4 w-4" /></button>
          <button onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))} className="px-4 py-2 text-xs font-bold bg-muted hover:bg-muted/80 rounded-xl transition-colors">Hoje</button>
          <div className="flex bg-muted rounded-xl p-1">
            <button onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))} className="p-2 hover:bg-background rounded-lg transition-all shadow-sm"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))} className="p-2 hover:bg-background rounded-lg transition-all shadow-sm"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((day) => {
          const dayBookings = bookings.filter(b => isSameDay(parseISO(b.dataHoraInicio), day));
          const isToday = isSameDay(day, new Date());

          return (
            <div key={day.toString()} className={`flex flex-col min-h-[450px] rounded-2xl border transition-all ${isToday ? 'bg-primary/5 border-primary/30' : 'bg-card border-border'}`}>
              <div className={`p-3 text-center border-b ${isToday ? 'bg-primary text-white' : 'bg-muted/30 border-border'}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{format(day, 'EEE', { locale: pt })}</p>
                <p className="text-xl font-bold">{format(day, 'dd')}</p>
              </div>

              <div className="flex-1 p-2 space-y-3 overflow-y-auto max-h-[600px]">
                {dayBookings.length === 0 ? (
                  <p className="text-[10px] text-center text-muted-foreground mt-10 italic">Sem marcações</p>
                ) : (
                  dayBookings.sort((a,b) => a.dataHoraInicio.localeCompare(b.dataHoraInicio)).map((booking) => {
                    const statusId = getStatusId(booking.estado);
                    const statusInfo = STATUS_DATA[statusId] || STATUS_DATA[1];
                    
                    return (
                      <button 
                        key={booking.id} 
                        onClick={() => setSelectedBooking(booking)}
                        className="w-full text-left group relative bg-white border border-border rounded-xl p-3 shadow-sm hover:shadow-md hover:border-primary/50 transition-all active:scale-95"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1 text-[10px] font-bold text-primary">
                            <Clock className="h-3 w-3" />
                            {format(parseISO(booking.dataHoraInicio), 'HH:mm')}
                          </div>
                          <span className={`p-1 rounded-full ${statusInfo.color}`}>
                            <statusInfo.icon className="h-3 w-3" />
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold text-foreground leading-tight mb-1 truncate">{booking.servico?.nome || 'Serviço'}</h4>
                        <div className="space-y-1">
                          <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                            <User className="h-2.5 w-2.5" /> {booking.cliente?.nome?.split(' ')[0] || 'Cliente'}
                          </p>
                          <p className="text-[9px] text-primary/70 font-medium flex items-center gap-1">
                            <Store className="h-2 w-2" /> {booking.negocio?.nome || 'Estabelecimento'}
                          </p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LEGENDA */}
      <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex flex-wrap gap-6 justify-center">
        {Object.entries(STATUS_DATA).map(([id, info]) => (
          <div key={id} className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${info.color}`}>
              <info.icon className="h-3 w-3" />
            </div>
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{info.label}</span>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-card w-full max-w-md rounded-3xl shadow-2xl border border-border overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="relative p-6 bg-primary text-primary-foreground">
               <button onClick={() => setSelectedBooking(null)} className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"><X className="h-5 w-5" /></button>
               <h3 className="text-2xl font-display font-bold">Detalhes da Marcação</h3>
               <p className="opacity-80 text-sm">ID: #{selectedBooking.id}</p>
            </div>

            <div className="p-8 space-y-6">
               <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                     <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Store className="h-6 w-6" /></div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Estabelecimento</p>
                        <p className="font-bold text-foreground">{selectedBooking.negocio?.nome || '—'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                     <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><User className="h-6 w-6" /></div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Cliente</p>
                        <p className="font-bold text-foreground">{selectedBooking.cliente?.nome || '—'}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1"><Mail className="h-3 w-3" /> {selectedBooking.cliente?.email || '—'}</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-2xl border border-border">
                     <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary"><Euro className="h-6 w-6" /></div>
                     <div>
                        <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Serviço</p>
                        <p className="font-bold text-foreground">{selectedBooking.servico?.nome || '—'}</p>
                        <p className="text-xs text-primary font-bold">{selectedBooking.servico?.preco || 0}€ • {selectedBooking.servico?.duracaoMinutos || 0} min</p>
                     </div>
                  </div>
               </div>

               <div className="pt-4 border-t border-border text-center">
                  {(() => {
                    const currentStatusId = getStatusId(selectedBooking.estado);
                    const info = STATUS_DATA[currentStatusId];

                    if (currentStatusId === 3 || currentStatusId === 4) {
                      return (
                        <div className={`py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 ${info.color}`}>
                           {currentStatusId === 3 ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                           Marcação {info.label}
                        </div>
                      );
                    }
                    return (
                      <div className="space-y-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase mb-3">Ações Disponíveis</p>
                        <div className="grid grid-cols-2 gap-3">
                           <button 
                             onClick={() => setConfirmation({ id: selectedBooking.id, status: 4 })} 
                             className="flex items-center justify-center gap-2 py-3 border border-red-200 text-red-600 rounded-xl font-bold hover:bg-red-50 transition-all active:scale-95"
                           >
                             <XCircle className="h-4 w-4" /> Cancelar
                           </button>
                           <button 
                             onClick={() => setConfirmation({ id: selectedBooking.id, status: 3 })} 
                             className="flex items-center justify-center gap-2 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all active:scale-95"
                           >
                             <CheckCircle2 className="h-4 w-4" /> Concluir
                           </button>
                        </div>
                      </div>
                    );
                  })()}
               </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog 
        isOpen={!!confirmation}
        title={confirmation?.status === 3 ? "Concluir Marcação" : "Cancelar Marcação"}
        message={confirmation?.status === 3 
          ? "Tem a certeza que deseja concluir esta marcação? Esta ação finalizará o serviço e registará o valor." 
          : "Tem a certeza que deseja cancelar esta marcação? O horário será libertado imediatamente."}
        variant={confirmation?.status === 3 ? 'primary' : 'danger'}
        onConfirm={updateStatus}
        onCancel={() => setConfirmation(null)}
      />
    </div>
  );
}
