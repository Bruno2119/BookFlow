import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface FavoritesContextType {
  favorites: number[];
  toggleFavorite: (businessId: number) => void;
  isFavorite: (businessId: number) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<number[]>([]);
  const { user } = useAuth();

  // Load favorites
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        try {
          const response = await api.get('/favorites');
          setFavorites(response.data);
        } catch (error) {
          console.error('Error loading favorites from API', error);
          // Fallback to local storage if API fails
          const saved = localStorage.getItem('bookflow_favorites');
          if (saved) setFavorites(JSON.parse(saved));
        }
      } else {
        // Guest mode: load from localStorage
        const saved = localStorage.getItem('bookflow_favorites');
        if (saved) {
          try {
            setFavorites(JSON.parse(saved));
          } catch (e) {
            console.error('Error parsing favorites', e);
          }
        } else {
          setFavorites([]);
        }
      }
    };

    loadFavorites();
  }, [user]);

  // Save guest favorites to localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem('bookflow_favorites', JSON.stringify(favorites));
    }
  }, [favorites, user]);

  const toggleFavorite = async (businessId: number) => {
    const isCurrentlyFavorite = favorites.includes(businessId);
    
    // Optimistic UI Update
    if (isCurrentlyFavorite) {
      setFavorites(prev => prev.filter(id => id !== businessId));
    } else {
      setFavorites(prev => [...prev, businessId]);
    }

    if (user) {
      try {
        const response = await api.post(`/favorites/${businessId}`);
        // If the server says something different than what we guessed, update it
        // (Though usually toggleFavorite is straightforward)
        const isActuallyFavorited = response.data.favorited;
        
        if (isActuallyFavorited !== !isCurrentlyFavorite) {
          if (isActuallyFavorited) {
            setFavorites(prev => [...new Set([...prev, businessId])]);
          } else {
            setFavorites(prev => prev.filter(id => id !== businessId));
          }
        }
      } catch (error) {
        // Revert on error
        if (isCurrentlyFavorite) {
          setFavorites(prev => [...new Set([...prev, businessId])]);
        } else {
          setFavorites(prev => prev.filter(id => id !== businessId));
        }
        
        console.error('Error toggling favorite on API', error);
        toast.error('Erro ao atualizar favoritos. Tente novamente.');
      }
    } else {
      // Guest mode is already handled by the optimistic update above
      // and the useEffect that saves to localStorage
      toast.info('Favorito guardado localmente. Faça login para sincronizar.');
    }
  };

  const isFavorite = (businessId: number) => favorites.includes(businessId);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
