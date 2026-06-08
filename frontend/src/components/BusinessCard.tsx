import { motion } from "framer-motion";
import { MapPin, Phone, ArrowRight, Heart, Star } from "lucide-react";
import type { Business } from "../types/business";
import { useFavorites } from "../contexts/FavoritesContext";

interface BusinessCardProps {
  business: any; // Allow for extra fields like imagemUrl
  onSelect: (id: number) => void;
}

export default function BusinessCard({ business, onSelect }: BusinessCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(business.id);

  return (
    <motion.div 
      whileHover={{ y: -8 }}
      className="bg-card rounded-[2rem] border border-border/50 shadow-card hover:shadow-premium transition-all duration-500 overflow-hidden group relative flex flex-col h-full"
    >
      <div className="h-48 relative overflow-hidden">
        <img 
          src={business.imagemUrl || `https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=2070&auto=format&fit=crop`} 
          alt={business.nome}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
        
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
            {business.categoria || "Serviço"}
          </span>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(business.id);
          }}
          className={`absolute top-4 right-4 p-2.5 rounded-full backdrop-blur-md transition-all duration-300 ${
            favorited 
              ? 'bg-red-500 text-white shadow-lg scale-110' 
              : 'bg-black/20 text-white hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
        </button>

        <div className="absolute bottom-4 left-4 flex items-center gap-1.5">
           <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
              <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
              <span className="text-[10px] font-bold text-white">4.9</span>
           </div>
        </div>
      </div>
      
      <div className="p-8 flex flex-col flex-1">
        <div className="mb-6">
          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
            {business.nome}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-2 font-medium leading-relaxed">
            {business.descricao || "Um espaço dedicado ao seu bem-estar e estilo, com profissionais qualificados."}
          </p>
        </div>

        <div className="space-y-2.5 mt-auto pt-6 border-t border-border/50">
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{business.endereco}</span>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground font-bold uppercase tracking-wider">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>{business.telefone}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(business.id)}
          className="w-full mt-8 bg-primary text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 group/btn"
        >
          Explorar Serviços
          <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}
