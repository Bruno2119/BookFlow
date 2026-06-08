import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Business } from '../types/business';
import BusinessCard from '../components/BusinessCard';
import { Search } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';
import { motion } from 'framer-motion';

interface BusinessListPageProps {
  onSelectBusiness: (id: number) => void;
}

export default function BusinessListPage({ onSelectBusiness }: BusinessListPageProps) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isFavorite } = useFavorites();

  useEffect(() => {
    api.get('/businesses')
      .then(res => setBusinesses(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredBusinesses = businesses
    .filter(b => 
      b.nome.toLowerCase().includes(search.toLowerCase()) ||
      b.endereco.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const aFav = isFavorite(a.id);
      const bFav = isFavorite(b.id);
      if (aFav && !bFav) return -1;
      if (!aFav && bFav) return 1;
      return 0;
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-12 pb-20"
    >
      <div className="relative overflow-hidden bg-primary rounded-[3rem] p-12 shadow-premium">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
          <div className="max-w-xl">
            <motion.h1 
              variants={itemVariants}
              className="text-5xl font-display font-bold text-white tracking-tighter"
            >
              Descubra o seu próximo momento.
            </motion.h1>
            <motion.p 
              variants={itemVariants}
              className="text-white/80 mt-4 text-lg font-medium leading-relaxed"
            >
              Explore os melhores estabelecimentos da rede BookFlow e agende serviços de elite com facilidade.
            </motion.p>
          </div>

          <motion.div 
            variants={itemVariants}
            className="relative w-full lg:w-[400px]"
          >
            <div className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40">
              <Search className="h-full w-full" />
            </div>
            <input
              type="text"
              placeholder="Nome, categoria ou morada..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl py-5 pl-14 pr-6 text-white placeholder:text-white/40 focus:bg-white/20 focus:ring-2 focus:ring-white/20 outline-none transition-all font-bold text-sm shadow-2xl"
            />
          </motion.div>
        </div>
      </div>

      {filteredBusinesses.length > 0 ? (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredBusinesses.map(business => (
            <motion.div key={business.id} variants={itemVariants}>
              <BusinessCard 
                business={business} 
                onSelect={onSelectBusiness} 
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div 
          variants={itemVariants}
          className="text-center py-32 bg-muted/20 rounded-[3rem] border-2 border-dashed border-border/50"
        >
          <div className="h-20 w-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-8 w-8 text-muted-foreground/30" />
          </div>
          <h3 className="text-xl font-display font-bold text-foreground/60">Sem resultados encontrados</h3>
          <p className="text-muted-foreground mt-2 font-medium">Tente ajustar os seus termos de pesquisa.</p>
        </motion.div>
      )}
    </motion.div>
  );
}
