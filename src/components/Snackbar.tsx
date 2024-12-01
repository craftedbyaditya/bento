import React, { useEffect } from 'react';
import { BiX, BiCheck, BiError } from 'react-icons/bi';

export type SnackbarType = 'success' | 'error';

interface SnackbarProps {
  message: string;
  type: SnackbarType;
  isOpen: boolean;
  onClose: () => void;
  autoHideDuration?: number;
}

const Snackbar: React.FC<SnackbarProps> = ({
  message,
  type,
  isOpen,
  onClose,
  autoHideDuration = 3000,
}) => {
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, autoHideDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose, autoHideDuration]);

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
      <div
        className={`flex items-center p-4 rounded-lg shadow-lg space-x-2 ${
          type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}
      >
        {type === 'success' ? (
          <BiCheck className="h-5 w-5 text-green-400" />
        ) : (
          <BiError className="h-5 w-5 text-red-400" />
        )}
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className={`ml-4 inline-flex rounded-lg p-1.5 hover:bg-opacity-20 ${
            type === 'success' ? 'hover:bg-green-200' : 'hover:bg-red-200'
          }`}
        >
          <BiX className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Snackbar;
