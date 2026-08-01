import React from 'react';
import { useLoader } from '../context/LoaderContext';

const Loader = ({ forceShow = false, text = '', type = 'bar' }) => {
  const context = useLoader();
  
  const isLoading = forceShow || context?.isLoading || false;
  const progress = context?.progress || 0;

  if (!isLoading) return null;

  if (type === 'spinner' || type === 'youtube') {
    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xs">
        <div className="flex flex-col items-center gap-3 bg-white dark:bg-zinc-900 px-6 py-5 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-zinc-800">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 rounded-full border-2 border-red-500/20" />
            <div className="absolute inset-0 rounded-full border-2 border-red-600 border-t-transparent animate-spin shadow-[0_0_12px_rgba(239,68,68,0.6)]" />
          </div>
          {text && <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase">{text}</p>}
        </div>
      </div>
    );
  }

  // Default: YouTube Top Red Progress Bar
  return (
    <div className="fixed top-0 left-0 w-full z-[99999] pointer-events-none">
      <div 
        className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-amber-500 shadow-[0_0_12px_rgba(239,68,68,0.8),0_0_6px_rgba(245,158,11,0.6)] transition-all duration-300 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Peg (Glowing Head Effect) */}
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-transparent to-white opacity-80 shadow-[0_0_12px_#ff0000]" />
      </div>
    </div>
  );
};

export default Loader;