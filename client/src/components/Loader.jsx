import React from 'react';
import { useLoader } from '../context/LoaderContext';

const Loader = () => {
  const { isLoading, progress } = useLoader();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
      <div className="flex flex-col items-center justify-center">
        {/* Spinner */}
        <div className="relative w-24 h-24">
          <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-200 rounded-full opacity-20"></div>
          <div 
            className="absolute top-0 left-0 w-full h-full border-4 border-t-rose-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"
            style={{ borderTopColor: '#e11d48' }} // Rose-600
          ></div>
          
          {/* Percentage Text in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-lg">{progress}%</span>
          </div>
        </div>
        
        <h3 className="mt-4 text-white text-xl font-semibold tracking-wider animate-pulse">
          Loading...
        </h3>
      </div>
    </div>
  );
};

export default Loader;
