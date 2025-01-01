import React from "react";
import * as Toggle from "@radix-ui/react-toggle";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface HeartButtonProps {
  isFavorite: boolean;
  onPressedChange: () => void;
}

const HeartButton: React.FC<HeartButtonProps> = ({ isFavorite, onPressedChange }) => {
  return (
    <Toggle.Root
      className="flex items-center justify-center w-9 h-9 rounded-full bg-transparent hover:bg-violet-100 focus:outline-none transition-all duration-300 ease-in-out"
      pressed={isFavorite}
      onPressedChange={onPressedChange}
      aria-label="Toggle favorite"
    >
      {isFavorite ? (
        <FaHeart className="text-red-500 hover:text-violet-500" size={24} />
      ) : (
        <FaRegHeart className="text-gray-500 hover:text-violet-500" size={24} />
      )}
    </Toggle.Root>
  );
};

export default HeartButton;
