import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './index.css'

import PreLoginPage from "./pages/PreLoginPage";

/* Nurse Pages */
import NurseLoginPage from "./pages/nurse/NurseLoginPage";
import NurseMainPage from "./pages/nurse/NurseMainPage";
import NurseSchedulePage from "./pages/nurse/NurseSchedulePage";

/* Patient Pages */
import PatientLoginPage from "./pages/patient/PatientLoginPage";
import PatientMainPage from "./pages/patient/PatientMainPage";
import ChoosePatientType from "./pages/patient/ChoosePatientType";
import PatientChatPage from "./pages/patient/PatientChatPage";
import PatientChatCategories from "./pages/patient/PatientChatCategoriesPage";
import CustomRequestPage from "./pages/patient/CustomRequestPage";

/* Context */
import { FavoriteRequestsProvider } from "./context/FavoriteRequestsContext";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PreLoginPage />} /> 
        <Route path="/nurse-main" element={<NurseMainPage />} />
        <Route path="/nurse-schedule" element={<NurseSchedulePage />} />
        <Route path="/patient-login" element={<PatientLoginPage />} />
        <Route path="/patient-main" element={<PatientMainPage />} />
        <Route path="/choose-patient-type" element={<ChoosePatientType />} />
        <Route
          path="/patient-chat"
          element={
            <FavoriteRequestsProvider>
              <PatientChatPage />
            </FavoriteRequestsProvider>
          }
        />
        <Route
          path="/patient-chat-categories"
          element={
            <FavoriteRequestsProvider>
              <PatientChatCategories />
            </FavoriteRequestsProvider>
          }
        />
        <Route path="/custom-request" element={<CustomRequestPage />}/>
      </Routes>
    </Router>
  );
};

export default App;
