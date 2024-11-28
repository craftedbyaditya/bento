import React from 'react';
import { Sparkles, Globe, Code, GitBranch } from 'lucide-react';

export const FeatureGrid: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI Translation',
      description: 'Harness the power of AI for accurate, context-aware translations'
    },
    {
      icon: Globe,
      title: '40+ Languages',
      description: 'Support for all major languages and regional variants'
    },
    {
      icon: Code,
      title: 'Developer First',
      description: 'Seamless integration with your existing workflow'
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Built-in versioning for testing and deployment'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
      {features.map(({ icon: Icon, title, description }) => (
        <div
          key={title}
          className="group p-4 rounded-xl border border-gray-100 bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-lg hover:shadow-sky-100/50 transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-50 to-sky-50 group-hover:from-indigo-100 group-hover:to-sky-100 transition-colors">
              <Icon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};