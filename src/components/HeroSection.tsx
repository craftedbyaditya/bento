import React from "react";
import { motion } from "framer-motion";
import { HeroIllustration } from "./HeroIllustration";

export const HeroSection: React.FC = () => (
  <section className="min-h-screen pt-32 pb-20 px-6">
    <div className="container mx-auto relative">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2 }}
        className="max-w-4xl mx-auto text-center"
      >
        <HeroIllustration />
        <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
          Translate Everything.
          <br />
          <span className="text-white">Powered by AI.</span>
        </h1>

        <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
          One platform to localize your apps, websites, and content using
          advanced AI. Ship faster, reach further.
        </p>

      
      </motion.div>
    
    </div>
  </section>
);
