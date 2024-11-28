import { motion } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface WaitlistPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WaitlistPopup({ isOpen, onClose }: WaitlistPopupProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
        
        <div className="text-center">
          <div className="mb-6 inline-block bg-indigo-100 p-3 rounded-full">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to the Future of Translation!
          </h2>
          
          <p className="text-gray-600 mb-6">
            You're among an exclusive group of early adopters who will shape the future of AI-powered translation. As a token of our appreciation, we're giving you:
          </p>
          
          <div className="bg-indigo-50 rounded-lg p-4 mb-6">
            <p className="text-indigo-700 font-semibold">
              ✨ 30 Days of Premium Access ✨
            </p>
          </div>
          
          <p className="text-sm text-gray-500">
            Keep an eye on your inbox for your exclusive access details and updates on our launch.
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}