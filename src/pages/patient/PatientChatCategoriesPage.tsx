import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import PatientChatHeader from '../../components/patient/PatientChatHeader';
import CategoryList from '../../components/patient/CategoryList';
import FavoriteRequestsContext from "../../context/FavoriteRequestsContext";


const PatientChatCategories: React.FC = () => {
  const context = useContext(FavoriteRequestsContext);

  if (!context) {
    throw new Error("PatientChatCategories must be used within a FavoriteRequestsProvider");
  }

  const { favoriteRequests, toggleFavoriteRequest } = context;
  
  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <PatientChatHeader title="전체 요청사항" />

      {/* Body */}
      <div className="px-8 py-2 flex-1 overflow-y-auto scrollbar-hide">
        <div className="space-y-6">
          {/* Categories */}
          <CategoryList
            title="물품 요청"
            items={['환자복 교체하고 싶어요', '침구 교체하고 싶어요', '음식 엎질렀어요']}
            favoriteRequests={favoriteRequests}
            toggleFavoriteRequest={toggleFavoriteRequest}
          />

          <CategoryList
            title="생활보조 요청"
            items={['산책하고 싶어요', '머리 감고 싶어요', '물 주세요']}
            favoriteRequests={favoriteRequests}
            toggleFavoriteRequest={toggleFavoriteRequest}
          />

          <CategoryList
            title="건강 요청"
            items={['몸이 너무 아파요', '상태 확인받고 싶어요']}
            favoriteRequests={favoriteRequests}
            toggleFavoriteRequest={toggleFavoriteRequest}
          />

          <CategoryList
            title="정보 요청"
            items={[
              '병실이 어디있는지 알고 싶어요',
              '편의시설이 어디있는지 알고 싶어요',
              '예약일자 확인하고 싶어요',
              '수술 시간 확인하고 싶어요',
            ]}
            favoriteRequests={favoriteRequests}
            toggleFavoriteRequest={toggleFavoriteRequest}
          />

          {/* Custom */}
          <div>
            <h2 className="text-xl font-semibold text-gray-400">
              <Link to="/custom-request" className="hover:underline">
                + 커스텀 요청
              </Link>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientChatCategories;
