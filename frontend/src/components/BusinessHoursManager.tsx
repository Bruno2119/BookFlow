import { Clock, Check, X } from 'lucide-react';
import { toast } from 'sonner';

interface Horario {
  diaSemana: number;
  horaAbertura: string;
  horaFecho: string;
  estaAberto: boolean;
}

interface BusinessHoursManagerProps {
  horarios: Horario[];
  onChange: (updatedHorarios: Horario[]) => void;
}

const DAYS = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

export default function BusinessHoursManager({ horarios, onChange }: BusinessHoursManagerProps) {
  
  // Garantir que temos sempre 7 dias, mesmo que a DB falhe
  const safeHorarios = Array.from({ length: 7 }).map((_, i) => {
    const existing = horarios.find(h => h.diaSemana === i);
    return existing || {
      diaSemana: i,
      horaAbertura: "09:00:00",
      horaFecho: "18:00:00",
      estaAberto: false
    };
  }).sort((a, b) => a.diaSemana - b.diaSemana);

  const updateDay = (index: number, patch: Partial<Horario>) => {
    const newHorarios = safeHorarios.map(h => 
      h.diaSemana === index ? { ...h, ...patch } : h
    );
    onChange(newHorarios);
  };

  const applyToAll = () => {
    const monday = safeHorarios.find(h => h.diaSemana === 1);
    if (!monday) return;
    
    const newHorarios = safeHorarios.map(h => 
      h.diaSemana !== 0 && h.diaSemana !== 6
        ? { ...h, horaAbertura: monday.horaAbertura, horaFecho: monday.horaFecho, estaAberto: true }
        : h
    );
    onChange(newHorarios);
    toast.info('Horário de Segunda-feira aplicado a todos os dias úteis.');
  };

  return (
    <div className="bg-card border border-border rounded-3xl p-8 shadow-card">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Horário de Funcionamento
          </h3>
          <p className="text-sm text-muted-foreground mt-1">Defina quando o seu estabelecimento está aberto ao público.</p>
        </div>
        <button 
          onClick={applyToAll}
          className="text-xs font-bold text-primary hover:underline bg-primary/5 px-3 py-1.5 rounded-full"
        >
          Copiar 2ª para todos os dias úteis
        </button>
      </div>

      <div className="space-y-4">
        {safeHorarios.map((h) => (
          <div key={h.diaSemana} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${h.estaAberto ? 'bg-primary/5 border-primary/20' : 'bg-muted/30 border-transparent opacity-60'}`}>
            <div className="flex items-center gap-4 w-40">
              <button
                onClick={() => updateDay(h.diaSemana, { estaAberto: !h.estaAberto })}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${h.estaAberto ? 'bg-primary text-white shadow-lg' : 'bg-muted-foreground/20 text-muted-foreground'}`}
              >
                {h.estaAberto ? <Check className="h-5 w-5" /> : <X className="h-5 w-5" />}
              </button>
              <span className={`font-bold text-sm ${h.estaAberto ? 'text-foreground' : 'text-muted-foreground'}`}>
                {DAYS[h.diaSemana]}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <select
                  disabled={!h.estaAberto}
                  value={h.horaAbertura.substring(0, 5)}
                  onChange={(e) => updateDay(h.diaSemana, { horaAbertura: `${e.target.value}:00` })}
                  className="bg-white border border-border rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 appearance-none"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <optgroup key={hour}>
                        <option value={`${hour}:00`}>{hour}:00</option>
                        <option value={`${hour}:30`}>{hour}:30</option>
                      </optgroup>
                    );
                  })}
                </select>
                
                <span className="text-muted-foreground font-bold">às</span>
                
                <select
                  disabled={!h.estaAberto}
                  value={h.horaFecho.substring(0, 5)}
                  onChange={(e) => updateDay(h.diaSemana, { horaFecho: `${e.target.value}:00` })}
                  className="bg-white border border-border rounded-lg p-2 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none disabled:opacity-50 appearance-none"
                >
                  {Array.from({ length: 24 }).map((_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <optgroup key={hour}>
                        <option value={`${hour}:00`}>{hour}:00</option>
                        <option value={`${hour}:30`}>{hour}:30</option>
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <p className="mt-6 text-xs text-center text-muted-foreground italic">
        * As alterações são aplicadas ao clicar no botão "Guardar Alterações" da página.
      </p>
    </div>
  );
}
