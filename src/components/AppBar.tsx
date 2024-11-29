import React from 'react';
import { BiBell, BiCog, BiChevronDown } from 'react-icons/bi';

interface AppBarProps {
  projectName: string;
  onProjectSelect?: () => void;
  isProjectSelectable?: boolean;
}

const AppBar: React.FC<AppBarProps> = ({ 
  projectName, 
  onProjectSelect, 
  isProjectSelectable = false 
}) => {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Project Name Display/Button */}
        <div className="relative">
          <button 
            className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md ${
              isProjectSelectable ? 'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500' : 'cursor-default'
            }`}
            onClick={isProjectSelectable ? onProjectSelect : undefined}
          >
            <span>{projectName || 'Select Project'}</span>
            {isProjectSelectable && <BiChevronDown className="h-5 w-5" />}
          </button>
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BiBell className="h-6 w-6" />
          </button>
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BiCog className="h-6 w-6" />
          </button>
          <div className="h-6 w-6 rounded-full bg-gray-200">
            {/* Profile picture placeholder */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBar;
