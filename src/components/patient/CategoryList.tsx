import React, { useState } from "react";
import HeartButton from "./HeartButton";
import {
  SwipeableList,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

interface CategoryListProps {
  title: string;
  items: string[];
  favoriteRequests: string[];
  toggleFavoriteRequest: (request: string) => void;
  onDelete?: (request: string) => void;  // to delete custom categories
}

const CategoryList: React.FC<CategoryListProps> = ({ title, items, favoriteRequests, toggleFavoriteRequest, onDelete }) => {
  const [showHint, setShowHint] = useState(true);

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">{title}</h2>
      {onDelete && showHint && (
        <div className="bg-yellow-100 border-l-4 border-yellow-400 text-yellow-700 p-2 mb-4 text-sm rounded">
          항목을 왼쪽으로 밀어서 삭제할 수 있어요.
          <button onClick={() => setShowHint(false)} className="ml-2 text-xs underline">닫기</button>
        </div>
      )}
      <SwipeableList fullSwipe={false}>
        {items.map((item) => (
          <SwipeableListItem
            key={item}
            trailingActions={
              onDelete ? (
                <TrailingActions>
                  <SwipeAction destructive onClick={() => onDelete(item)}>
                    <span className="text-red-600 font-bold px-4"></span>
                  </SwipeAction>
                </TrailingActions>
              ) : undefined
            }
          >
            <div className="flex items-center justify-between text-base px-6 py-3 w-full rounded-md">
              <span className="text-gray-700">{item}</span>
              <div className="ml-4">
                <HeartButton
                  isFavorite={favoriteRequests.includes(item)}
                  onPressedChange={() => toggleFavoriteRequest(item)}
                />
              </div>
            </div>
          </SwipeableListItem>
        ))}
      </SwipeableList>
    </div>
  );
};

export default CategoryList;
