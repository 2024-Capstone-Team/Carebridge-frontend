import React, { useState } from 'react';
import axios from 'axios';

interface NurseQuickAnswerEditProps {
  onClose: () => void;
  hospitalId: number;
  quickAnswer: {
    id: number;
    hospitalId: number;
    category: string;
    title: string;
    information: string;
  };
}

const NurseQuickAnswerEdit: React.FC<NurseQuickAnswerEditProps> = ({ onClose, hospitalId, quickAnswer }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [title, setTitle] = useState(quickAnswer.title);
  const [information, setInformation] = useState(quickAnswer.information);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !information.trim()) {
      alert('제목과 정보를 모두 입력해주세요.');
      return;
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospital-info/list/${hospitalId}`);
      const existingQuickAnswers = response.data;
      const duplicate = existingQuickAnswers.find(
        (qa: { id: number; title: string }) => qa.title === title && qa.id !== quickAnswer.id
      );
      if (duplicate) {
        setError('동일한 제목의 빠른 답변이 존재합니다');
        return;
      }

      await axios.put(`${API_BASE_URL}/api/hospital-info/${hospitalId}/${quickAnswer.id}`, null, {
        params: {
          title,
          information,
        },
      });
      alert('병원 정보가 성공적으로 수정되었습니다.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('병원 정보 수정 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full h-full bg-[#DFE6EC] rounded-lg">
      <h2 className="font-bold mb-4" style={{fontSize: "var(--font-title)" }}>빠른 답변 수정</h2>
      <hr className="mb-4 border border-gray-300" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-[18px] text-black font-semibold block mb-2">제목</label>
          <input 
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
            className="w-full border p-2 rounded-lg"
          />
        </div>

        <div>
          <label className="block font-semibold text-[18px] text-black mb-2">카테고리</label>
          <select
            value={quickAnswer.category}  
            disabled
            className="w-full border p-2 rounded-lg"
          >
            <option value="General">General</option>
            <option value="Facilities">Facilities</option>
            <option value="Specialty">Specialty</option>
          </select>
        </div>
        
        <div>
          <label className="block font-semibold text-[18px] text-black mb-2">내용</label>
          <textarea
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            className="w-full border rounded-lg p-2 h-[400px] overflow-y-auto resize-none"
            rows={4}
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
      </form>
    </div>
  );
};

export default NurseQuickAnswerEdit;
