import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Business } from '../types/business';
import { MapPin, Phone, Clock, Star, ArrowLeft, Calendar, Info, CheckCircle2, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import BusinessReviews from '../components/BusinessReviews';

interface BusinessDetailsPageProps {
  businessId: number;
  onBack: () => void;
  onStartBooking: (id: number) => void;
}

export default function BusinessDetailsPage({ businessId, onBack, onStartBooking }: BusinessDetailsPageProps) {
  const [business, setBusiness] = useState<Business | any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await api.get(`/businesses/${businessId}`);
        const data = response.data;
        
        let horarios = [];
        try {
          const json = data.horariosJson ?? data.HorariosJson;
          if (json) {
            horarios = JSON.parse(json);
          } else {
            horarios = data.horarios ?? data.Horarios ?? [];
          }
        } catch (e) {
          horarios = data.horarios ?? data.Horarios ?? [];
        }

        const normalized = {
          ...data,
          horarios: horarios.map((h: any) => ({
            diaSemana: h.diaSemana ?? h.DiaSemana,
            horaAbertura: h.horaAbertura ?? h.HoraAbertura ?? "09:00:00",
            horaFecho: h.horaFecho ?? h.HoraFecho ?? "18:00:00",
            estaAberto: h.estaAberto ?? h.EstaAberto ?? false
          }))
        };

        setBusiness(normalized);
      } catch (error) {
        console.error('Error fetching business details', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [businessId]);

  if (loading) return <div className="flex justify-center p-20"><div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  if (!business) return <div className="p-20 text-center font-display text-2xl">Estabelecimento não encontrado.</div>;

  const now = new Date();
  const dayOfWeek = now.getDay();
  const currentTime = now.getHours() * 60 + now.getMinutes();
  const todaySchedule = business.horarios?.find((h: any) => h.diaSemana === dayOfWeek);
  
  let isOpen = false;
  if (todaySchedule && todaySchedule.estaAberto) {
    const [hOpen, mOpen] = todaySchedule.horaAbertura.split(':').map(Number);
    const [hClose, mClose] = todaySchedule.horaFecho.split(':').map(Number);
    const openMinutes = hOpen * 60 + mOpen;
    const closeMinutes = hClose * 60 + mClose;
    isOpen = currentTime >= openMinutes && currentTime < closeMinutes;
  }

  const daysLabels = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="pb-20"
    >
      <button 
        onClick={onBack}
        className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-all mb-10 font-black uppercase tracking-widest text-[10px] group bg-muted/30 px-5 py-2.5 rounded-full border border-border/50"
      >
        <ArrowLeft className="h-3 w-3 transform group-hover:-translate-x-1 transition-transform" />
        Voltar à Exploração
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-12">
          <div className="relative h-[450px] rounded-[3rem] overflow-hidden shadow-premium group">
            <img 
              src={business.imagemUrl || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop'} 
              alt={business.nome}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-12">
              <div className="max-w-xl">
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-primary text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-[0.2em] mb-4 inline-block shadow-lg shadow-primary/20"
                >
                  {business.categoria}
                </motion.span>
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl font-display font-bold text-white tracking-tighter"
                >
                  {business.nome}
                </motion.h1>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-premium space-y-8">
            <div className="flex flex-wrap gap-8 border-b border-border/50 pb-8">
              <div className="flex items-center gap-3">
                <div className={`h-4 w-4 rounded-full ${isOpen ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' : 'bg-red-500 shadow-[0_0_10px_#ef4444]'} animate-pulse`}></div>
                <span className={`font-black uppercase tracking-widest text-xs ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
                  {isOpen ? 'Disponível Agora' : 'Fechado de Momento'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-foreground/70 font-bold text-sm">
                <MapPin className="h-5 w-5 text-primary" />
                {business.endereco}
              </div>
              <div className="flex items-center gap-3 text-foreground/70 font-bold text-sm">
                <Phone className="h-5 w-5 text-primary" />
                {business.telefone}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" /> A Nossa História
              </h3>
              <p className="text-muted-foreground leading-relaxed text-lg font-medium opacity-80">
                {business.descricao || "Este estabelecimento ainda não forneceu uma descrição detalhada sobre a sua missão e valores."}
              </p>
            </div>
          </div>

          {business.funcionarios && business.funcionarios.length > 0 && (
            <div className="bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-premium space-y-10">
              <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                <Users className="h-6 w-6 text-primary" /> Talentos da Casa
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {business.funcionarios.map((func: any) => (
                  <div key={func.id} className="bg-muted/30 border border-border/50 p-8 rounded-[2rem] space-y-6 hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1">
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform">
                        {func.nome.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-xl font-display font-bold text-foreground">{func.nome}</h4>
                        <div className="flex items-center gap-1.5 text-[10px] text-primary font-black uppercase tracking-[0.2em] mt-1">
                          <Award className="h-3 w-3" /> Especialista Elite
                        </div>
                      </div>
                    </div>
                    
                    {func.especialidades && (
                      <div className="flex flex-wrap gap-2">
                        {func.especialidades.split(',').map((esp: string, i: number) => (
                          <span key={i} className="bg-white text-primary text-[10px] px-3 py-1 rounded-full font-black border border-primary/10 shadow-sm uppercase tracking-wider">
                            {esp.trim()}
                          </span>
                        ))}
                      </div>
                    )}

                    {func.bio ? (
                      <p className="text-sm text-muted-foreground italic leading-relaxed font-medium">
                        "{func.bio}"
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground/50 italic font-medium">
                        O profissional ainda não disponibilizou a sua biografia.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-premium">
             <BusinessReviews businessId={businessId} />
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-primary text-white p-10 rounded-[2.5rem] shadow-premium sticky top-10 flex flex-col items-center text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10 -rotate-12 translate-x-4 -translate-y-4">
               <Calendar className="h-40 w-40" />
            </div>
            
            <h3 className="text-2xl font-display font-bold mb-6 flex items-center gap-3 relative z-10">
              <Calendar className="h-6 w-6" /> Reservar Vaga
            </h3>
            <p className="text-sm text-white/80 mb-10 font-bold leading-relaxed relative z-10">
              Garanta o seu momento de cuidado com os nossos melhores especialistas.
            </p>
            
            <button
              onClick={() => onStartBooking(businessId)}
              className="w-full bg-white text-primary py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10"
            >
              Marcar Agora
              <CheckCircle2 className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-card border border-border/50 p-10 rounded-[2.5rem] shadow-premium">
            <h3 className="text-xl font-display font-bold mb-8 flex items-center gap-3">
              <Clock className="h-6 w-6 text-primary" /> Horário Semanal
            </h3>
            <div className="space-y-4">
              {daysLabels.map((label, index) => {
                const daySchedule = business.horarios?.find((h: any) => h.diaSemana === index);
                const isToday = dayOfWeek === index;
                
                return (
                  <div key={label} className={`flex justify-between items-center text-sm ${isToday ? 'bg-primary/5 p-3 -mx-3 rounded-2xl border border-primary/10' : 'opacity-70'}`}>
                    <span className={`font-bold ${isToday ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                    <span className="font-black tabular-nums">
                      {daySchedule?.estaAberto 
                        ? `${daySchedule.horaAbertura.substring(0,5)} — ${daySchedule.horaFecho.substring(0,5)}` 
                        : <span className="text-red-400 text-[10px] uppercase tracking-widest">Fechado</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
