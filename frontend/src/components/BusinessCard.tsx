import { MapPin, Phone, ArrowRight, Heart } from "lucide-react";
import type { Business } from "../types/business";
import { useFavorites } from "../contexts/FavoritesContext";

interface BusinessCardProps {
  business: Business;
  onSelect: (id: number) => void;
}

export default function BusinessCard({ business, onSelect }: BusinessCardProps) {
  const { toggleFavorite, isFavorite } = useFavorites();
  const favorited = isFavorite(business.id);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card hover:shadow-elevated transition-all duration-300 overflow-hidden group relative">
      <div className="h-32 bg-gradient-to-br from-primary/20 to-primary/5 relative">
        <div className="absolute -bottom-6 left-6 w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold shadow-lg">
          {business.nome.charAt(0)}
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            toggleFavorite(business.id);
          }}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md transition-all duration-300 ${
            favorited 
              ? 'bg-red-500 text-white shadow-lg scale-110' 
              : 'bg-white/50 text-muted-foreground hover:bg-white hover:text-red-500'
          }`}
        >
          <Heart className={`h-4 w-4 ${favorited ? 'fill-current' : ''}`} />
        </button>
      </div>
      
      <div className="p-6 pt-10 space-y-4">
        <div>
          <h3 className="text-xl font-display font-bold text-foreground group-hover:text-primary transition-colors">
            {business.nome}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 min-h-[40px]">
            {business.descricao || "Sem descrição disponível."}
          </p>
        </div>

        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="truncate">{business.endereco}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Phone className="h-3.5 w-3.5 text-primary" />
            <span>{business.telefone}</span>
          </div>
        </div>

        <button
          onClick={() => onSelect(business.id)}
          className="w-full mt-2 bg-muted/50 hover:bg-primary hover:text-white text-foreground py-3 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 group/btn"
        >
          Ver Serviços e Marcar
          <ArrowRight className="h-4 w-4 transform group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
