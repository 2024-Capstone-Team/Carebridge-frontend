import React, { createContext, useState, ReactNode } from "react";

type FavoriteRequestsContextType = {
  favoriteRequests: string[];
  toggleFavoriteRequest: (request: string) => void;
};

const FavoriteRequestsContext = createContext<FavoriteRequestsContextType | undefined>(undefined);

export const FavoriteRequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load favorite requests from local storage when the component mounts
  const loadFavoriteRequestsFromLocalStorage = () => {
    const savedFavorites = localStorage.getItem('favoriteRequests');
    return savedFavorites ? JSON.parse(savedFavorites) : [];
  };

  const [favoriteRequests, setFavoriteRequests] = useState<string[]>(loadFavoriteRequestsFromLocalStorage);

  const toggleFavoriteRequest = (request: string) => {
    setFavoriteRequests((prev) => {
      const updatedFavorites = prev.includes(request)
        ? prev.filter((item) => item !== request)
        : [...prev, request];

      // Update local storage when the favorite requests list changes
      localStorage.setItem('favoriteRequests', JSON.stringify(updatedFavorites));
      return updatedFavorites;
    });
  };

  return (
    <FavoriteRequestsContext.Provider value={{ favoriteRequests, toggleFavoriteRequest }}>
      {children}
    </FavoriteRequestsContext.Provider>
  );
};

export default FavoriteRequestsContext;