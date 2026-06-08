import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Business, Service, Booking } from '../types/business';
import type { User } from '../types/auth';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Scissors, User as UserIcon, Calendar as CalendarIcon, Clock, CheckCircle2, Store, Loader2, MessageSquarePlus } from 'lucide-react';
import BusinessReviews from './BusinessReviews';
import ReviewForm from './ReviewForm';

interface BookingFlowProps {
  businessId?: number;
}

export default function BookingFlow({ businessId }: BookingFlowProps) {
  const { user } = useAuth();
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [professionals, setProfessionals] = useState<User[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRefreshKey, setReviewRefreshKey] = useState(0);

  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (businessId) {
      api.get(`/businesses/${businessId}`).then(res => setBusiness(res.data));
      api.get(`/services/business/${businessId}`).then(res => setServices(res.data));
      api.get(`/auth/professionals?negocioId=${businessId}`).then(res => setProfessionals(res.data));
    }
  }, [businessId]);

  useEffect(() => {
    if (selectedProfessional && selectedService && selectedDate) {
      setLoadingSlots(true);
      api.get(`/bookings/slots?professionalId=${selectedProfessional}&serviceId=${selectedService}&date=${selectedDate}`)
        .then(res => setSlots(res.data))
        .finally(() => setLoadingSlots(false));
    }
  }, [selectedProfessional, selectedService, selectedDate]);

  const handleBooking = async () => {
    if (!selectedSlot || !selectedService || !businessId || !selectedProfessional || !user) return;

    const service = services.find(s => s.id === selectedService);
    if (!service) return;

    const startDate = new Date(selectedSlot);
    const endDate = new Date(startDate.getTime() + service.duracaoMinutos * 60000);

    const booking = {
      dataHoraInicio: format(startDate, "yyyy-MM-dd'T'HH:mm:ss"),
      dataHoraFim: format(endDate, "yyyy-MM-dd'T'HH:mm:ss"),
      estado: 1, 
      precoAplicado: Number(service.preco),
      clienteId: Number(user.id),
      profissionalId: Number(selectedProfessional),
      servicoId: Number(selectedService),
      negocioId: Number(businessId)
    };

    try {
      await api.post('/bookings', booking);
      toast.success('Marcação realizada com sucesso!');
      setSelectedSlot(null);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erro ao realizar marcação.';
      toast.error(errorMsg);
    }
  };

  if (!businessId) {
    return (
      <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">Por favor, seleciona primeiro um estabelecimento.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-display font-bold text-foreground tracking-tight">Finalizar Marcação</h2>
          <p className="text-muted-foreground mt-1 font-medium">
            Estás a marcar em: <span className="text-primary font-bold">{business?.nome}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-card rounded-2xl border border-border p-6 shadow-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">1</div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <Scissors className="h-5 w-5" /> Seleciona o Serviço
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    selectedService === s.id 
                      ? 'border-primary bg-primary/5 ring-4 ring-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <p className="font-bold text-foreground">{s.nome}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.duracaoMinutos} min • {s.preco} €</p>
                </button>
              ))}
            </div>
          </section>

          <section className={`bg-card rounded-2xl border border-border p-6 shadow-card transition-opacity ${!selectedService ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">2</div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <UserIcon className="h-5 w-5" /> Escolhe o Profissional
              </h3>
            </div>
            <div className="flex flex-wrap gap-3">
              {professionals.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedProfessional(p.id)}
                  className={`flex items-center gap-3 px-5 py-3 rounded-full border-2 transition-all ${
                    selectedProfessional === p.id 
                      ? 'border-primary bg-primary text-white font-bold' 
                      : 'border-border hover:border-primary/50 text-muted-foreground'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] ${selectedProfessional === p.id ? 'bg-white text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {p.nome.charAt(0)}
                  </div>
                  {p.nome}
                </button>
              ))}
            </div>
          </section>

          <section className={`bg-card rounded-2xl border border-border p-6 shadow-card transition-opacity ${!selectedProfessional ? 'opacity-40 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold">3</div>
              <h3 className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" /> Data e Horário
              </h3>
            </div>
            
            <div className="space-y-6">
              <input 
                type="date" 
                min={format(new Date(), 'yyyy-MM-dd')}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-muted/50 border-none rounded-xl p-4 font-medium focus:ring-2 focus:ring-primary/20 outline-none"
              />

              {loadingSlots ? (
                <div className="flex justify-center p-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
              ) : slots.length > 0 ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 text-sm rounded-xl border-2 transition-all font-bold ${
                        selectedSlot === slot 
                          ? 'bg-primary border-primary text-white shadow-lg scale-105' 
                          : 'border-border hover:border-primary/50 text-foreground'
                      }`}
                    >
                      {format(new Date(slot), 'HH:mm')}
                    </button>
                  ))}
                </div>
              ) : selectedProfessional && (
                <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed">
                  <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-30" />
                  <p className="text-sm text-muted-foreground font-medium">Sem horários disponíveis para este dia.</p>
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-elevated sticky top-24">
            <h3 className="text-xl font-display font-bold mb-6">Resumo</h3>
            <div className="space-y-4 mb-8 text-sm">
              <div className="flex justify-between items-center opacity-80">
                <span>Estabelecimento</span>
                <span className="font-bold">{business?.nome}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Serviço</span>
                <span className="font-bold">{services.find(s => s.id === selectedService)?.nome || '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Data</span>
                <span className="font-bold">{selectedSlot ? format(new Date(selectedSlot), 'dd MMM yyyy') : '—'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Hora</span>
                <span className="font-bold text-xl">{selectedSlot ? format(new Date(selectedSlot), 'HH:mm') : '—'}</span>
              </div>
            </div>

            <div className="pt-6 border-t border-white/20 mb-8">
               <div className="flex justify-between items-end">
                 <span className="text-xs uppercase font-bold opacity-80">Total</span>
                 <span className="text-3xl font-display font-bold">{services.find(s => s.id === selectedService)?.preco || 0} €</span>
               </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                selectedSlot 
                  ? 'bg-white text-primary shadow-xl hover:scale-105 active:scale-95' 
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="h-5 w-5" />
              Confirmar
            </button>
          </div>
        </div>
      </div>

      <div className="pt-12 border-t border-border mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <BusinessReviews key={reviewRefreshKey} businessId={businessId!} />
          </div>
          <div className="lg:col-span-1">
            {!showReviewForm ? (
              <div className="bg-muted/30 p-8 rounded-3xl border border-dashed border-border text-center space-y-4">
                <MessageSquarePlus className="h-10 w-10 text-primary mx-auto opacity-40" />
                <h4 className="font-bold text-foreground text-lg">Gostou?</h4>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-white text-primary border border-primary/20 py-3 rounded-xl font-bold shadow-sm hover:bg-primary hover:text-white transition-all"
                >
                  Escrever Avaliação
                </button>
              </div>
            ) : (
              <ReviewForm 
                businessId={businessId!} 
                onSuccess={() => {
                  setShowReviewForm(false);
                  setReviewRefreshKey(prev => prev + 1);
                }}
                onCancel={() => setShowReviewForm(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
