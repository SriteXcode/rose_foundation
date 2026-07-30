import React, { useState } from 'react';
import { X, Users, MapPin } from 'lucide-react';

const ProjectDetailsModal = ({ project, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  const allImages = [];
  if (project.icon) allImages.push(project.icon);
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => {
      if (img !== project.icon) allImages.push(img);
    });
  }

  const hasImages = allImages.some(img => img.startsWith('http'));

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6" onClick={onClose}>
      <div 
        className="bg-white dark:bg-zinc-900 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl overflow-hidden border border-gray-100 dark:border-zinc-800 text-left animate-fadeIn"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Side Image Section */}
        <div className="w-full md:w-1/2 bg-gray-50 dark:bg-zinc-950 p-4 flex flex-col items-center justify-center relative shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-zinc-800">
          {hasImages ? (
            <div className="w-full flex flex-col items-center justify-center">
              <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm bg-white dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800">
                {allImages[activeImageIndex]?.startsWith('http') ? (
                  <img 
                    src={allImages[activeImageIndex]} 
                    alt={project.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl">
                    {allImages[activeImageIndex]}
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full pt-3 px-1">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        activeImageIndex === idx ? 'border-zinc-900 dark:border-white scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      {img.startsWith('http') ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm bg-gray-100 dark:bg-zinc-800">{img}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-7xl py-12">{project.icon || '🌟'}</div>
          )}
        </div>

        {/* Right Side Content Section */}
        <div className="w-full md:w-1/2 flex flex-col h-full relative bg-white dark:bg-zinc-900 overflow-hidden">
          
          {/* Header */}
          <div className="p-6 pb-4 border-b border-gray-100 dark:border-zinc-800 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    project.status === 'completed' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white' : 
                    'bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                }`}>
                  {project.status || 'Active'}
                </span>
                {project.category && (
                  <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-zinc-500 text-[10px] font-semibold uppercase tracking-wider">
                    {project.category}
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                {project.title}
              </h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Description */}
          <div className="flex-1 overflow-y-auto p-6 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
            {project.description}
          </div>

          {/* Footer Stats */}
          <div className="p-4 sm:p-6 bg-gray-50/70 dark:bg-zinc-950/70 border-t border-gray-100 dark:border-zinc-800 flex justify-between items-center text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Beneficiaries</span>
                <span className="font-extrabold text-zinc-900 dark:text-white">{project.beneficiaries?.toLocaleString() || 0}+</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-sm">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 font-semibold uppercase block">Location</span>
                <span className="font-bold text-zinc-900 dark:text-white">{project.location || 'India'}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;

