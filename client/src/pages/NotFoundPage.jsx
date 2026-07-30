import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gray-100 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 text-zinc-900 dark:text-white font-extrabold text-2xl shadow-sm">
          404
        </div>

        {/* Heading & Content */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
            Error 404
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed max-w-sm mx-auto">
            The page you are looking for doesn't exist, was removed, or the link you clicked might be broken.
          </p>
        </div>

        {/* Return Home Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-6 py-3.5 rounded-full text-xs font-semibold transition-all shadow-sm group cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-gray-300 dark:border-zinc-700 px-6 py-3.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default NotFoundPage;
