import React from 'react';

interface ButtonProps {
  onClick: () => void;
  variant: 'delete' | 'edit' | 'cancel' | 'save' | 'chat';
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  variant, 
  children, 
  size = 'small',
  className = '' 
}) => {
  const baseStyle = "font-semibold rounded-lg shadow-sm hover:shadow-md transform hover:-translate-y-0.5 transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-opacity-50";
  
  const sizeStyles = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-4 py-2 text-sm"
  };

  const variantStyles = {
    delete: "text-red-600 bg-red-50 hover:bg-red-100 focus:ring-red-100",
    edit: "text-black bg-gray-100 hover:bg-gray-200 focus:ring-gray-200",
    cancel: "text-black bg-gray-200 hover:bg-gray-300 focus:ring-gray-300",
    save: "text-blue-600 bg-blue-50 hover:bg-blue-100 focus:ring-blue-100",
    chat: "text-white bg-gray-400 hover:bg-gray-500 focus:ring-gray-500"
  };

  const buttonStyle = `${baseStyle} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;

  return (
    <button
      onClick={onClick}
      className={buttonStyle}
    >
      {children}
    </button>
  );
};

export default Button; 