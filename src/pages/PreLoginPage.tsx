import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Stethoscope, User } from 'lucide-react';
import logo from '/icons/icon-512x512.png';

const PreLoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 px-4">
      <motion.div
        className="bg-white/90 backdrop-blur-md border border-gray-200 shadow-xl rounded-xl px-8 py-10 max-w-md w-full text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img src={logo} alt="CareBridge 로고" className="w-20 h-20 mx-auto mb-4 rounded-full shadow-sm" />
        <h1 className="text-3xl font-semibold text-gray-900 mb-3">Welcome to CareBridge</h1>
        <p className="text-sm text-gray-600 mb-6">Please choose your role to sign in</p>
        <div className="flex flex-col space-y-4">
          <Link to="/nurse-login">
            <button className="w-full py-3 px-4 bg-cyan-500 text-white font-medium rounded-md flex items-center justify-center gap-2 transition hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-400">
              <Stethoscope className="w-5 h-5" />
              간호사 로그인
            </button>
          </Link>
          <Link to="/patient-login">
            <button className="w-full py-3 px-4 bg-violet-500 text-white font-medium rounded-md flex items-center justify-center gap-2 transition hover:bg-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-400">
              <User className="w-5 h-5" />
              환자 로그인
            </button>
          </Link>
        </div>
        <p className="text-xs text-gray-400 mt-6">© 2025 CareBridge. All rights reserved.</p>
      </motion.div>
    </div>
  );
};

export default PreLoginPage;