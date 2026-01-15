import React from 'react';
import { useLoader } from '../context/LoaderContext';

const Loader = ({ forceShow = false, text = '', type = 'bar' }) => {
  const context = useLoader();
  
  const isLoading = forceShow || context?.isLoading || false;
  const progress = context?.progress || 0;

  if (!isLoading) return null;

  if (type === 'spinner') {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
        <div className="flex flex-col items-center">
           <div className="w-12 h-12 border-4 border-gray-200 border-t-rose-600 rounded-full animate-spin"></div>
           {text && <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>}
        </div>
      </div>
    );
  }

  // Default: Top Progress Bar (NProgress style)
  return (
    <div className="fixed top-0 left-0 w-full z-[9999] pointer-events-none">
      <div 
        className="h-1 bg-rose-600 shadow-[0_0_10px_#e11d48] transition-all duration-200 ease-out"
        style={{ width: `${progress}%` }}
      >
        {/* Peg (shiny end) */}
        <div className="absolute right-0 top-0 h-full w-20 translate-x-10 rotate-3 bg-rose-600 opacity-100 shadow-[0_0_10px_#e11d48]"></div>
      </div>
    </div>
  );
};

export default Loader;