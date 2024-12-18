import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';

import PreLoginPage from './pages/PreLoginPage';

/* Nurse Pages */
import NurseLoginPage from './pages/nurse/NurseLoginPage';
import NurseMainPage from './pages/nurse/NurseMainPage';

/* Patient Pages */
import PatientLoginPage from './pages/patient/PatientLoginPage';
import PatientMainPage from './pages/patient/PatientMainPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PreLoginPage />} />
        <Route path="/nurse-login" element={<NurseLoginPage />} />
        <Route path="/patient-login" element={<PatientLoginPage />} />
        <Route path="/nurse-main" element={<NurseMainPage />} />
        <Route path="/patient-main" element={<PatientMainPage />} />
      </Routes>
    </Router>
  );
};

export default App;