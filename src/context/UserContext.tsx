// /context/UserContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  nurseId: string | null;
  patientId: String | null;
  isPatient: boolean; //true, false
  setNurseId: (id: string | null) => void;
  setPatientId: (id: string | null) => void;
  setIsPatient: (isPatient: boolean) => void; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [nurseId, setNurseId] = useState<string | null>(null);
  const [patientId, setPatientId] = useState<string | null>(() => {
    return localStorage.getItem("patientId");
  });
  const [isPatient, setIsPatient] = useState<boolean>(false);

  return (
    <UserContext.Provider value={{nurseId, patientId, isPatient, setNurseId, setPatientId, setIsPatient }}>
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