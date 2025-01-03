import React, { createContext, useState, ReactNode } from "react";

type FavoriteRequestsContextType = {
  favoriteRequests: string[];
  toggleFavoriteRequest: (request: string) => void;
};

const FavoriteRequestsContext = createContext<FavoriteRequestsContextType | undefined>(undefined);

export const FavoriteRequestsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favoriteRequests, setFavoriteRequests] = useState<string[]>([]);

  const toggleFavoriteRequest = (request: string) => {
    setFavoriteRequests((prev) =>
      prev.includes(request)
        ? prev.filter((item) => item !== request)
        : [...prev, request]
    );
  };

  return (
    <FavoriteRequestsContext.Provider value={{ favoriteRequests, toggleFavoriteRequest }}>
      {children}
    </FavoriteRequestsContext.Provider>
  );
};

export default FavoriteRequestsContext;
