import React from 'react';
import { useNavigate } from "react-router-dom";
import NurseMessaging from '../../components/nurse/NurseMessaging'; // Adjust the import path as necessary



const NurseMainPage: React.FC = () => {
  const navigate = useNavigate();

  const handleEditClick = (scheduleId: string) => {
    // 수정 버튼 클릭 시 상태 전달
    navigate(`/schedule/${scheduleId}`, { state: { editMode: true } });
  };

  return (
    <div className="flex h-screen bg-gray-100 p-6">        
      <div className="w-1/5 bg-white rounded-lg shadow-lg p-6 mr-3 overflow-hidden">
        
      </div>

      {/* Chat Application */}
      <NurseMessaging />

      <div className="patientinfo-content w-1/5 flex flex-col space-y-6">
        <div className="bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 mb-1">
          
        </div>
          
        <div className="schedule-content w-full bg-[#DFE6EC] rounded-lg shadow-lg p-6 flex-1 overflow-hidden">
          
        </div>
      </div>
    </div>
  );
};

export default NurseMainPage;