import React from 'react';

const NurseMainPage: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-80">
        <h1 className="text-3xl font-bold text-center mb-6">Nurse Dashboard</h1>
        <p>Welcome to the Nurse Dashboard!</p>
      </div>
    </div>
  );
};

export default NurseMainPage;