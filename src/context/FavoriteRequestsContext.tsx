import React, { createContext, useState, ReactNode } from "react";
const BASE_FAVORITES = ["환자복 교체", "물 주세요", "몸이 너무 아파요"];

type FavoriteRequestsContextType = {
  favoriteRequests: string[];
  toggleFavoriteRequest: (request: string) => void;
};

const FavoriteRequestsContext = createContext<FavoriteRequestsContextType | undefined>(undefined);

export const FavoriteRequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load favorite requests from local storage, fallback to base favorites only on first load
  const loadFavoriteRequestsFromLocalStorage = () => {
    const savedFavorites = localStorage.getItem('favoriteRequests');
    return savedFavorites ? JSON.parse(savedFavorites) : BASE_FAVORITES;
  };

  const [favoriteRequests, setFavoriteRequests] = useState<string[]>(loadFavoriteRequestsFromLocalStorage);

  const toggleFavoriteRequest = (request: string) => {
    setFavoriteRequests((prev) => {
      const updatedFavorites = prev.includes(request)
        ? prev.filter((item) => item !== request)
        : [...prev, request];
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