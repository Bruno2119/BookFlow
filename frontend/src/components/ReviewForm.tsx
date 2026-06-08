import { useState } from 'react';
import api from '../lib/api';
import { Star, Send, X } from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface ReviewFormProps {
  businessId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ReviewForm({ businessId, onSuccess, onCancel }: ReviewFormProps) {
  const [pontuacao, setPontuacao] = useState(5);
  const [comentario, setComentario] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comentario.trim().length < 5) {
      toast.error('O comentário deve ter pelo menos 5 caracteres.');
      return;
    }

    setIsSubmitting(true);
    
    // Optimistic: We'll assume it works and trigger the success UI quickly
    try {
      await api.post('/reviews', {
        negocioId: businessId,
        pontuacao,
        comentario
      });
      
      toast.success('Avaliação submetida! Obrigado pelo seu feedback.');
      onSuccess();
    } catch (error) {
      console.error('Error submitting review', error);
      toast.error('Erro ao submeter avaliação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-card border border-primary/20 p-8 rounded-3xl shadow-elevated relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50"></div>
      
      <button 
        onClick={onCancel}
        className="absolute top-4 right-4 p-2 hover:bg-muted rounded-full transition-colors"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>

      <div className="text-center mb-8">
        <h3 className="text-2xl font-display font-bold text-foreground">Avaliar Estabelecimento</h3>
        <p className="text-sm text-muted-foreground mt-1 font-medium">Partilhe a sua experiência com a comunidade</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col items-center gap-4 bg-muted/30 p-6 rounded-2xl">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary/70">A sua pontuação</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setPontuacao(star)}
                onMouseEnter={() => setHoveredStar(star)}
                onMouseLeave={() => setHoveredStar(0)}
                className="transition-transform hover:scale-125 duration-200 focus:outline-none"
              >
                <Star 
                  className={`h-10 w-10 transition-colors duration-200 ${
                    (hoveredStar || pontuacao) >= star 
                      ? 'text-primary fill-current' 
                      : 'text-muted-foreground/30'
                  }`} 
                />
              </button>
            ))}
          </div>
          <span className="text-lg font-bold text-primary">
            {pontuacao === 5 ? 'Excelente!' : pontuacao === 4 ? 'Muito Bom' : pontuacao === 3 ? 'Bom' : pontuacao === 2 ? 'Razoável' : 'Fraco'}
          </span>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground ml-1">O seu comentário</label>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="Conte-nos o que achou do serviço..."
            className="w-full bg-muted/50 border-none rounded-2xl p-5 min-h-[120px] focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none shadow-inner"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-bold shadow-lg hover:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
        >
          {isSubmitting ? (
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Submeter Avaliação
              <Send className="h-5 w-5" />
            </>
          )}
        </button>
      </form>
    </motion.div>
  );
}
