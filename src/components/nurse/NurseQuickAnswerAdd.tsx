import React, { useState } from 'react';
import axios from 'axios';
import Button from '../common/Button';

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

  const handleSave = async () => {
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
      setError('빠른 답변 추가 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#DFE6EC]">
      <h2 className="font-semibold mb-4" style={{fontSize: "var(--font-title)" }}>빠른 답변 추가</h2>
      <hr className="mb-4 border border-gray-300" />

      <div className="space-y-4">
        <div>
          <label className="text-[18px] text-black font-semibold block mb-2">제목</label>
          <input 
            type="text"
            className="w-full border border-gray-300 bg-gray-50 p-2 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
            className="w-full border-gray-300 bg-gray-50 p-2 rounded-lg rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
            className="w-full border border-gray-300 bg-gray-50 p-2 rounded-lg h-[500px] overflow-y-auto resize-none focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
            placeholder="빠른 답변 내용을 입력해주세요."
            rows={4}
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
            onClick={handleSave}
            variant="save"
            size='large'
          >
            저장
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NurseQuickAnswerAdd;
