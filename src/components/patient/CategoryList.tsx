import React from "react";
import HeartButton from "./HeartButton";

interface CategoryListProps {
  title: string;
  items: string[];
  favoriteRequests: string[];
  toggleFavoriteRequest: (request: string) => void;
}

const CategoryList: React.FC<CategoryListProps> = ({ title, items, favoriteRequests, toggleFavoriteRequest }) => (
  <div className="text-black">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    <ul className="text-lg space-y-3 pl-8">
      {items.map((item, index) => (
        <li key={index} className="flex items-center justify-between">
          <span className="cursor-pointer hover:underline">{item}</span>
          <HeartButton
            isFavorite={favoriteRequests.includes(item)}
            onPressedChange={() => toggleFavoriteRequest(item)}
          />
        </li>
      ))}
    </ul>
  </div>
);

export default CategoryList;
