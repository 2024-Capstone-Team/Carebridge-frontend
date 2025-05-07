import React from "react";
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

const CategoryList: React.FC<CategoryListProps> = ({ title, items, favoriteRequests, toggleFavoriteRequest, onDelete }) => (
  <div className="text-black">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
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
          <div className="flex items-center justify-between text-lg pl-8 py-2 w-full">
            <span className="cursor-pointer hover:underline">{item}</span>
            <div className="ml-auto">
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

export default CategoryList;
