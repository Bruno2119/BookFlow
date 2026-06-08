import { useState, useEffect } from 'react';
import api from '../lib/api';
import type { Business } from '../types/business';
import BusinessCard from '../components/BusinessCard';
import { Search, Loader2 } from 'lucide-react';
import { useFavorites } from '../contexts/FavoritesContext';

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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-gradient-to-r from-primary/10 to-transparent p-8 rounded-3xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground tracking-tight">Explorar Estabelecimentos</h1>
          <p className="text-muted-foreground mt-1 font-medium">Encontra os melhores barbeiros e serviços perto de ti.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Procurar por nome ou morada..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border-none rounded-2xl py-3 pl-11 pr-4 shadow-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all text-sm font-medium"
          />
        </div>
      </div>

      {filteredBusinesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBusinesses.map(business => (
            <BusinessCard 
              key={business.id} 
              business={business} 
              onSelect={onSelectBusiness} 
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-3xl border-2 border-dashed border-border">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
          <p className="text-muted-foreground font-medium">Nenhum estabelecimento encontrado com esses critérios.</p>
        </div>
      )}
    </div>
  );
}
