import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  userId: string | null;
  nurseId: string | null;
  isPatient: boolean;
  setUserId: (id: string) => void;
  setNurseId: (id: string) => void;
  setIsPatient: (isPatient: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [nurseId, setNurseId] = useState<string | null>(null);
  const [isPatient, setIsPatient] = useState<boolean>(true);

  return (
    <UserContext.Provider value={{ userId, nurseId, isPatient, setUserId, setNurseId, setIsPatient }}>
      {children}
    </UserContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};