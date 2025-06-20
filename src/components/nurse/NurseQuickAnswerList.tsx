import React, { useState, useEffect } from 'react';
import axios from 'axios';
import star from "../../assets/star.png";
import ystar from "../../assets/yellow star.png";
import NurseQuickAnswerAdd from './NurseQuickAnswerAdd';
import NurseQuickAnswerEdit from './NurseQuickAnswerEdit';
import { FaPlus } from 'react-icons/fa';
import Button from '../common/Button';

interface QuickAnswer {
  id: number;
  hospitalId: number;
  category: string;
  title: string;
  information: string;
}

interface NurseQuickAnswerListProps {
  hospitalId: number;
}

const NurseQuickAnswerList: React.FC<NurseQuickAnswerListProps> = ({ hospitalId }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [quickAnswers, setQuickAnswers] = useState<QuickAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<QuickAnswer | null>(null);
  const [toggledStars, setToggledStars] = useState<Record<number, boolean>>({});


  const fetchQuickAnswers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/hospital-info/list/${hospitalId}`);
      setQuickAnswers(response.data);
    } catch (err) {
      setError('빠른 답변 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchQuickAnswers();
    const savedFavorites = localStorage.getItem('favoriteQuickAnswerIds');
    if (savedFavorites) {
      const favorites: number[] = JSON.parse(savedFavorites);
      
      // 초기 Stars 상태 설정
      const initialStars: Record<number, boolean> = {};
      favorites.forEach((id) => {
        initialStars[id] = true;
      });
      setToggledStars(initialStars);
    }
  }, [hospitalId]);


  // 빠른 답변 삭제
  const handleDelete = async (title: string) => {
    if (!window.confirm(`정말로 '${title}' 빠른 답변을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/api/hospital-info/${hospitalId}/${title}`);
      setQuickAnswers((prev) => prev.filter((qa) => qa.title !== title));
      alert('빠른 답변이 삭제되었습니다.');
    } catch (err) {
      alert('빠른 답변 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (quickAnswer: QuickAnswer) => {
    setSelectedQuickAnswer(quickAnswer);
    setIsEditing(true);
  };

  // 빠른 답변 창을 닫을 때 빠른 답변 목록 새로고침
  const handleQARefresh = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedQuickAnswer(null);
    fetchQuickAnswers();
  };

  // localStorage에 즐겨찾기 Id 목록을 저장
  const toggleStar = (id: number) => {
    setToggledStars((prev) => {
      const newState = { ...prev, [id]: !prev[id] };
      const favoriteIds = Object.entries(newState)
        .filter(([_, isFavorite]) => isFavorite)
        .map(([id]) => parseInt(id));
      localStorage.setItem('favoriteQuickAnswerIds', JSON.stringify(favoriteIds));
      return newState;
    });
  };


  return (
    <div className="w-full h-full bg-[#DFE6EC] p-6 rounded-lg">
      
      {isAdding ? (
        <NurseQuickAnswerAdd onClose={handleQARefresh} hospitalId={hospitalId} />
      ) : isEditing && selectedQuickAnswer ? (
        <NurseQuickAnswerEdit 
          onClose={handleQARefresh} 
          hospitalId={hospitalId} 
          quickAnswer={selectedQuickAnswer} 
        />
      ) : (
        <>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold mb-4" style={{ fontSize: "var(--font-title)" }}>빠른 답변 설정</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="text-[15px] text-gray-600 bg-transparent hover:text-gray-400 focus:outline-none"
            >
              <FaPlus />
            </button>
          </div>
          <hr className="mb-4 border border-gray-300" />

          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[770px]">
              {quickAnswers.map((qa) => (
                <div key={qa.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center h-[100px]">
                  <div className="pr-2 whitespace-pre-wrap break-words">
                    <h3 className="text-[18px] font-semibold turncate">{qa.title}</h3>
                    <p className="text-gray-500 line-clamp-2" style={{ fontSize: "var(--font-body)" }}>{qa.information}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <img 
                      src={toggledStars[qa.id] ? ystar : star}
                      alt={toggledStars[qa.id] ? "즐겨찾기됨" : "즐겨찾기 안됨"}
                      className="h-[20px] w-[20px] mt-2 mr-1 cursor-pointer"
                      onClick={() => toggleStar(qa.id)}
                    />

                    <Button
                      onClick={() => handleEdit(qa)}
                      variant="edit"
                      >
                        수정
                    </Button>

                    <Button
                      onClick={() => handleDelete(qa.title)}
                      variant="delete"
                      >
                        삭제
                    </Button>
                  </div>
                  
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NurseQuickAnswerList;
