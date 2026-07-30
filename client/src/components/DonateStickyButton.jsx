import React from 'react';

const DonateStickyButton = ({ scrollToSection }) => {
  return (
    <button
      onClick={() => scrollToSection('donate')}
      className="fixed bottom-6 right-6 z-40 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-2.5 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-xs font-bold tracking-wide border border-zinc-700/50 dark:border-zinc-300/50 cursor-pointer group"
      aria-label="Donate Now"
    >
      <span className="text-xl">💝</span>
      
      {/* Tooltip */}
      <span className="absolute right-full mr-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap pointer-events-none font-bold">
        Instant Donate
      </span>
    </button>
  );
};

export default DonateStickyButton;
