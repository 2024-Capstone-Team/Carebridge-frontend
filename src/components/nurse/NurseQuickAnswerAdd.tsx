import React, { useState } from 'react';
import axios from 'axios';

interface NurseQuickAnswerAddProps {
  onClose: () => void;
  hospitalId: number;
}

const NurseQuickAnswerAdd: React.FC<NurseQuickAnswerAddProps> = ({ onClose, hospitalId }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General'); // 기본값: General
  const [information, setInformation] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }

    if (!information.trim()) {
      alert('내용을 입력해주세요.');
      return;
    }

    try {
      // 병원에 등록된 빠른 답변 목록을 가져와서 중복 제목 체크
      const response = await axios.get(`http://localhost:8080/api/hospital-info/list/${hospitalId}`);
      const existingQuickAnswers = response.data;
      const duplicate = existingQuickAnswers.find((qa: { title: string }) => qa.title === title);
      if (duplicate) {
        setError('동일한 제목의 빠른 답변이 존재합니다');
        return;
      }

      const newInfo = {
        hospitalId,
        title,
        category,
        information,
      };

      // POST 요청으로 DB에 새 빠른 답변을 추가합니다.
      await axios.post('http://localhost:8080/api/hospital-info', newInfo);
      alert('병원 정보가 성공적으로 추가되었습니다.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('병원 정보 추가 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="w-full h-full bg-[#DFE6EC]">
      <h2 className="text-lg font-semibold mb-4">빠른 답변 추가</h2>
      <hr className="mb-4 border border-gray-300" />

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-black font-semibold block mb-2">제목</label>
          <input 
            type="text"
            className="w-full border p-2"
            placeholder="빠른 답변 제목을 입력해주세요."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setError(null);
            }}
          />
        </div>
        <div>
          <label className="block font-semibold text-black mb-2">카테고리</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full border p-2"
          >
            <option value="General">General</option>
            <option value="Facilities">Facilities</option>
            <option value="Specialty">Specialty</option>
          </select>
        </div>
        <div>
          <label className="text-black font-semibold block mb-2">내용</label>
          <textarea
            value={information}
            onChange={(e) => setInformation(e.target.value)}
            className="w-full border p-2 h-[400px] overflow-y-auto resize-none"
            placeholder="빠른 답변 내용을 입력해주세요."
            rows={4}
          ></textarea>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="flex justify-center space-x-4">
          <button 
            type="button"
            onClick={onClose}
            className="bg-white border border-gray-300 shadow-lg text-lg rounded-md px-2 mx-1 w-[65px] h-[40px] hover:bg-gray-200"
          >
            취소
          </button>
          <button 
            type="submit"
            className="bg-[#6990B6] border shadow-lg text-white text-lg rounded-md px-2 mx-1 w-[65px] h-[40px]"
          >
            저장
          </button>
        </div>
      </form>
    </div>
  );
};

export default NurseQuickAnswerAdd;
