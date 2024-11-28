import React from 'react';
import { Github, Twitter, Linkedin } from 'lucide-react';

export const SocialLinks: React.FC = () => (
  <div className="flex gap-4">
    {[
      { Icon: Twitter, href: '#', label: 'Twitter' },
      { Icon: Github, href: '#', label: 'GitHub' },
      { Icon: Linkedin, href: '#', label: 'LinkedIn' },
    ].map(({ Icon, href, label }) => (
      <a
        key={label}
        href={href}
        aria-label={label}
        className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-gray-100 text-gray-600 hover:text-indigo-600 hover:bg-white hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300"
      >
        <Icon className="w-5 h-5" />
      </a>
    ))}
  </div>
);