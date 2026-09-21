import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { Search, ArrowRight, Filter, FolderHeart } from 'lucide-react';
import Footer from '../components/Footer';
import { CardSkeleton } from '../components/SkeletonLoader';
import SEO from '../components/SEO';

// Lazy load ProjectDetailsModal
const ProjectDetailsModal = lazy(() => import('../components/modals/ProjectDetailsModal'));

const ProjectsPage = () => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchWorks = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/works?limit=1000');
        const data = Array.isArray(response.data) ? response.data : (response.data.works || []);
        
        if (data && data.length > 0) {
          setWorks(data);
          setFilteredWorks(data);
        } else {
          setWorks([]);
          setFilteredWorks([]);
        }
      } catch (error) {
        console.error('Failed to fetch works:', error);
        setWorks([]);
        setFilteredWorks([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    let result = works;
    if (activeFilter !== 'All') {
      result = result.filter(work => work.category === activeFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(work => 
        (work.title && work.title.toLowerCase().includes(q)) || 
        (work.description && work.description.toLowerCase().includes(q)) ||
        (work.category && work.category.toLowerCase().includes(q))
      );
    }
    setFilteredWorks(result);
  }, [activeFilter, searchTerm, works]);

  const displayWorks = filteredWorks;
  const categories = ['All', ...new Set(works.map(work => work.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-20 sm:pt-24 pb-16">
      <SEO 
        title="Our Projects &amp; Social Initiatives" 
        description="Explore Blackrose Foundation's active community welfare projects spanning education, health drives, environmental sustainability, and women empowerment." 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Parallel Search & Dropdown Filter */}
        <div className="mb-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
                Social Initiatives
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Our Projects
              </h1>
            </div>

            {/* Parallel Search Bar & Filter Dropdown */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search projects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>

              {categories.length > 1 && (
                <div className="relative">
                  <select
                    value={activeFilter}
                    onChange={(e) => setActiveFilter(e.target.value)}
                    className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer appearance-none pr-8"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat === 'All' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                  <Filter className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              )}
            </div>
          </div>

          {/* Description Text Below Hero Title */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
            Discover our active and completed initiatives bringing real transformation across communities.
          </p>
        </div>

        {/* Projects Grid */}
        {loading ? (
          <CardSkeleton count={6} columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3" aspectRatio="aspect-[16/9]" />
        ) : displayWorks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {displayWorks.map((work, index) => {
              const mainImg = (work.images?.[0] || work.icon || work.image || '');
              const imgSrc = mainImg?.startsWith('http')
                ? getOptimizedImageUrl(mainImg, { width: 600, height: 400 })
                : mainImg;

              return (
                <div 
                  key={work._id || index} 
                  onClick={() => setSelectedProject(work)}
                  className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group flex flex-col cursor-pointer"
                >
                  <div className="aspect-[16/9] max-h-[190px] md:max-h-[180px] lg:max-h-[190px] overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                    {imgSrc ? (
                      <img 
                        src={imgSrc} 
                        alt={work.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                        No image
                      </div>
                    )}
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-2.5">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                        {work.category || 'General'}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        work.status === 'completed' || work.status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400'
                      }`}>
                        {work.status || 'Active'}
                      </span>
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
                      {work.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
                      {work.description}
                    </p>
                    
                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            <FolderHeart className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-base font-semibold">No projects found in this category.</p>
          </div>
        )}

      </div>

      <div className="mt-16">
        <Footer />
      </div>

      <Suspense fallback={null}>
        {selectedProject && (
          <ProjectDetailsModal 
            project={selectedProject} 
            onClose={() => setSelectedProject(null)} 
          />
        )}
      </Suspense>
    </div>
  );
};

export default ProjectsPage;
