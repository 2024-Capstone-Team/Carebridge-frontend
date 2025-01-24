import React from 'react';

interface NurseMacroProps {
  onClose: () => void; // 닫기 버튼 핸들러
}

const NurseMacro: React.FC<NurseMacroProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-y-0 right-0 bg-[#DFE6EC] w-4/5 h-full rounded-lg z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-lg w-3/4 h-3/4 p-6 relative">
        <h2 className="text-xl font-bold mb-4">스크립트 매크로 설정</h2>
        <hr className="bg-gray-600"></hr>
        
        <div className="mb-4">
          <label className="text-gray-700 font-semibold my-2">제목</label>
          <input type="text" className="w-full border border-gray-500 p-2"/>
        </div>
        
        <div className="mb-4">
          <label className="text-gray-700 font-semibold mb-2">내용</label>
          <textarea className="w-full border border-gray-300 p-2 h-40"></textarea>
        </div>

        <div className="flex justify-center space-x-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">취소</button>
          <button className="px-4 py-2 bg-[#6990B6] text-white rounded-lg">저장</button>
        </div>

      </div>
    </div>
  );
};

export default NurseMacro;
