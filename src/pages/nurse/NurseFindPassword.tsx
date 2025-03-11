import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const NurseFindPasswordPage: React.FC = () => {
  const [id, setID] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleBackToLogin  = () => {
    navigate('/nurse-login');
  }

  // 비밀번호 찾기
  const handleFindPassword = async () => {
    try {
      const response = await axios.get('/api/staff/find-password', {params: { Id: id },});
      
      setPassword(response.data);
    } catch (error: any) {
      if (error.response) {
        alert(`비밀번호 찾기 실패: ${error.response.data}`);
      } else {
        alert(`비밀번호 찾기 실패: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white px-8 rounded-[20px] shadow-lg w-[1200px] h-[700px]">
        <div className='flex justify-start items-center'>
          <img src='src/assets/carebridge_logo.png' className='w-[170px] cursor-pointer' alt="Carebridge Logo" onClick={handleBackToLogin} />
        </div>

        <p className='flex justify-center items-center text-[27px] font-bold mb-10'>
          비밀번호 찾기
        </p>

        <form
          className="justify-center items-center flex flex-col"
          onSubmit={(e) => e.preventDefault()} 
        >
          <div className="flex items-center m-1 gap-3 rounded-[10px] w-[50%] h-[40px] border border-black border-solid mt-8">
            <label htmlFor="id" className="pl-5 font-bold text-[15px] w-[25%] text-left">
              병원 ID
            </label>
            <input
              id="id"
              className="ml-2 w-[65%] h-[25px] text-[13px]"
              placeholder="병원 ID를 입력하세요."
              value={id}
              onChange={(e) => {
                setID(e.target.value);
                setPassword('');
              }}
            />
          </div>

          <button className="bg-primary-50 border border-primary-200 shadow-lg text-black text-lg rounded-lg px-2 mt-3 mx-1 w-[50%] h-[40px]"
            onClick={handleFindPassword}>비밀번호 확인
          </button>

          {password && <p className='mt-4 text-red-500'>찾은 비밀번호: {password}</p>}
        </form>

        <p className='flex justify-center items-center text-black text-[13px] mt-20 cursor-pointer hover:text-gray-500'
          onClick={handleBackToLogin}>로그인 하기</p>          
        
      </div>
    </div>
  );
};

export default NurseFindPasswordPage;
