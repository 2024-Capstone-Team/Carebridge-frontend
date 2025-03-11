import React, { useState, useEffect } from 'react';
import axios from 'axios';
import star from "../../assets/star.png";
import ystar from "../../assets/yellow star.png";
import NurseQuickAnswerAdd from './NurseQuickAnswerAdd';
import NurseQuickAnswerEdit from './NurseQuickAnswerEdit';

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
  const [quickAnswers, setQuickAnswers] = useState<QuickAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQuickAnswer, setSelectedQuickAnswer] = useState<QuickAnswer | null>(null);
  const [toggledStars, setToggledStars] = useState<Record<number, boolean>>({});

  const fetchQuickAnswers = async () => {
    try {
      const response = await axios.get(`http://localhost:8080/api/hospital-info/list/${hospitalId}`);
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
      
      // 초기 Stars 상태 설정정
      const initialStars: Record<number, boolean> = {};
      favorites.forEach((id) => {
        initialStars[id] = true;
      });
      setToggledStars(initialStars);
    }
  }, [hospitalId]);

  const handleDelete = async (title: string) => {
    if (!window.confirm(`정말로 '${title}' 빠른 답변을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8080/api/hospital-info/${hospitalId}/${title}`);
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

  const handleModalClose = () => {
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
        <NurseQuickAnswerAdd onClose={handleModalClose} hospitalId={hospitalId} />
      ) : isEditing && selectedQuickAnswer ? (
        <NurseQuickAnswerEdit 
          onClose={handleModalClose} 
          hospitalId={hospitalId} 
          quickAnswer={selectedQuickAnswer} 
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold mb-4">빠른 답변 설정</h2>
            <button 
              onClick={() => setIsAdding(true)}
              className="text-[15px] text-gray-600 bg-transparent hover:text-gray-400 focus:outline-none"
            >
              추가
            </button>
          </div>
          <hr className="mb-4 border border-gray-300" />
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[770px]">
              {quickAnswers.map((qa) => (
                <div key={qa.id} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center">
                  <div className="pr-2 whitespace-pre-wrap break-words">
                    <h3 className="text-[17px] font-semibold">{qa.title}</h3>
                    <p className="text-[14px] text-gray-500">{qa.information}</p>
                  </div>
                  <div className="flex space-x-2">
                    <img 
                      src={toggledStars[qa.id] ? ystar : star}
                      alt={toggledStars[qa.id] ? "즐겨찾기됨" : "즐겨찾기 안됨"}
                      className="h-[20px] w-[20px] mt-2 mr-1 cursor-pointer"
                      onClick={() => toggleStar(qa.id)}
                    />
                    <button 
                      onClick={() => handleEdit(qa)}
                      className="bg-gray-200 text-gray-700 text-[17px] h-[40px] w-[70px] rounded-md hover:bg-gray-300"
                    >
                      수정
                    </button>
                    <button 
                      onClick={() => handleDelete(qa.title)}
                      className="bg-[#6990B6] text-white text-[17px] h-[40px] w-[70px] rounded-md hover:bg-[#5a7a99]"
                    >
                      삭제
                    </button>
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
