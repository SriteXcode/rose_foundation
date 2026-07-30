import React from 'react';
import { Target, Scan, Users, Heart, Leaf, Lightbulb } from 'lucide-react';

const DifferenceSection = () => {
  const differences = [
    { 
      icon: Target, 
      title: 'Targeted Approach', 
      desc: 'Data-driven programs designed around the real needs of each community.' 
    },
    { 
      icon: Scan, 
      title: 'Full Transparency', 
      desc: 'Every donation is tracked and reported so you know exactly where your gift goes.' 
    },
    { 
      icon: Users, 
      title: 'Community Participation', 
      desc: 'We empower locals to lead, ensuring solutions are truly sustainable.' 
    },
    { 
      icon: Heart, 
      title: 'Grassroots Driven', 
      desc: 'Real change starts at the ground level, powered by people who care.' 
    },
    { 
      icon: Leaf, 
      title: 'Sustainable Solutions', 
      desc: 'Long-lasting impact over quick fixes, building capacity that endures.' 
    },
    { 
      icon: Lightbulb, 
      title: 'Innovation First', 
      desc: 'We embrace new ideas and technology to solve age-old challenges.' 
    }
  ];

  return (
    <section id="difference" className="py-4 md:py-6 bg-white dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Soft Container Card matching Screen 1 */}
        <div className="bg-gray-100/80 dark:bg-zinc-900/60 rounded-2xl p-6 sm:p-10 md:p-12 border border-gray-200/50 dark:border-zinc-800/60">
          
          <div className="text-center mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
              Why Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              What makes us different
            </h2>
          </div>

          {/* 6 Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {differences.map((diff, index) => {
              const IconComponent = diff.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white dark:bg-zinc-950 p-5 rounded-xl border border-gray-200/70 dark:border-zinc-800/80 shadow-sm hover:shadow-md transition-all text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-zinc-800/80 flex items-center justify-center mb-5 text-zinc-900 dark:text-white group-hover:scale-110 transition-transform">
                    <IconComponent className="w-5 h-5 stroke-[1.8]" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2">
                    {diff.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {diff.desc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};

export default DifferenceSection;