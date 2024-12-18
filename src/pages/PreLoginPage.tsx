import React from 'react';
import { Link } from 'react-router-dom';

const PreLoginPage: React.FC = () => {
  return (
    <div className="centered-container">
      <div className="card-container">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to CareBridge</h1>
        <div className="flex flex-col space-y-4">
          <Link to="/nurse-login">
            <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">
              Nurse Login
            </button>
          </Link>
          <Link to="/patient-login">
            <button className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700">
              Patient Login
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PreLoginPage;