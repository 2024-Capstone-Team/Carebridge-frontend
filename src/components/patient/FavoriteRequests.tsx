import React from "react";

interface FavoriteRequestsProps {
  requests: string[];
  sendFavoriteRequest: (request: string) => void;
}

const FavoriteRequests: React.FC<FavoriteRequestsProps> = ({ requests, sendFavoriteRequest }) => {
  return (
    <div className="flex flex-wrap gap-2 px-4 py-2">
      {requests.map((request, index) => (
        <div
          key={index}
          className="bg-gray-100 text-gray-800 rounded-full px-4 py-2 text-sm border border-gray-200 active:bg-gray-200 transition whitespace-nowrap cursor-pointer"
          onClick={() => sendFavoriteRequest(request)}
        >
          {request}
        </div>
      ))}
    </div>
  );
};

export default FavoriteRequests;
