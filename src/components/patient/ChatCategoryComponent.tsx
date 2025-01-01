import React from 'react';

interface CategoryComponentProps {
  categories: string[];
  selectedCategory: number;
  handleCategoryClick: (index: number) => void;
}

const CategoryComponent: React.FC<CategoryComponentProps> = ({
  categories,
  selectedCategory,
  handleCategoryClick,
}) => {
  return (
    <div className="flex justify-start space-x-2 px-4 py-2 overflow-x-auto scrollbar-hide" style={{ height: '50px', overflow: 'hidden' }}>
      {categories.map((category, index) => (
        <div
          key={index}
          onClick={() => handleCategoryClick(index)}
          className={`flex items-center justify-center px-3 py-1 text-sm rounded-full cursor-pointer ${
            selectedCategory === index
              ? 'bg-primary text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          {category}
        </div>
      ))}
    </div>
  );
};

export default CategoryComponent;