import React from 'react';

const DonateStickyButton = ({ scrollToSection }) => {
  return (
    <button
      onClick={() => scrollToSection('donate')}
      className="fixed bottom-24 right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 transform hover:scale-110 flex items-center justify-center group"
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
