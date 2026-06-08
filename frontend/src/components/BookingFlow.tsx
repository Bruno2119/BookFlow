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

import { motion, AnimatePresence } from 'framer-motion';

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
      <div className="text-center py-20 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border">
        <Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
        <p className="text-muted-foreground font-medium">Por favor, seleciona primeiro um estabelecimento.</p>
      </div>
    );
  }

  const stepVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20">
      <header className="relative">
        <div className="absolute -left-4 top-0 w-1 h-12 bg-primary rounded-full" />
        <h2 className="text-4xl font-display font-bold text-foreground tracking-tight">Agendar Serviço</h2>
        <p className="text-muted-foreground mt-2 text-lg font-medium">
          Experiência premium em <span className="text-primary font-bold">{business?.nome}</span>
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
        <div className="lg:col-span-2 space-y-10">
          {/* Step 1: Service */}
          <section className="bg-card rounded-[2.5rem] border border-border/50 p-10 shadow-premium">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">1</div>
              <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                <Scissors className="h-6 w-6 text-primary" /> O que deseja fazer?
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedService(s.id)}
                  className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group ${
                    selectedService === s.id 
                      ? 'border-primary bg-primary/5 shadow-lg' 
                      : 'border-transparent bg-muted/30 hover:bg-muted/50'
                  }`}
                >
                  {selectedService === s.id && (
                    <div className="absolute top-0 right-0 p-4">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <p className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{s.nome}</p>
                  <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mt-2">
                    {s.duracaoMinutos} min • <span className="text-primary">{s.preco} €</span>
                  </p>
                </button>
              ))}
            </div>
          </section>

          {/* Step 2: Professional */}
          <AnimatePresence>
            {selectedService && (
              <motion.section 
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                className="bg-card rounded-[2.5rem] border border-border/50 p-10 shadow-premium"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">2</div>
                  <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                    <UserIcon className="h-6 w-6 text-primary" /> Com quem?
                  </h3>
                </div>
                <div className="flex flex-wrap gap-4">
                  {professionals.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProfessional(p.id)}
                      className={`flex items-center gap-4 pl-4 pr-8 py-3 rounded-2xl border-2 transition-all duration-300 ${
                        selectedProfessional === p.id 
                          ? 'border-primary bg-primary text-white shadow-lg translate-y-[-2px]' 
                          : 'border-transparent bg-muted/30 hover:bg-muted/50 text-foreground'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm ${selectedProfessional === p.id ? 'bg-white text-primary' : 'bg-primary/10 text-primary'}`}>
                        {p.nome.charAt(0)}
                      </div>
                      <span className="font-bold tracking-tight">{p.nome}</span>
                    </button>
                  ))}
                </div>
              </motion.section>
            )}
          </AnimatePresence>

          {/* Step 3: Date & Slots */}
          <AnimatePresence>
            {selectedProfessional && (
              <motion.section 
                variants={stepVariants}
                initial="hidden"
                animate="visible"
                className="bg-card rounded-[2.5rem] border border-border/50 p-10 shadow-premium"
              >
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm">3</div>
                  <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                    <CalendarIcon className="h-6 w-6 text-primary" /> Quando?
                  </h3>
                </div>
                
                <div className="space-y-10">
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/40 group-focus-within:text-primary transition-colors">
                      <CalendarIcon className="h-full w-full" />
                    </div>
                    <input 
                      type="date" 
                      min={format(new Date(), 'yyyy-MM-dd')}
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full bg-muted/30 border-2 border-transparent focus:border-primary/20 rounded-2xl py-5 pl-14 pr-6 font-bold focus:bg-white outline-none transition-all shadow-sm"
                    />
                  </div>

                  {loadingSlots ? (
                    <div className="flex justify-center p-10">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {slots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-4 px-2 text-sm rounded-2xl border-2 transition-all duration-300 font-black tracking-widest ${
                            selectedSlot === slot 
                              ? 'bg-primary border-primary text-white shadow-xl scale-105' 
                              : 'border-transparent bg-muted/30 hover:bg-muted/50 text-foreground/80'
                          }`}
                        >
                          {format(new Date(slot), 'HH:mm')}
                        </button>
                      ))}
                    </div>
                  ) : selectedProfessional && (
                    <div className="text-center py-12 bg-muted/20 rounded-[2rem] border-2 border-dashed border-border/50">
                      <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-4 opacity-20" />
                      <p className="text-sm text-muted-foreground font-bold uppercase tracking-widest">Sem horários disponíveis</p>
                    </div>
                  )}
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>

        {/* Resumo Sidebar */}
        <div className="space-y-10">
          <div className="bg-primary text-white p-10 rounded-[3rem] shadow-premium sticky top-10 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
               <CalendarIcon className="h-40 w-40" />
            </div>
            
            <h3 className="text-2xl font-display font-bold mb-8 relative z-10">Resumo da Reserva</h3>
            
            <div className="w-full space-y-6 mb-10 relative z-10 text-left">
              <SummaryItem label="Serviço" value={services.find(s => s.id === selectedService)?.nome || '—'} />
              <SummaryItem label="Data" value={selectedSlot ? format(new Date(selectedSlot), 'dd MMM yyyy') : '—'} />
              <SummaryItem label="Hora" value={selectedSlot ? format(new Date(selectedSlot), 'HH:mm') : '—'} />
            </div>

            <div className="w-full pt-8 border-t border-white/20 mb-10 relative z-10">
               <div className="flex justify-between items-end">
                 <span className="text-[10px] uppercase font-black tracking-widest opacity-60">Total a pagar</span>
                 <span className="text-4xl font-display font-bold tracking-tighter">
                   {services.find(s => s.id === selectedService)?.preco || 0}€
                 </span>
               </div>
            </div>

            <button
              onClick={handleBooking}
              disabled={!selectedSlot}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 transition-all duration-300 relative z-10 ${
                selectedSlot 
                  ? 'bg-white text-primary shadow-2xl hover:scale-105 active:scale-95' 
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="h-5 w-5" />
              Finalizar Reserva
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-20 border-t border-border/50">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2">
            <BusinessReviews key={reviewRefreshKey} businessId={businessId!} />
          </div>
          <div className="lg:col-span-1">
            {!showReviewForm ? (
              <div className="bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-premium text-center space-y-6">
                <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquarePlus className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-foreground text-2xl">A sua opinião importa</h4>
                  <p className="text-muted-foreground text-sm mt-2 font-medium">Partilhe a sua experiência com a comunidade.</p>
                </div>
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Avaliar Agora
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

function SummaryItem({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-[10px] uppercase font-black tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
      <span className="font-bold tracking-tight text-white">{value}</span>
    </div>
  );
}
