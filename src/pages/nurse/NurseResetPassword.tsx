import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const  NurseResetPasswordPage: React.FC = () => {
  const [id, setID] = useState('');
  const [oldPassword, setOldPassword] = useState(''); // 현재 비밀번호
  const [newPassword, setNewPassword] = useState(''); // 새 비밀번호
  const [confirmPassword, setConfirmPassword] = useState(''); // 새 비밀번호 확인
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    
    // 비밀번호 일치 검사
    if (newPassword !== confirmPassword) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await axios.put(`/api/staff/reset-password?newPassword=${newPassword}`,
        {
          userId: id,
          password: oldPassword,
        }
      );

      console.log('서버 응답:', response.data);
      alert('비밀번호가 성공적으로 변경되었습니다! 새 비밀번호로 다시 로그인해주세요.');

      navigate('/nurse-login');
    } catch (error: any) {
      if (error.response) {
        alert(`비밀번호 재설정 실패: ${error.response.data}`);
      } else {
        alert(`비밀번호 재설정 실패: ${error.message}`);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white px-8 rounded-[20px] shadow-lg w-[1200px] h-[700px]">
        <div className='flex justify-start items-center'>
            <img src='src/assets/carebridge_logo.png' className='w-[170px] cursor-pointer' onClick={() => navigate('/nurse-main')}/> 
        </div>

        <p className='flex justify-center items-center text-[27px] font-bold mb-10'>비밀번호 재설정</p>

          <form className="space-y-4 justify-center items-center flex flex-col" onSubmit={(e) => e.preventDefault()}>
          
          <div className="flex items-center m-1 gap-3 rounded-[10px] w-[50%] h-[40px] border border-black border-solid mt-8">
            <label htmlFor="id" className="pl-5 font-bold text-[15px] w-[25%] text-left">
              병원 ID
            </label>
            <input
              id="id"
              className="ml-2 w-[65%] h-[25px] text-[13px]"
              placeholder="병원 ID를 입력하세요."
              value={id}
              onChange={(e) => setID(e.target.value)}
            />
          </div>

          <div className="flex items-center m-1 gap-3 rounded-[10px] w-[50%] h-[40px] border border-black border-solid">
            <label htmlFor="password" className="pl-5 font-bold text-[15px] w-[25%] text-left">
              현재 비밀번호
            </label>
            <input
                type="password"
                className="ml-2 w-[65%] h-[25px] text-[13px]"
                placeholder="현재 비밀번호를 입력하세요."
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              ></input>
            </div>

            <div className="flex items-center m-1 gap-3 rounded-[10px] w-[50%] h-[40px] border border-black border-solid">
              <label htmlFor="password" className="pl-5 font-bold text-[15px] w-[25%] text-left">
                비밀번호 재설정
              </label>
              <input
                type="password"
                className="ml-2 w-[65%] h-[25px] text-[13px]"
                placeholder="재설정할 비밀번호를 입력하세요."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              ></input>
            </div>

            <div className="flex items-center m-1 gap-3 rounded-[10px] w-[50%] h-[40px] border border-black border-solid">
              <label htmlFor="password" className="pl-5 font-bold text-[15px] w-[25%] text-left">
                비밀번호 확인
              </label>
              <input
                type="password"
                className="ml-2 w-[65%] h-[25px] text-[13px]"
                placeholder="재설정할 비밀번호를 다시 입력하세요."
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              ></input>
            </div>

            <button className="bg-primary-50 border border-primary-200 shadow-lg text-black text-lg rounded-lg px-2 mt-3 mx-1 w-[50%] h-[40px]"
            onClick={handleResetPassword}>비밀번호 변경
          </button>

        </form>
      </div>
    </div>
  );
};

export default NurseResetPasswordPage;