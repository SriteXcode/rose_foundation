import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { Heart, ArrowRight } from 'lucide-react';
import { CardSkeleton } from './SkeletonLoader';

const ProjectDetailsModal = lazy(() => import('./modals/ProjectDetailsModal'));

const WorksSection = ({ limit = 10 }) => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [likedProjects, setLikedProjects] = useState({});

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/works?page=1&limit=${limit}`);
        const { works: newWorks, totalWorks } = response.data;
        
        if (newWorks && Array.isArray(newWorks)) {
          setWorks(newWorks);
          setHasMore(totalWorks > limit);
        } else {
          setWorks([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to fetch works:', error);
        setWorks([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, [limit]);

  const toggleLike = (e, idx) => {
    e.stopPropagation();
    setLikedProjects(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <section id="works" className="py-4 md:py-6 bg-fafafa dark:bg-zinc-950 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
              Our Impact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Our works in action
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-xs sm:text-right">
            Explore the programs shaping brighter futures across our communities.
          </p>
        </div>

        {/* Loading / Works Grid / Empty State */}
        {loading ? (
          <CardSkeleton count={limit > 2 ? 4 : 2} columns="grid-cols-1 md:grid-cols-2" aspectRatio="aspect-[16/9]" />
        ) : works.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {works.map((work, index) => {
              const imgSrc = work.images?.[0] || work.image || '';
              const optimizedUrl = imgSrc ? getOptimizedImageUrl(imgSrc, { width: 800, height: 500 }) : '';
              const isLiked = likedProjects[index];

              return (
                <div 
                  key={`${work._id || index}-${index}`} 
                  onClick={() => setSelectedProject(work)}
                  className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 rounded-2xl p-2.5 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col"
                >
                  <div className="aspect-[16/9] max-h-[220px] md:max-h-[200px] lg:max-h-[220px] w-full rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                    {optimizedUrl ? (
                      <img 
                        src={optimizedUrl} 
                        alt={work.title} 
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                    <button
                      onClick={(e) => toggleLike(e, index)}
                      aria-label="Save project"
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:scale-110 transition-all shadow-sm cursor-pointer"
                    >
                      <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>
                  </div>

                  <div className="p-3.5 flex flex-col flex-1 justify-between">
                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1.5 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">
                        {work.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">
                        {work.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-zinc-400">
            <p className="text-sm font-medium">No works available at the moment.</p>
          </div>
        )}

        {hasMore && (
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/projects')}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-300 dark:border-zinc-700 px-6 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer group"
            >
              <span>View All Projects</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

      <Suspense fallback={null}>
        {selectedProject && (
          <ProjectDetailsModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </Suspense>
    </section>
  );
};

export default WorksSection;

