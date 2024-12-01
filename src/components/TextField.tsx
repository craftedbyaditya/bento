import React, { ChangeEvent } from 'react';

interface TextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name: string;
  onDelete?: () => void;
  showDelete?: boolean;
  disabled?: boolean;
}

const TextField: React.FC<TextFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '',
  name,
  onDelete,
  showDelete = false,
  disabled = false
}) => {
  return (
    <div className="w-full">
      <label 
        htmlFor={name} 
        className={`block mb-2 text-sm font-medium ${disabled ? 'text-gray-500' : 'text-gray-700'}`}
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full px-4 py-2 
            border 
            rounded-md 
            focus:outline-none 
            focus:ring-2 
            focus:ring-blue-500 
            focus:border-transparent
            pr-10
            ${disabled 
              ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' 
              : 'border-gray-300 text-gray-900'
            }`}
        />
        {showDelete && onDelete && !disabled && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg
              className="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default TextField;
