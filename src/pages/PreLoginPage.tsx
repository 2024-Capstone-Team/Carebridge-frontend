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
        <img src={logo} alt="CareBridge 로고" className="w-28 h-28 mx-auto mb-4 rounded-full shadow-sm" />
        <h1 className="text-4xl font-bold text-gray-800 mb-2">CareBridge</h1>
        <h2 className="text-xl font-medium text-gray-800 mb-4">간호간병통합병동 채팅 서비스</h2>
        <p className="text-base text-gray-600 mb-6">로그인할 역할을 선택해 주세요</p>
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