// 로그인한 medical_staff_id를 받아와서 매크로 저장 시에 id에 맞춰서 저장하는 기능 구현 필요
import React, { useState } from 'react';
import axios from 'axios';

interface NurseMacroProps {
  onClose: () => void;
  medicalStaffId: number;
}

const NurseMacro: React.FC<NurseMacroProps> = ({ onClose, medicalStaffId }) => {
  const [macroName, setMacroName] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!macroName.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!text.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await axios.post(`http://localhost:8080/api/macro/${medicalStaffId}`, {
        macroName,
        text
      });
      alert('매크로가 성공적으로 추가되었습니다.');
      onClose();
    } catch (err) {
      setError('매크로 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#DFE6EC] p-6 z-50 rounded-lg">
      <h2 className="text-lg font-bold mb-4">스크립트 매크로 추가</h2>
      <hr className="mb-4 border border-gray-300" />

      <div className="mb-4">
        <label className="text-black font-semibold block mb-2">제목</label>
        <input
          type="text"
          className="w-full border p-2"
          placeholder="매크로 제목을 입력해주세요."
          value={macroName}
          onChange={(e) => setMacroName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-black font-semibold block mb-2">내용</label> 
        <textarea
          className="w-full border p-2 h-[500px] overflow-y-auto resize-none"
          placeholder="스크립트 매크로 내용을 입력해주세요."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-center space-x-4">
        <button
          onClick={onClose}
          className="bg-white border border-gray-300 shadow-lg text-lg rounded-md px-2 mx-1 w-[65px] h-[40px] hover:bg-gray-200"
          disabled={loading}
        >
          취소
        </button>
        <button
          onClick={handleSave}
          className="bg-[#6990B6] border shadow-lg text-white text-lg rounded-md px-2 mx-1 w-[65px] h-[40px]"
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </div>
  );
};

export default NurseMacro;
