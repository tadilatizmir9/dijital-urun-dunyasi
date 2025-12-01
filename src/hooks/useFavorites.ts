import { useState, useEffect } from 'react';

const FAVORITES_KEY = 'dijitalstok_favorites';

// Get favorites from localStorage
const getFavorites = (): string[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Save favorites to localStorage
const saveFavorites = (favorites: string[]) => {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    // Dispatch custom event for other components to listen
    window.dispatchEvent(new Event('favoritesUpdated'));
  } catch (error) {
    console.error('Failed to save favorites:', error);
  }
};

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>(getFavorites());

  useEffect(() => {
    // Listen for changes from other tabs/components
    const handleStorageChange = () => {
      setFavorites(getFavorites());
    };

    const handleFavoritesUpdate = () => {
      setFavorites(getFavorites());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('favoritesUpdated', handleFavoritesUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('favoritesUpdated', handleFavoritesUpdate);
    };
  }, []);

  const toggleFavorite = (productId: string) => {
    const currentFavorites = getFavorites();
    const newFavorites = currentFavorites.includes(productId)
      ? currentFavorites.filter(id => id !== productId)
      : [...currentFavorites, productId];
    
    saveFavorites(newFavorites);
    setFavorites(newFavorites);
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const getFavoriteCount = (): number => {
    return favorites.length;
  };

  return {
    favorites,
    toggleFavorite,
    isFavorite,
    getFavoriteCount,
  };
};
