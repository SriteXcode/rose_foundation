import React, { useEffect, useState } from 'react';

const NewsletterProgress = ({ isSending, total, current, onClose }) => {
  if (!isSending) return null;

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  // Calculate stroke dashoffset for the circle
  // Radius 18, Circumference = 2 * PI * 18 ≈ 113
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed bottom-4 right-4 z-[9999] bg-white rounded-lg shadow-lg p-3 flex items-center gap-3 border border-gray-100 animate-slide-up">
      <div className="relative w-12 h-12">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="transparent"
          />
          {/* Progress Circle */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            stroke="#22c55e" // Green-500
            strokeWidth="4"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-700">
          {percentage}%
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-xs font-semibold text-gray-800">Sending Newsletter</span>
        <span className="text-[10px] text-gray-500">{current} / {total} emails</span>
      </div>

      {percentage === 100 && (
        <button 
          onClick={onClose}
          className="ml-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default NewsletterProgress;
