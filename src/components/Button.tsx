import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  className = '', 
  type = 'button',
  disabled = false
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`w-full 
        py-3 
        px-4 
        text-white 
        rounded-md 
        text-sm 
        transition-colors 
        duration-200
        ${disabled 
          ? 'bg-gray-400 cursor-not-allowed' 
          : 'bg-black hover:bg-gray-800'
        }
        ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
