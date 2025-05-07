import React, { createContext, useState, ReactNode } from "react";
const BASE_FAVORITES = ["환자복 교체", "물 주세요", "몸이 너무 아파요"];

type FavoriteRequestsContextType = {
  favoriteRequests: string[];
  toggleFavoriteRequest: (request: string) => void;
};

const FavoriteRequestsContext = createContext<FavoriteRequestsContextType | undefined>(undefined);

export const FavoriteRequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load favorite requests from local storage and merge with base favorites
  const loadFavoriteRequestsFromLocalStorage = () => {
    const savedFavorites = localStorage.getItem('favoriteRequests');
    const parsed = savedFavorites ? JSON.parse(savedFavorites) : [];
    return Array.from(new Set([...BASE_FAVORITES, ...parsed]));
  };

  const [favoriteRequests, setFavoriteRequests] = useState<string[]>(loadFavoriteRequestsFromLocalStorage);

  const toggleFavoriteRequest = (request: string) => {
    setFavoriteRequests((prev) => {
      const withoutRequest = prev.filter((item) => item !== request);
      const updatedFavorites = prev.includes(request) ? withoutRequest : [...prev, request];
      const merged = Array.from(new Set([...BASE_FAVORITES, ...updatedFavorites]));
      localStorage.setItem('favoriteRequests', JSON.stringify(merged));
      return merged;
    });
  };

  return (
    <FavoriteRequestsContext.Provider value={{ favoriteRequests, toggleFavoriteRequest }}>
      {children}
    </FavoriteRequestsContext.Provider>
  );
};

export default FavoriteRequestsContext;