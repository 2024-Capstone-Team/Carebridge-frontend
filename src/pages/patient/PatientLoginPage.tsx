// src/pages/PatientLoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const PatientLoginPage: React.FC = () => {
  const [phone_num, setPhoneNum] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (phone_num === '') {
      navigate('/patient-main');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h1 className="text-3xl font-bold text-center mb-6">Patient Login</h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          
          <input
            type="phone_num"
            placeholder="Enter your phone number"
            value={phone_num}
            onChange={(e) => setPhoneNum(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          
          <button type="submit" className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default PatientLoginPage;