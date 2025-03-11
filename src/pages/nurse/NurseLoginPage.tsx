// src/pages/NurseLoginPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NurseLoginPage: React.FC = () => {
  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!id.trim()) {
      alert('ID를 입력해주세요.');
      return;
    }

    if (!password.trim()) {
      alert('비밀번호를 입력해주세요.');
      return;
    }

    try {
      // 서버로 로그인 요청
      const response = await axios.post('http://localhost:8080/api/staff/login', {
        userId: id,
        password: password,
      });

      if (response.status === 200) {
        // 로그인 성공 시 페이지 이동
        navigate('/nurse-main');
      }
    } catch (error) {
      // 로그인 실패 시 처리
      console.error('로그인 실패:', error);
      alert('ID 또는 비밀번호가 잘못되었습니다.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div>
        <img src='src/assets/carebridge_logo.png' className='mr-16 w-[400px]'/>
      </div>
      <div className="bg-white p-8 rounded-[20px] shadow-lg w-[400px] h-[600px]">
        <div className='flex justify-center items-center'><img src='src/assets/carebridge_logo.png' className='w-[200px]'/> </div>
        
          <form className="space-y-4 justify-center items-center flex flex-col" onSubmit={handleLogin}>
          
          <div className="flex items-center m-1 gap-3 rounded-[10px] w-[95%] h-[40px] border border-black border-solid">
            <label htmlFor="id" className="pl-[10px] font-bold text-[15px] w-[25%] text-left">
              병원 ID
            </label>
            <input 
              className="ml-2 w-[65%] h-[25px] text-[13px]"
              placeholder="병원 ID를 입력하세요."
              value={id}
              onChange={(e) => setID(e.target.value)}
              ></input>
            </div>
            
            <div className="flex items-center m-1 gap-3 rounded-[10px] w-[95%] h-[40px] border border-black border-solid">
              <label htmlFor="password" className="pl-[10px] font-bold text-[15px] w-[25%] text-left">
                비밀번호
              </label>
              <input
                type="password"
                className="ml-2 w-[65%] h-[25px] text-[13px]"
                placeholder="비밀번호를 입력하세요."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              ></input>
            </div>

            <div className='flex items-center justify-end w-full mr-5'>
              <button type="button" className='text-black text-[11px] hover:text-gray-500' onClick={() => navigate('/nurse-find-password')}>비밀번호 찾기</button>
            </div>

            <div className='pt-1'>
              <button type="submit" className="w-[100px] py-3 px-4 bg-primary-50 border border-primary-200 text-[15px] text-black font-bold rounded-[20px] hover:bg-primary-100">
              로그인
              </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default NurseLoginPage;