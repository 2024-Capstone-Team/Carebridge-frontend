import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./index.css";

import PreLoginPage from "./pages/PreLoginPage";

/* Nurse Pages */
import NurseLoginPage from "./pages/nurse/NurseLoginPage";
import NurseMainPage from "./pages/nurse/NurseMainPage";
import NurseSchedulePage from "./pages/nurse/NurseSchedulePage";

/* Patient Pages */
import Redirection from "./pages/patient/Redirection";
import PatientLoginPage from "./pages/patient/PatientLoginPage";
import PatientMainPage from "./pages/patient/PatientMainPage";
import ChoosePatientType from "./pages/patient/ChoosePatientType";
import PatientChatPage from "./pages/patient/PatientChatPage";
import PatientChatCategories from "./pages/patient/PatientChatCategoriesPage";
import CustomRequestPage from "./pages/patient/CustomRequestPage";
import PatientSchedular from "./pages/patient/PatientSchedular";
import ScheduleToday from "./pages/patient/ScheduleToday";
import SignUp from "./pages/patient/SignUp";
import SignUpCheck from "./pages/patient/SignUpCheck";

/* Context */
import { FavoriteRequestsProvider } from "./context/FavoriteRequestsContext";
import { UserProvider } from "./context/UserContext";  

/* Test */
import HospitalInfoPage from './pages/HospitalInfoPage';
import ScheduleTest from "./pages/patient/ScheduleTest";

const App: React.FC = () => {
  return (
    <UserProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PreLoginPage />} /> 

          {/* Nurse Pages */}
          <Route path="/nurse-login" element={<NurseLoginPage />} /> 
          <Route path="/nurse-main" element={<NurseMainPage />} />
          <Route path="/nurse-schedule" element={<NurseSchedulePage />} />

          {/* Patient Pages */}
          <Route path="/api/users/social-login/kakao" element={<Redirection />} />
          <Route path="/patient-login" element={<PatientLoginPage />} />
          <Route path="/patient-main" element={<PatientMainPage />} />
          <Route path="/choose-patient-type" element={<ChoosePatientType />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-up-check" element={<SignUpCheck />} />
          <Route path="/patient-schedular" element={<PatientSchedular />} />
          <Route
            path="/schedule-today"
            element={
              <ScheduleToday
                onClose={function (): void {
                  throw new Error("Function not implemented.");
                }}
                scheduleData={[]}
                selectedTags={[]}
                onTagClick={function (_tag: string): void {
                  throw new Error("Function not implemented.");
                }}
              />
            }
          />
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
          <Route path="/custom-request" element={<CustomRequestPage />} />

          {/* Test */}
          <Route path='/test' element={<HospitalInfoPage />} />
          <Route path='/test-schedule' element={<ScheduleTest />} />
          
        </Routes>
      </Router>
    </UserProvider>
  );
};

export default App;
