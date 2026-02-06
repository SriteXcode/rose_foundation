import React, { useState } from 'react';

const ProjectDetailsModal = ({ project, onClose }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!project) return null;

  // Combine icon and images for the gallery
  const allImages = [];
  if (project.icon) allImages.push(project.icon);
  if (project.images && project.images.length > 0) {
    project.images.forEach(img => {
      if (img !== project.icon) allImages.push(img);
    });
  }

  const hasImages = allImages.some(img => img.startsWith('http'));

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl sm:rounded-2xl max-w-5xl w-full h-[90vh] sm:h-[85vh] flex flex-col md:flex-row shadow-2xl animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Section - Stacked on Mobile */}
        <div className="w-full md:w-1/2 bg-gray-50 p-2 sm:p-4 flex flex-col items-center justify-start sm:justify-center relative shrink-0">
          {hasImages ? (
            <div className="w-full flex flex-col items-center justify-center h-auto sm:h-full">
              <div className="w-full h-48 sm:h-64 md:h-96 mb-2 sm:mb-4 rounded-lg sm:rounded-xl overflow-hidden shadow-lg bg-white mt-2 sm:mt-0">
                {allImages[activeImageIndex]?.startsWith('http') ? (
                  <img 
                    src={allImages[activeImageIndex]} 
                    alt={project.title} 
                    className="w-full h-full object-contain bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl sm:text-6xl">
                    {allImages[activeImageIndex]}
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full pb-1 px-1 custom-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 rounded-md sm:rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-purple-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {img.startsWith('http') ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg sm:text-xl bg-white">{img}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-6xl sm:text-8xl py-8 sm:py-0">{project.icon || '🌟'}</div>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col h-full relative bg-white overflow-hidden">
          {/* Sticky Header: Name, Category, Status */}
          <div className="sticky top-0 bg-white/95 backdrop-blur-md z-30 p-4 sm:p-6 border-b border-gray-100 shadow-sm">
            <div className="flex justify-between items-start gap-3">
              {/* Left Side: Project Name */}
              <h2 className="text-lg sm:text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight flex-1">
                {project.title}
              </h2>

              {/* Right Side: Close Button & Status Group */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                <button 
                  onClick={onClose}
                  className="p-1.5 sm:p-2 -mr-2 -mt-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                >
                  <span className="text-xl sm:text-2xl block leading-none">✕</span>
                </button>
                
                <div className="flex flex-row items-end gap-1.5">
                    <span className={`px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-widest shadow-sm border border-transparent ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700 border-green-200' : 
                        project.status === 'planned' ? 'bg-blue-100 text-blue-700 border-blue-200' : 
                        'bg-amber-100 text-amber-700 border-amber-200'
                    }`}>
                        {project.status}
                    </span>
                    <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-slate-50 text-slate-500 text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                        {project.category}
                    </span>
                </div>
              </div>
            </div>
          </div>

          {/* Scrollable Body - Description */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 pt-4 pb-24 sm:pb-32 custom-scrollbar">
            <div className="text-slate-600 leading-relaxed text-sm sm:text-base lg:text-lg whitespace-pre-wrap">
              {project.description}
            </div>
          </div>

          {/* Sticky Bottom Stats */}
          <div className="absolute bottom-0 right-0 left-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40 p-3 sm:p-6 border-t border-slate-100">
            <div className="flex justify-between items-center px-1 sm:px-2">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="bg-purple-50 p-1.5 sm:p-2 rounded-lg text-purple-600 text-lg sm:text-xl">👥</div>
                <div>
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Impacted</p>
                  <p className="text-base sm:text-xl font-black text-purple-600 leading-tight">{project.beneficiaries?.toLocaleString() || 0}+</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-3 text-right">
                <div className="text-right">
                  <p className="text-[9px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Location</p>
                  <p className="text-sm sm:text-lg font-bold text-slate-700 truncate max-w-[120px] sm:max-w-[200px] leading-tight">{project.location || 'Global'}</p>
                </div>
                <div className="bg-blue-50 p-1.5 sm:p-2 rounded-lg text-blue-600 text-lg sm:text-xl">📍</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;
