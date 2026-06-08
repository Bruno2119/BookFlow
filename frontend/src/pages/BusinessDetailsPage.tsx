import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Business } from '../types/business';
import { MapPin, Phone, Clock, Star, ArrowLeft, Calendar, Info, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import BusinessReviews from '../components/BusinessReviews';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

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
        
        // Normalização robusta idêntica às outras páginas
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
  if (!business) return <div>Estabelecimento não encontrado.</div>;

  // Logic to check if open now
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
  const currentTime = now.getHours() * 60 + now.getMinutes();

  // Map DayOfWeek from .NET (Sunday=0) to our check
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
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 font-bold group"
      >
        <ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
        Voltar à Exploração
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative h-64 rounded-3xl overflow-hidden shadow-elevated">
            <img 
              src={business.imagemUrl || 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop'} 
              alt={business.nome}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
              <div>
                <span className="bg-primary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3 inline-block">
                  {business.categoria}
                </span>
                <h1 className="text-4xl font-display font-bold text-white tracking-tight">{business.nome}</h1>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl shadow-card space-y-6">
            <div className="flex flex-wrap gap-6 border-b border-border pb-6">
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full animate-pulse ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className={`font-bold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                  {isOpen ? 'Aberto Agora' : 'Fechado'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <MapPin className="h-4 w-4 text-primary" />
                {business.endereco}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground font-medium">
                <Phone className="h-4 w-4 text-primary" />
                {business.telefone}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-display font-bold flex items-center gap-2">
                <Info className="h-5 w-5 text-primary" /> Sobre o Estabelecimento
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {business.descricao || "Este estabelecimento ainda não forneceu uma descrição detalhada."}
              </p>
            </div>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl shadow-card">
             <BusinessReviews businessId={businessId} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="bg-primary text-primary-foreground p-8 rounded-3xl shadow-elevated sticky top-10">
            <h3 className="text-xl font-display font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-5 w-5" /> Reserva Rápida
            </h3>
            <p className="text-sm opacity-80 mb-8 font-medium">
              Escolha os seus serviços favoritos e garanta o seu lugar hoje mesmo.
            </p>
            
            <button
              onClick={() => onStartBooking(businessId)}
              className="w-full bg-white text-primary py-4 rounded-2xl font-bold shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              Fazer Marcação Agora
              <CheckCircle2 className="h-5 w-5" />
            </button>
          </div>

          <div className="bg-card border border-border p-8 rounded-3xl shadow-card">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" /> Horário Semanal
            </h3>
            <div className="space-y-3">
              {daysLabels.map((label, index) => {
                const daySchedule = business.horarios?.find((h: any) => h.diaSemana === index);
                const isToday = dayOfWeek === index;
                
                return (
                  <div key={label} className={`flex justify-between items-center text-sm ${isToday ? 'bg-primary/5 p-2 -mx-2 rounded-lg' : ''}`}>
                    <span className={`font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{label}</span>
                    <span className="font-bold">
                      {daySchedule?.estaAberto 
                        ? `${daySchedule.horaAbertura.substring(0,5)} - ${daySchedule.horaFecho.substring(0,5)}` 
                        : <span className="text-red-400">Fechado</span>}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
