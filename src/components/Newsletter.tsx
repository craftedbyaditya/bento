import React from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';

export const Newsletter: React.FC = () => (
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
      
      <form className="flex gap-4 max-w-lg mx-auto">
        <input
          type="email"
          placeholder="Enter your email"
          className="flex-1 px-6 py-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
        />
        <button
          type="submit"
          className="px-8 py-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 font-medium transition-all duration-300 flex items-center gap-2"
        >
          <span>Join</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </motion.div>
  </section>
);