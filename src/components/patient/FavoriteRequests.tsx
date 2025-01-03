import React, { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface FavoriteRequestsProps {
  requests: string[];
  sendFavoriteRequest: (request: string) => void;
  toggleFavoriteRequest: (request: string) => void;
}

const FavoriteRequests: React.FC<FavoriteRequestsProps> = ({ requests, sendFavoriteRequest, toggleFavoriteRequest }) => {
  // Load visibility state from localStorage
  const [isFavoriteVisible, setIsFavoriteVisible] = useState<boolean>(() => {
    const savedVisibility = localStorage.getItem('favoriteRequestsVisible');
    return savedVisibility ? JSON.parse(savedVisibility) : false;
  });

  // Update localStorage when visibility changes
  useEffect(() => {
    localStorage.setItem('favoriteRequestsVisible', JSON.stringify(isFavoriteVisible));
  }, [isFavoriteVisible]);

  // Toggle visibility when heart button is clicked
  const handleFavoriteToggle = () => {
    setIsFavoriteVisible((prevState) => !prevState);
  };

  return (
    <div className="flex items-center gap-4 px-4 py-2">
      {/* Heart icon button */}
      <div
        className="flex items-center justify-center w-10 h-10 p-2 rounded-2xl bg-primary-200 cursor-pointer"
        onClick={handleFavoriteToggle}
        aria-pressed={isFavoriteVisible}
        role="button"
      >
        {isFavoriteVisible ? (
          <FaHeart className="text-primary-400" size={24} />
        ) : (
          <FaRegHeart className="text-white" size={24} />
        )}
      </div>

      {/* Favorite requests list container */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide min-h-[40px]">
        {isFavoriteVisible &&
          requests.map((request, index) => (
            <div
              key={index}
              className="bg-gray-100 text-gray-800 rounded-xl px-4 py-2 shadow-md whitespace-nowrap max-w-sm sm:max-w-md break-words cursor-pointer"
              onClick={() => sendFavoriteRequest(request)}
              onDoubleClick={() => toggleFavoriteRequest(request)}
            >
              {request}
            </div>
          ))}
      </div>
    </div>
  );
};

export default FavoriteRequests;
