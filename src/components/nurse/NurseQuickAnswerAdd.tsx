import React, { useState } from 'react';
import axios from 'axios';

interface NurseQuickAnswerAddProps {
  onClose: () => void;
  hospitalId: number;
}

const NurseQuickAnswerAdd: React.FC<NurseQuickAnswerAddProps> = ({ onClose, hospitalId }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General'); // 기본값: General
  const [information, setInformation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!information.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 빠른 답변 중복 체크
      const response = await axios.get(`${API_BASE_URL}/api/hospital-info/list/${hospitalId}`);
      const existingQuickAnswers = response.data;

      const duplicate = existingQuickAnswers.find((qa: { title: string }) => qa.title === title);
      if (duplicate) {
        setError('동일한 제목의 빠른 답변이 존재합니다');
        setLoading(false);
        return;
      }

      // 추가 데이터
      const newInfo = {
        hospitalId,
        title,
        category,
        information,
      };

      // 빠른 답변 추가
      await axios.post(`${API_BASE_URL}/api/hospital-info`, newInfo);
      alert('빠른 답변이 성공적으로 추가되었습니다.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('빠른 답변변 추가 중 오류가 발생했습니다.');
    }
  };


  return (
    <div className="w-full h-full bg-[#DFE6EC]">
      <h2 className="font-semibold mb-4" style={{fontSize: "var(--font-title)" }}>빠른 답변 추가</h2>
      <hr className="mb-4 border border-gray-300" />

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="text-[18px] text-black font-semibold block mb-2">제목</label>
          <input 
            type="text"
            className="w-full border p-2 rounded-lg"
            placeholder="빠른 답변 제목을 입력해주세요."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
          />
        </div>

        <div>
          <label className="block font-semibold text-[18px] text-black mb-2">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2 rounded-lg"
          >
            <option value="General">General</option>
            <option value="Facilities">Facilities</option>
            <option value="Specialty">Specialty</option>
          </select>
        </div>

        <div>
          <label className="text-[18px] text-black font-semibold block mb-2">내용</label>
          <textarea
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            className="w-full border p-2 rounded-lg h-[400px] overflow-y-auto resize-none"
            placeholder="빠른 답변 내용을 입력해주세요."
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

export default NurseQuickAnswerAdd;
