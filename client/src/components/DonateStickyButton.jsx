import React from 'react';

const DonateStickyButton = ({ scrollToSection }) => {
  return (
    <button
      onClick={() => scrollToSection('donate')}
      className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2 text-xs font-bold tracking-wide border border-zinc-700/50 dark:border-zinc-300/50 cursor-pointer group"
      aria-label="Donate Now"
    >
      <span className="text-sm">💝</span>
      <span>Donate Now</span>
    </button>
  );
};

export default DonateStickyButton;
