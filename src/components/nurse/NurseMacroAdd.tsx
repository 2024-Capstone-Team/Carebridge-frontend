import React, { useState } from 'react';
import axios from 'axios';

interface Macro {
  macroId: number;
  medicalStaffId: number;
  text: string;
  macroName: string;
}

interface NurseMacroProps {
  onClose: () => void;
  medicalStaffId: number;
}

const NurseMacro: React.FC<NurseMacroProps> = ({ onClose, medicalStaffId }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

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
      // 매크로 중복 체크
      const response = await axios.get(`${API_BASE_URL}/api/macro/list/${medicalStaffId}`);
      const existingMacros: Macro[] = response.data;

      const duplicate = existingMacros.find((macro) => macro.macroName === macroName);
      if (duplicate) {
        setError('동일한 제목의 매크로가 존재합니다');
        setLoading(false);
        return;
      }

      // 매크로 추가
      await axios.post(`${API_BASE_URL}/api/macro/${medicalStaffId}`, {
        macroName,
        text
      });
      alert('매크로가 성공적으로 추가되었습니다.');
      onClose();
    } catch (err) {
      setError('매크로 추가 중 오류가 발생했습니다.');
    }
  };


  return (
    <div className="w-full h-full bg-[#DFE6EC] rounded-lg">
      <h2 className="font-bold mb-4" style={{fontSize: "var(--font-title)" }}>스크립트 매크로 추가</h2>
      <hr className="mb-4 border border-gray-300" />

      <div className="mb-4">
        <label className="text-[18px] text-black font-semibold block mb-2">제목</label>
        <input
          type="text"
          className="w-full border p-2 rounded-lg"
          placeholder="매크로 제목을 입력해주세요."
          value={macroName}
          onChange={(e) => setMacroName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-[18px] text-black font-semibold block mb-2">내용</label> 
        <textarea
          className="w-full border p-2 rounded-lg h-[500px] overflow-y-auto resize-none"
          placeholder="스크립트 매크로 내용을 입력해주세요."
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-center space-x-4">
        <button 
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-lg font-medium rounded-md whitespace-nowrap transition-all duration-200 bg-[#F8F8F8] border border-[#E3E3E3] hover:bg-gray-200"
          >
            취소
          </button>
          <button 
            type="submit"
            className="bg-[#6990B6] px-3 py-1 text-lg font-medium rounded-md whitespace-nowrap transition-all duration-200 border border-[#306292] text-white hover:bg-[#2c5a8c]"
          >
            저장
          </button>
      </div>
      
    </div>
  );
};

export default NurseMacro;
