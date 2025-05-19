import React, { createContext, useState, useContext } from "react";

type CustomRequestContextType = {
  customRequests: string[];
  addCustomRequest: (req: string) => void;
  removeCustomRequest: (req: string) => void;
};

const CustomRequestsContext = createContext<CustomRequestContextType | undefined>(undefined);

export const CustomRequestsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customRequests, setCustomRequests] = useState<string[]>([]);
  

  const addCustomRequest = (req: string) => {
    if (req.trim()) {
      setCustomRequests((prev) => [...prev, req]);
    }
  };

  const removeCustomRequest = (req: string) => {
    setCustomRequests((prev) => prev.filter((r) => r !== req));
  };

  return (
    <CustomRequestsContext.Provider value={{ customRequests, addCustomRequest, removeCustomRequest }}>
      {children}
    </CustomRequestsContext.Provider>
  );
};

export const useCustomRequests = () => {
  const ctx = useContext(CustomRequestsContext);
  if (!ctx) throw new Error("useCustomRequests must be used within CustomRequestsProvider");
  return ctx;
};