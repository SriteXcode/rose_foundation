import React from 'react';

// YouTube-style Card Skeleton Loader with Shimmer
export const CardSkeleton = ({ count = 4, columns = "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4", aspectRatio = "aspect-square" }) => {
  return (
    <div className={`grid ${columns} gap-3 sm:gap-4 w-full`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-xl sm:rounded-2xl p-2.5 sm:p-3 shadow-xs overflow-hidden text-left relative">
          {/* Thumbnail Box */}
          <div className={`${aspectRatio} w-full rounded-lg sm:rounded-xl bg-gray-200 dark:bg-zinc-800 relative overflow-hidden mb-2.5`}>
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

// Full Page Skeleton Loader (Replaces Spinner)
export const PageSkeleton = ({ text = "Loading..." }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 p-4 sm:p-8 space-y-6 max-w-7xl mx-auto pt-24">
      {/* Header Skeleton */}
      <div className="space-y-3 max-w-xl">
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
        </div>
        <div className="h-8 bg-gray-200 dark:bg-zinc-800 rounded-lg w-3/4 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
        </div>
        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-md w-1/2 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 dark:via-zinc-700/30 to-transparent animate-shimmer" />
        </div>
      </div>
      {/* Content Cards Skeleton */}
      <CardSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" aspectRatio="aspect-[16/9]" />
    </div>
  );
};

// Export YouTubeSpinner as PageSkeleton alias for backwards compatibility
export const YouTubeSpinner = ({ text = "Loading..." }) => {
  return <PageSkeleton text={text} />;
};

export default CardSkeleton;
