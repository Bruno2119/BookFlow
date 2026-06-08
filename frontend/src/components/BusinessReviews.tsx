import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Star, MessageSquare, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { pt } from 'date-fns/locale';

interface Review {
  id: number;
  pontuacao: number;
  comentario: string;
  dataCriacao: string;
  utilizadorNome: string;
}

interface BusinessReviewsProps {
  businessId: number;
}

export default function BusinessReviews({ businessId }: BusinessReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/business/${businessId}`);
      setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [businessId]);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.pontuacao, 0) / reviews.length).toFixed(1)
    : 0;

  if (loading) {
    return (
      <div className="flex justify-center p-8 animate-pulse text-muted-foreground">
        Carregando avaliações...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-4 rounded-2xl">
            <Star className="h-8 w-8 text-primary fill-current" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold">Avaliações</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-3xl font-bold">{averageRating}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star 
                    key={s} 
                    className={`h-4 w-4 ${Number(averageRating) >= s ? 'text-primary fill-current' : 'text-muted'}`} 
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground font-medium">
                ({reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-card/50 border border-border/50 p-6 rounded-2xl hover:bg-card transition-colors"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      {review.utilizadorNome.charAt(0)}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{review.utilizadorNome}</p>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star 
                            key={s} 
                            className={`h-3 w-3 ${review.pontuacao >= s ? 'text-primary fill-current' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium uppercase tracking-widest">
                    <Calendar className="h-3 w-3" />
                    {format(new Date(review.dataCriacao), "d 'de' MMMM", { locale: pt })}
                  </div>
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed italic">
                  "{review.comentario}"
                </p>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground flex flex-col items-center gap-3">
              <MessageSquare className="h-10 w-10 opacity-20" />
              <p className="font-medium italic">Este estabelecimento ainda não tem avaliações. Seja o primeiro!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
