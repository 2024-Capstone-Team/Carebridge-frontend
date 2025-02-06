import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  userId: string | null;
  nurseId: string | null;
  patientId: String | null;
  setUserId: (id: string) => void;
  setNurseId: (id: string) => void;
  setPatientId: (id: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [nurseId, setNurseId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ userId, nurseId, patientId, setUserId, setNurseId, setPatientId }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
};