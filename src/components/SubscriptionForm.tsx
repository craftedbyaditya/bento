import React, { useState } from 'react';
import { Send } from 'lucide-react';

export const SubscriptionForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('success');
    setEmail('');
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        className="w-full px-4 py-3 pr-32 rounded-xl bg-white shadow-sm border border-gray-100 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all duration-300"
        required
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-1.5 bg-gradient-to-r from-indigo-600 to-sky-600 text-white rounded-lg flex items-center gap-2 hover:from-indigo-700 hover:to-sky-700 transition-all duration-300 font-medium text-sm"
      >
        <span>Join</span>
        <Send className="w-4 h-4" />
      </button>
      {status === 'success' && (
        <p className="absolute -bottom-6 left-0 text-sm text-indigo-600 font-medium">
          Thanks for subscribing!
        </p>
      )}
    </form>
  );
};