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
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col md:flex-row shadow-2xl animate-fade-in overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Image Section - Sticky/Fixed on Desktop */}
        <div className="w-full md:w-1/2 bg-gray-100 p-4 flex flex-col items-center justify-center relative md:h-full">
          {hasImages ? (
            <div className="w-full flex flex-col items-center justify-center h-full">
              <div className="w-full h-64 md:h-96 mb-4 rounded-xl overflow-hidden shadow-lg bg-white">
                {allImages[activeImageIndex]?.startsWith('http') ? (
                  <img 
                    src={allImages[activeImageIndex]} 
                    alt={project.title} 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-6xl">
                    {allImages[activeImageIndex]}
                  </div>
                )}
              </div>
              
              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto w-full pb-2 px-2">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                        activeImageIndex === idx ? 'border-purple-600 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      {img.startsWith('http') ? (
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl bg-white">{img}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-8xl">{project.icon || '🌟'}</div>
          )}
        </div>

        {/* Content Section */}
        <div className="w-full md:w-1/2 flex flex-col h-full relative bg-white">
          {/* Sticky Header: Name, Category, Status */}
          <div className="sticky top-0 bg-white/40 backdrop-blur-md z-30 p-8 pb-6 border-b border-white/20">
            <div className="flex justify-between items-start">
              {/* Left Side: Project Name */}
              <h2 className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent leading-tight flex-1 mr-4">
                {project.title}
              </h2>

              {/* Right Side: Status, Category, and Close Button */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-sm inline-block ${
                    project.status === 'completed' ? 'bg-green-500 text-white' : 
                    project.status === 'planned' ? 'bg-blue-500 text-white' : 
                    'bg-amber-500 text-white'
                  }`}>
                    {project.status}
                  </span>
                  <button 
                    onClick={onClose}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all duration-300"
                  >
                    <span className="text-2xl block leading-none">✕</span>
                  </button>
                </div>
                
                {/* Category specifically below Status */}
                <span className="px-3 py-1 rounded-full bg-slate-100/80 text-slate-600 text-[10px] font-bold uppercase tracking-widest shadow-sm border border-slate-200">
                  {project.category}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Body - Description */}
          <div className="flex-1 overflow-y-auto p-8 pt-6 pb-32 custom-scrollbar">
            <div className="text-slate-600 leading-relaxed text-lg whitespace-pre-wrap">
              {project.description}
            </div>
          </div>

          {/* Sticky Bottom Stats */}
          <div className="absolute bottom-0 right-0 left-0 bg-white/95 backdrop-blur shadow-[0_-10px_30px_rgba(0,0,0,0.08)] z-40 p-6 border-t border-slate-100">
            <div className="flex justify-between items-center max-w-md mx-auto md:max-w-none">
              <div className="flex items-center space-x-3">
                <div className="bg-purple-100 p-2 rounded-lg text-purple-600 text-xl">👥</div>
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Impacted</p>
                  <p className="text-xl font-black text-purple-600">{project.beneficiaries?.toLocaleString() || 0}+</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 text-right">
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Location</p>
                  <p className="text-lg font-bold text-slate-700 truncate max-w-[150px] md:max-w-[200px]">{project.location || 'Global'}</p>
                </div>
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600 text-xl">📍</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;