import { useState, useEffect } from 'react';
import api from '../lib/api';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Calendar as CalendarIcon, 
  Power
} from 'lucide-react';
import { 
  format, 
  addDays, 
  startOfWeek, 
  addWeeks, 
  subWeeks, 
  isSameDay
} from 'date-fns';
import { pt } from 'date-fns/locale';

interface Disponibilidade {
  id?: number;
  profissionalId: number;
  diaSemana: number;
  dataEspecifica?: string;
  horaInicio: string;
  horaFim: string;
  ativo: boolean;
}

export default function ScheduleManager() {
  const { user } = useAuth();
  const [availabilities, setAvailabilities] = useState<Disponibilidade[]>([]);
  const [businessHours, setBusinessHours] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  // Função de normalização idêntica à do ManageBusinessPage para consistência total
  const normalizeAvailability = (data: any[]): Disponibilidade[] => {
    return data.map(a => ({
      id: a.id ?? a.Id,
      profissionalId: a.profissionalId ?? a.ProfissionalId,
      diaSemana: a.diaSemana !== undefined ? a.diaSemana : a.DiaSemana,
      dataEspecifica: a.dataEspecifica ?? a.DataEspecifica,
      horaInicio: a.horaInicio ?? a.HoraInicio ?? "09:00:00",
      horaFim: a.horaFim ?? a.HoraFim ?? "18:00:00",
      ativo: a.ativo ?? a.Ativo ?? false
    }));
  };

  const normalizeBusinessHours = (data: any) => {
    if (!data) return [];
    try {
      const json = data.horariosJson ?? data.HorariosJson;
      if (json) return JSON.parse(json);
    } catch (e) {
      console.error("Erro ao parsear HorariosJson no ScheduleManager", e);
    }
    return data.horarios ?? data.Horarios ?? [];
  };

  useEffect(() => {
    const loadAllData = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const [availRes, businessRes] = await Promise.all([
          api.get(`/disponibilidade/professional/${user.id}`),
          user.negocioId ? api.get(`/businesses/${user.negocioId}`) : Promise.resolve({ data: {} })
        ]);
        
        setAvailabilities(normalizeAvailability(availRes.data));
        setBusinessHours(normalizeBusinessHours(businessRes.data));
      } catch (error) {
        console.error('Error loading schedule data', error);
        toast.error('Erro ao sincronizar dados da agenda.');
      } finally {
        setLoading(false);
      }
    };

    loadAllData();
  }, [user]);

  const fetchAvailability = async () => {
    if (!user) return;
    try {
      const response = await api.get(`/disponibilidade/professional/${user.id}`);
      setAvailabilities(normalizeAvailability(response.data));
    } catch (error) {
      toast.error('Erro ao atualizar horários.');
    }
  };

  const nextWeek = () => setCurrentWeekStart(addWeeks(currentWeekStart, 1));
  const prevWeek = () => setCurrentWeekStart(subWeeks(currentWeekStart, 1));
  const goToToday = () => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));

  const handleUpdate = async (dayDate: Date, field: string, value: any) => {
    if (!user) return;
    
    const dateStr = format(dayDate, 'yyyy-MM-dd');
    const dayOfWeek = dayDate.getDay();
    
    const specific = availabilities.find(a => a.dataEspecifica && a.dataEspecifica.startsWith(dateStr));
    const general = availabilities.find(a => !a.dataEspecifica && Number(a.diaSemana) === dayOfWeek);
    const existing = specific || general;
    
    let formattedValue = value;
    if (field === 'horaInicio' || field === 'horaFim') {
        formattedValue = value.length === 5 ? `${value}:00` : value;
    }

    const updated: any = {
      id: specific ? specific.id : undefined,
      profissionalId: user.id,
      diaSemana: dayOfWeek,
      dataEspecifica: dateStr,
      horaInicio: field === 'horaInicio' ? formattedValue : (existing?.horaInicio || '09:00:00'),
      horaFim: field === 'horaFim' ? formattedValue : (existing?.horaFim || '18:00:00'),
      ativo: field === 'ativo' ? value : (existing?.ativo ?? true)
    };

    const previousState = [...availabilities];
    const newState = [...availabilities];
    const idx = newState.findIndex(a => a.dataEspecifica && a.dataEspecifica.startsWith(dateStr));
    
    if (idx > -1) {
      newState[idx] = { ...newState[idx], ...updated };
    } else {
      newState.push(updated);
    }
    setAvailabilities(newState);

    try {
      await api.post('/disponibilidade', updated);
      toast.success(`Horário atualizado!`);
      fetchAvailability();
    } catch (error: any) {
      toast.error('Erro ao guardar alteração.');
      setAvailabilities(previousState);
    }
  };

  if (loading) return <div className="p-12 text-center animate-pulse text-muted-foreground">A carregar motor de agenda...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold flex items-center gap-2 text-foreground">
            <Clock className="text-primary h-6 w-6" />
            Gestão de Disponibilidade
          </h2>
          <p className="text-muted-foreground text-sm font-medium">
            Defina os seus horários de atendimento para semanas específicas.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={goToToday} className="px-4 py-2 text-xs font-bold bg-muted hover:bg-muted/80 rounded-xl transition-colors">Semana Atual</button>
          <div className="flex bg-muted rounded-xl p-1">
            <button onClick={prevWeek} className="p-2 hover:bg-background rounded-lg transition-all shadow-sm"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={nextWeek} className="p-2 hover:bg-background rounded-lg transition-all shadow-sm"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {weekDays.map((dayDate) => {
          const dateStr = format(dayDate, 'yyyy-MM-dd');
          const dayOfWeek = dayDate.getDay();
          const isToday = isSameDay(dayDate, new Date());
          const isPast = dayDate < new Date() && !isToday;
          
          const specific = availabilities.find(a => a.dataEspecifica && a.dataEspecifica.startsWith(dateStr));
          const general = availabilities.find(a => !a.dataEspecifica && Number(a.diaSemana) === dayOfWeek);
          const avail = specific || general;
          
          const bHour = businessHours.find(bh => (bh.diaSemana ?? bh.DiaSemana) === dayOfWeek);
          const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
          
          const isActive = avail 
            ? avail.ativo 
            : (bHour ? (bHour.estaAberto ?? bHour.EstaAberto) : isWeekday);

          const start = avail?.horaInicio?.substring(0, 5) || 
                       bHour?.horaAbertura?.substring(0, 5) || 
                       bHour?.HoraAbertura?.substring(0, 5) || '09:00';

          const end = avail?.horaFim?.substring(0, 5) || 
                     bHour?.horaFecho?.substring(0, 5) || 
                     bHour?.HoraFecho?.substring(0, 5) || '18:00';

          return (
            <div key={dateStr} className={`flex flex-col rounded-2xl border transition-all ${
                isPast ? 'bg-muted/20 border-border grayscale opacity-50' :
                isActive ? 'bg-white border-primary/20 shadow-sm' : 'bg-muted/30 border-border opacity-70'
            }`}>
              <div className={`p-4 text-center border-b ${
                  isPast ? 'bg-gray-200 text-gray-500' :
                  isToday ? 'bg-primary text-primary-foreground' : 'bg-muted/50 text-foreground'
                } rounded-t-2xl`}>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{format(dayDate, 'EEE', { locale: pt })}</p>
                <p className="text-xl font-bold">{format(dayDate, 'dd')}</p>
                <p className="text-[9px] font-medium opacity-60 uppercase">{format(dayDate, 'MMM', { locale: pt })}</p>
              </div>

              <div className={`p-4 space-y-4 ${isPast ? 'pointer-events-none' : ''}`}>
                <div className="flex justify-between items-center">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Estado</span>
                   <button
                    onClick={() => handleUpdate(dayDate, 'ativo', !isActive)}
                    className={`w-10 h-5 rounded-full transition-colors relative ${isActive ? 'bg-green-500' : 'bg-gray-400'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${isActive ? 'translate-x-5' : ''}`} />
                  </button>
                </div>

                <div className={`space-y-3 ${!isActive && 'opacity-30 pointer-events-none'}`}>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Início
                    </label>
                    <input 
                      type="time" 
                      value={start}
                      onChange={(e) => handleUpdate(dayDate, 'horaInicio', e.target.value)}
                      className="w-full p-2 bg-muted/50 border border-transparent rounded-lg text-xs font-bold focus:bg-white focus:border-primary/30 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" /> Fim
                    </label>
                    <input 
                      type="time" 
                      value={end}
                      onChange={(e) => handleUpdate(dayDate, 'horaFim', e.target.value)}
                      className="w-full p-2 bg-muted/50 border border-transparent rounded-lg text-xs font-bold focus:bg-white focus:border-primary/30 outline-none transition-all"
                    />
                  </div>
                </div>

                {!isActive && (
                  <div className="py-8 text-center">
                    <Power className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                    <p className="text-[10px] font-bold text-muted-foreground uppercase">Encerrado</p>
                  </div>
                )}
                
                {specific && (
                  <div className="pt-2 border-t border-border mt-2">
                    <span className="text-[8px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full uppercase">Alteração Pontual</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex items-start gap-4">
        <div className="p-3 bg-primary/10 rounded-xl text-primary">
          <CalendarIcon className="h-6 w-6" />
        </div>
        <div>
          <h4 className="font-bold text-foreground">Como funciona a agenda?</h4>
          <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
            As alterações feitas no calendário são salvas como **exceções para o dia selecionado**. 
            Isto permite-lhe tirar férias, mudar horários de uma semana específica ou fechar um dia feriado sem alterar o seu horário padrão (definido pelo dono do negócio).
          </p>
        </div>
      </div>
    </div>
  );
}
