import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import { database, ref, push } from '../config/firebaseConfig.ts';  

export const Newsletter: React.FC = () => {

  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter a valid email address.');
      return;
    }
  
    try {
      const emailRef = ref(database, 'emails');
      await push(emailRef, { email });
      setMessage('Thank you for subscribing!');
      setEmail('');
    } catch (error) {
      console.error('Error storing email:', error);
      setMessage('Something went wrong. Please try again.');
    }
  };

  return (
    <section className="py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="container mx-auto max-w-4xl text-center"
      >
        <h2 className="text-4xl font-bold mb-6">
          Join the Future of Translation
        </h2>
        <p className="text-xl text-gray-400 mb-12">
          Be the first to experience our revolutionary AI translation platform
        </p>
        <form onSubmit={handleSubmit} className="flex gap-4 max-w-lg mx-auto">
          <input
            type="email"
            placeholder="Enter your email"
            className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button
            type="submit"
            className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-medium transition-all duration-300 flex items-center gap-2"
          >
            <span>Join</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
        {message && <p className="mt-4 text-sm text-white-400">{message}</p>}
      </motion.div>
    </section>
  );
};
