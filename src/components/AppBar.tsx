import React, { useEffect, useRef, useState } from 'react';
import { BiBell, BiCog, BiUser, BiLogOut } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

interface AppBarProps {
  projectName: string;
  onProjectSelect?: () => void;
  isProjectSelectable?: boolean;
  userImageUrl?: string;
  userName?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  hideProfileMenu?: boolean;
}

const AppBar: React.FC<AppBarProps> = ({
  projectName,
  onProjectSelect,
  isProjectSelectable = false,
  userImageUrl,
  userName = 'User',
  showBackButton = false,
  onBackClick,
  hideProfileMenu = false
}) => {
  const navigate = useNavigate();
  const getInitials = (name: string) => {
    return name
      ?.split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase() || '';
  };

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Add logout logic here
    navigate('/login');
  };

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="px-6 py-3 flex justify-between items-center">
        {/* Left Section with Back Button and Project Name */}
        <div className="flex items-center space-x-4">
          {showBackButton && (
            <button
              onClick={onBackClick}
              className="p-2 text-gray-400 hover:text-gray-500 -ml-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          {isProjectSelectable ? (
            <button 
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={onProjectSelect}
            >
              <span>{projectName || 'Select Project'}</span>
            </button>
          ) : (
            <span className="text-sm font-medium text-gray-700">{projectName}</span>
          )}
        </div>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-500">
            <BiBell className="h-6 w-6" />
          </button>
          <button 
            onClick={() => navigate('/settings')}
            className="p-2 text-gray-400 hover:text-gray-500"
          >
            <BiCog className="h-6 w-6" />
          </button>
          
          {/* User Profile Menu */}
          <div className="relative" ref={menuRef}>
            {!hideProfileMenu && (
              <>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="focus:outline-none"
                >
                  {userImageUrl ? (
                    <img
                      src={userImageUrl}
                      alt={userName}
                      className="h-8 w-8 rounded-full object-cover border border-gray-200"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-600">
                        {getInitials(userName)}
                      </span>
                    </div>
                  )}
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/profile');
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <BiUser className="h-5 w-5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                      >
                        <BiLogOut className="h-5 w-5" />
                        <span>Sign out</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppBar;
