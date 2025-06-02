import React, { useState, useEffect } from 'react';
import star from "../../assets/star.png";
import ystar from "../../assets/yellow star.png";
import axios from 'axios';
import NurseMacro from './NurseMacroAdd';
import NurseMacroEdit from './NurseMacroEdit';
import { FaPlus } from 'react-icons/fa';
import Button from '../common/Button';

interface Macro {
  macroId: number;
  medicalStaffId: number;
  text: string;
  macroName: string;
}

interface NurseMacroListProps {
  medicalStaffId: number;
}

const NurseMacroList: React.FC<NurseMacroListProps> = ({ medicalStaffId }) => {
  const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [macros, setMacros] = useState<Macro[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedMacro, setSelectedMacro] = useState<Macro | null>(null);
  const [toggledStars, setToggledStars] = useState<Record<number, boolean>>({});

  const fetchMacros = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/macro/list/${medicalStaffId}`);
      setMacros(response.data);
    } catch (err) {
      setError('매크로 목록을 불러오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchMacros();
    // localStorage에서 즐겨찾기 정보를 불러옴
    const savedFavorites = localStorage.getItem('favoriteMacroIds');
    if (savedFavorites) {
      const favorites: number[] = JSON.parse(savedFavorites);
      
      // 초기 Stars 상태 설정
      const initialStars: Record<number, boolean> = {};
      favorites.forEach((id) => {
        initialStars[id] = true;
      });
      setToggledStars(initialStars);
    }
  }, [medicalStaffId]);


  // 매크로 삭제
  const handleDelete = async (macroName: string) => {
    const confirmDelete = window.confirm(`정말로 '${macroName}' 매크로를 삭제하시겠습니까?`);
    if (!confirmDelete) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/api/macro/${medicalStaffId}/${macroName}`);
      setMacros((prev) => prev.filter(macro => macro.macroName !== macroName));
      alert('매크로가 삭제되었습니다.');
    } catch (err) {
      alert('매크로 삭제 중 오류가 발생했습니다.');
    }
  };

  const handleEdit = (macro: Macro) => {
    setSelectedMacro(macro);
    setIsEditing(true);
  };

  // 매크로 창을 닫을 때 매크로 목록 새로고침
  const handleMacroRefresh = () => {
    setIsAdding(false);
    setIsEditing(false);
    setSelectedMacro(null);
    fetchMacros();
  };

  // localStorage에 즐겨찾기 macroId 목록을 저장
  const toggleStar = (macroId: number) => {
    setToggledStars((prev) => {
      const newState = { ...prev, [macroId]: !prev[macroId] };
      const favoriteMacroIds = Object.entries(newState)
        .filter(([id, isFavorite]) => isFavorite)
        .map(([id]) => parseInt(id));
      localStorage.setItem("favoriteMacroIds", JSON.stringify(favoriteMacroIds));
      return newState;
    });
  };


  return (
    <div className="w-full h-full bg-[#DFE6EC] p-6 z-50 rounded-lg">
      {isAdding ? (
        <NurseMacro onClose={handleMacroRefresh} medicalStaffId={medicalStaffId} />
      ) : isEditing && selectedMacro ? (
        <NurseMacroEdit 
          onClose={handleMacroRefresh} 
          medicalStaffId={medicalStaffId} 
          macro={selectedMacro} 
        />
      ) : (
        <>

          <div className="flex items-center justify-between">
            <h2 className="font-semibold mb-4" style={{ fontSize: "var(--font-title)" }}>스크립트 매크로 설정</h2>
            <button 
              className="text-[15px] text-gray-600 bg-transparent hover:text-gray-400 focus:outline-none"
              onClick={() => setIsAdding(true)}>
              <FaPlus />
            </button>
          </div>
          <hr className="mb-4 border border-gray-300" />
          
          {error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[770px]">
              {macros.map((macro) => (
                <div key={macro.macroId} className="bg-white p-4 rounded-lg shadow-md flex justify-between items-center h-[100px]">
                  <div className="pr-2 whitespace-pre-wrap break-words">
                    <h3 className="text-[18px] font-semibold turncate">{macro.macroName}</h3>
                    <p className="text-gray-500 line-clamp-2" style={{ fontSize: "var(--font-body)" }}>{macro.text}</p>
                  </div>

                  <div className="flex space-x-2">
                    <img 
                      src={toggledStars[macro.macroId] ? ystar : star} 
                      alt={toggledStars[macro.macroId] ? "즐겨찾기됨" : "즐겨찾기 안됨"} 
                      className="h-[20px] w-[20px] mt-2 mr-1 cursor-pointer"
                      onClick={() => toggleStar(macro.macroId)}
                    />

                    <Button
                      onClick={() => handleEdit(macro)}
                      variant="edit"
                      >
                        수정
                    </Button>

                    <Button
                      onClick={() => handleDelete(macro.macroName)}
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

export default NurseMacroList;
