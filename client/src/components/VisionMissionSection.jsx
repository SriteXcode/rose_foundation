import React from 'react';
import { Eye, Target } from 'lucide-react';

const VisionMissionSection = () => (
  <section id="vision" className="py-4 md:py-6 bg-fafafa dark:bg-zinc-950 transition-colors">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
        
        {/* Our Vision Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-900 dark:text-white">
            <Eye className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Our Vision
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
            A world where every community thrives with equal access to opportunity, education and dignity. We envision resilient societies where no one is left behind.
          </p>
        </div>

        {/* Our Mission Card */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 p-6 sm:p-8 rounded-2xl shadow-sm hover:shadow-md transition-all">
          <div className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4 text-zinc-900 dark:text-white">
            <Target className="w-5 h-5 stroke-[1.8]" />
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-white mb-2">
            Our Mission
          </h3>
          <p className="text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm leading-relaxed">
            To empower underserved communities through targeted programs in education, relief and healthcare — building capacity that lasts for generations to come.
          </p>
        </div>

      </div>

    </div>
  </section>
);

export default VisionMissionSection;