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
        <div className="flex flex-col items-center gap-3 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-xl border border-gray-200/80 dark:border-zinc-800 w-80 text-left">
          <div className="w-full space-y-3">
            <div className="aspect-video w-full rounded-xl bg-gray-200 dark:bg-zinc-800 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
            </div>
            <div className="h-3.5 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
            </div>
            <div className="h-3 bg-gray-150 dark:bg-zinc-800/60 rounded-md w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
            </div>
          </div>
          {text && <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 tracking-wider uppercase mt-1">{text}</p>}
        </div>
      </div>
    );
  }

  // Default: YouTube Top Red Progress Bar (Glow Removed)
  return (
    <div className="fixed top-0 left-0 w-full z-[99999] pointer-events-none">
      <div 
        className="h-[3px] bg-gradient-to-r from-red-600 via-red-500 to-amber-500 transition-all duration-300 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        {/* Peg Head Effect (No Glow) */}
        <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-r from-transparent to-white opacity-80" />
      </div>
    </div>
  );
};

export default Loader;