import React from 'react';

// YouTube-style Card Skeleton Loader with Shimmer
export const CardSkeleton = ({ count = 4, columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4" }) => {
  return (
    <div className={`grid ${columns} gap-3 sm:gap-4 w-full`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xs overflow-hidden text-left relative">
          {/* Thumbnail Box */}
          <div className="aspect-square w-full rounded-lg sm:rounded-xl bg-gray-200 dark:bg-zinc-800 relative overflow-hidden mb-2.5">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
          </div>
          {/* Content Lines */}
          <div className="space-y-2 px-0.5">
            <div className="h-3 bg-gray-200 dark:bg-zinc-800 rounded-md w-3/4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
            </div>
            <div className="h-2.5 bg-gray-150 dark:bg-zinc-800/60 rounded-md w-1/2 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// YouTube-style Masonry / Grid Gallery Skeleton
export const GallerySkeleton = ({ count = 8 }) => {
  return (
    <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i} 
          className={`break-inside-avoid bg-gray-200 dark:bg-zinc-800 rounded-2xl overflow-hidden relative border border-gray-200 dark:border-zinc-800 ${
            i % 3 === 0 ? 'h-48' : i % 3 === 1 ? 'h-64' : 'h-56'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-zinc-700/30 to-transparent animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

// YouTube Minimal Red Ring Spinner
export const YouTubeSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="relative w-9 h-9">
        <div className="absolute inset-0 rounded-full border-2 border-red-500/20" />
        <div className="absolute inset-0 rounded-full border-2 border-red-600 border-t-transparent animate-spin shadow-[0_0_12px_rgba(239,68,68,0.5)]" />
      </div>
      {text && <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 tracking-widest uppercase">{text}</span>}
    </div>
  );
};

export default CardSkeleton;
