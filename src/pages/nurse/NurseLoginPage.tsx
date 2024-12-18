// src/pages/NurseLoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const NurseLoginPage: React.FC = () => {
  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (id === '' && password === '') {
      navigate('/nurse-main');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h1 className="text-3xl font-bold text-center mb-6">Nurse Login</h1>
        <form className="space-y-4" onSubmit={handleLogin}>
          <input
            type="id"
            placeholder="Enter your ID"
            value={id}
            onChange={(e) => setID(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button type="submit" className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default NurseLoginPage;