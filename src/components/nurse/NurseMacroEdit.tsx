import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Button from '../common/Button';

interface Macro {
  macroId: number;
  medicalStaffId: number;
  text: string;
  macroName: string;
}

interface NurseMacroEditProps {
  onClose: () => void;
  medicalStaffId: number;
  macro: Macro;
}

const NurseMacroEdit: React.FC<NurseMacroEditProps> = ({ onClose, medicalStaffId, macro }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [macroName, setMacroName] = useState(macro.macroName);
  const [text, setText] = useState(macro.text);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    setMacroName(macro.macroName);
    setText(macro.text);
  }, [macro]);


  const handleUpdate = async () => {
    if (!macroName.trim() || !text.trim()) {
      setError('제목과 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 매크로 중복 체크
      const response = await axios.get(`${API_BASE_URL}/api/macro/list/${medicalStaffId}`);
      const existingMacros: Macro[] = response.data;

      const duplicate = existingMacros.find(
        (m) => m.macroName === macroName && m.macroId !== macro.macroId
      );
      if (duplicate) {
        setError('동일한 제목의 매크로가 존재합니다');
        setLoading(false);
        return;
      }

      const responseUpdate = await axios.put(`${API_BASE_URL}/api/macro/${medicalStaffId}`, {
        macroId: macro.macroId,
        medicalStaffId: medicalStaffId,
        macroName: macroName,
        text: text
      });

      console.log("서버 응답:", responseUpdate.data);
      alert('매크로가 성공적으로 수정되었습니다.');
      onClose();
    } catch (err) {
      console.error("API 요청 오류:", err);
      setError('매크로 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="w-full h-full bg-[#DFE6EC] rounded-lg">
      <h2 className="font-bold mb-4" style={{fontSize: "var(--font-title)" }}>스크립트 매크로 수정</h2>
      <hr className="mb-4 border border-gray-300" />

      <div className="mb-4">
        <label className="text-[18px] text-black font-semibold block mb-2">제목</label>
        <input
          type="text"
          className="w-full border border-gray-300 bg-gray-50 p-2 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={macroName}
          onChange={(e) => setMacroName(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="text-[18px] text-black font-semibold block mb-2">내용</label>
        <textarea
          className="w-full border-gray-300 bg-gray-50 p-2 h-[500px] overflow-y-auto resize-none rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
          value={text}
          onChange={(e) => setText(e.target.value)}
        ></textarea>
      </div>

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      <div className="flex justify-center space-x-2">
        <Button 
          onClick={onClose}
          variant="cancel"
          size='large'
        >
          취소
        </Button>
              
        <Button 
          onClick={handleUpdate}
          variant="save"
          size='large'
        >
          저장
        </Button>
      </div>
      
    </div>
  );
};

export default NurseMacroEdit;
