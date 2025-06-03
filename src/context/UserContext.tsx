// /context/UserContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
  hospitalId: string | null;
  nurseId: string | null;
  userId: String | null;
  patientId: String | null;
  isPatient: boolean; //true, false
  setHospitalId: (id: string | null) => void;
  setNurseId: (id: string | null) => void;
  setUserId: (id: string | null) => void;
  setPatientId: (id: string | null) => void;
  setIsPatient: (isPatient: boolean) => void; 
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [hospitalId, setHospitalId] = useState<string | null>(() => localStorage.getItem("hospitalId") || "1");
  const [nurseId, setNurseId] = useState<string | null>(() => localStorage.getItem("nurseId") || "1");
  const [userId, setUserId] = useState<string | null>(() => {
    return localStorage.getItem("userId") || "5";
  });
  const [patientId, setPatientId] = useState<string | null>(() => {
    return localStorage.getItem("patientId") || "5";
  });
  const [isPatient, setIsPatient] = useState<boolean>(false);

  return (
    <UserContext.Provider value={{ hospitalId, nurseId, userId, patientId, isPatient, setHospitalId, setNurseId, setUserId, setPatientId, setIsPatient }}>
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