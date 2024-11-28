import React from 'react';
import { Globe, MessageSquare, Code2, Zap } from 'lucide-react';

export const HeroIllustration: React.FC = () => (
  <div className="relative w-full h-64 md:h-80 mb-8">
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="relative w-48 h-48 md:w-64 md:h-64 animate-[spin_20s_linear_infinite]">
        <Globe className="absolute top-0 left-1/4 -translate-x-1/2 w-12 h-12 md:w-16 md:h-16 text-purple-300" />
        <MessageSquare className="absolute bottom-0 left-0 w-12 h-12 md:w-16 md:h-16 text-purple-300" />
        <Code2 className="absolute bottom-0 right-0 w-12 h-12 md:w-16 md:h-16 text-purple-300" />
        <div className="absolute inset-0 rounded-full border-4 border-dashed border-white-300 animate-[spin_30s_linear_infinite_reverse]" />
      </div>
    </div>
    <div className="absolute inset-0 flex items-center justify-center">
      {['EN', 'ES', 'FR', 'DE', 'JP', '中文'].map((lang, i) => (
        <div
          key={lang}
          className="absolute text-sm font-mono font-semibold text-white"
          style={{
            transform: `rotate(${i * 60}deg) translateY(-80px) rotate(-${i * 60}deg)`,
          }}
        >
          {lang}
        </div>
      ))}
    </div>
  </div>
);