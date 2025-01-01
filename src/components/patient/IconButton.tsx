import React from "react";

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  iconSrc: string;
  altText: string;
}

const IconButton: React.FC<IconButtonProps> = ({ iconSrc, altText, className, ...props }) => (
  <button
    className={`p-2 rounded-full bg-transparent hover:bg-gray-200 focus:outline-none ${className}`}
    {...props}
  >
    <img src={iconSrc} alt={altText} className="w-8 h-8" />
  </button>
);

export default IconButton;
