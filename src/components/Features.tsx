import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Globe, Zap, Lock, Code, GitBranch } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Translation',
      description: 'Context-aware translations that capture nuance and tone perfectly'
    },
    {
      icon: Globe,
      title: 'Global Ready',
      description: 'Support for all major languages and regional variants out of the box'
    },
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Real-time translations with sub-10ms response times'
    },
    {
      icon: Lock,
      title: 'Enterprise Security',
      description: 'Bank-grade encryption and data protection standards'
    },
    {
      icon: Code,
      title: 'Developer First',
      description: 'Beautiful APIs and SDKs that developers actually want to use'
    },
    {
      icon: GitBranch,
      title: 'Version Control',
      description: 'Built-in versioning and rollback capabilities for peace of mind'
    }
  ];

  return (
    <section className="py-20 px-6 bg-white/5">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {features.map(({ icon: Icon, title, description }, index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group p-6 rounded-2xl bg-gradient-to-b from-white/10 to-transparent backdrop-blur-sm border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400 group-hover:text-purple-300 transition-colors">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{title}</h3>
                  <p className="text-gray-400 leading-relaxed">{description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};