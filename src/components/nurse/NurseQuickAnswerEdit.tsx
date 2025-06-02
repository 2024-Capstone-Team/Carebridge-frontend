import React, { useState } from 'react';
import axios from 'axios';
import Button from '../common/Button';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (!title.trim() || !information.trim()) {
      alert('제목과 정보를 모두 입력해주세요.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospital-info/list/${hospitalId}`);
      const existingQuickAnswers = response.data;
      const duplicate = existingQuickAnswers.find(
        (qa: { id: number; title: string }) => qa.title === title && qa.id !== quickAnswer.id
      );
      if (duplicate) {
        setError('동일한 제목의 빠른 답변이 존재합니다');
        setLoading(false);
        return;
      }

      await axios.put(`${API_BASE_URL}/api/hospital-info/${hospitalId}/${quickAnswer.id}`, null, {
        params: {
          title,
          information,
        },
      });
      alert('빠른 답변이 성공적으로 수정되었습니다.');
      onClose();
    } catch (err) {
      console.error(err);
      setError('빠른 답변 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#DFE6EC] rounded-lg">
      <h2 className="font-bold mb-4" style={{fontSize: "var(--font-title)" }}>빠른 답변 수정</h2>
      <hr className="mb-4 border border-gray-300" />

      <div className="space-y-4">
        <div>
          <label className="text-[18px] text-black font-semibold block mb-2">제목</label>
          <input 
            type="text"
            className="w-full border border-gray-300 bg-gray-50 p-2 rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
            value={quickAnswer.category}  
            disabled
            className="w-full border-gray-300 bg-gray-50 p-2 rounded-lg rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
            className="w-full border-gray-300 bg-gray-50 p-2 h-[500px] overflow-y-auto resize-none rounded-lg focus:border-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-400"
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
            onClick={handleUpdate}
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

export default NurseQuickAnswerEdit;
