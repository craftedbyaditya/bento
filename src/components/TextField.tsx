import React, { ChangeEvent } from 'react';

interface TextFieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  name: string;
}

const TextField: React.FC<TextFieldProps> = ({ 
  label, 
  type = 'text', 
  value, 
  onChange, 
  placeholder = '',
  name 
}) => {
  return (
    <>
      <label 
        htmlFor={name} 
        className="block mb-2 text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-2 
          border 
          border-gray-300 
          rounded-md 
          focus:outline-none 
          focus:ring-2 
          focus:ring-blue-500 
          focus:border-transparent"
      />
    </>
  );
};

export default TextField;
