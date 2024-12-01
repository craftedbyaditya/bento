import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className = '', 
  type = 'button' 
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`w-full 
        py-3 
        px-4 
        bg-black 
        text-white 
        rounded-md 
        text-sm 
        hover:bg-gray-800 
        transition-colors 
        duration-200 
        
        ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
