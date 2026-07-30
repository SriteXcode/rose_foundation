import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { Search, X, Filter } from 'lucide-react';

const defaultGallery = [
  { imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800', title: 'Community Distribution', category: 'Outreach' },
  { imageUrl: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=800', title: 'Youth Skill Building', category: 'Education' },
  { imageUrl: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=800', title: 'Empowerment Workshop', category: 'Workshop' },
  { imageUrl: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800', title: 'Education Camp', category: 'Education' },
  { imageUrl: 'https://images.unsplash.com/photo-1576267423445-b2e0074d68a4?auto=format&fit=crop&q=80&w=800', title: 'Relief Drive', category: 'Relief' },
  { imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800', title: 'Health Support', category: 'Health' },
  { imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800', title: 'Leadership Seminar', category: 'Workshop' },
  { imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800', title: 'Volunteer Orientation', category: 'Outreach' },
];

const GalleryPage = () => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/gallery?limit=1000');
        const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
        
        if (data && data.length > 0) {
          setGalleryItems(data);
          setFilteredItems(data);
        } else {
          setGalleryItems(defaultGallery);
          setFilteredItems(defaultGallery);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
        setGalleryItems(defaultGallery);
        setFilteredItems(defaultGallery);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    let result = galleryItems;
    if (activeFilter !== 'All') {
      result = result.filter(item => item.category === activeFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(item => (item.title && item.title.toLowerCase().includes(q)) || (item.category && item.category.toLowerCase().includes(q)));
    }
    setFilteredItems(result);
  }, [activeFilter, searchTerm, galleryItems]);

  const displayItems = filteredItems.length > 0 ? filteredItems : (galleryItems.length > 0 ? galleryItems : defaultGallery);
  
  // Extract unique valid categories
  const categories = ['All', ...new Set(galleryItems.map(item => item.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Parallel Search & Dropdown Filter */}
        <div className="mb-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
                Visual Journey
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Our Gallery
              </h1>
            </div>

            {/* Parallel Search Bar & Filter Dropdown */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search gallery..."
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
            A comprehensive showcase of our on-the-ground impact, community drives, and empowerment workshops.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium text-zinc-400">
            Loading moments...
          </div>
        ) : (
          /* Masonry Layout across all screen sizes */
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-3 space-y-3">
            {displayItems.map((item, index) => {
              const rawUrl = item.imageUrl || defaultGallery[index % defaultGallery.length].imageUrl;
              const optimizedUrl = getOptimizedImageUrl(rawUrl, { width: 600 });

              return (
                <div 
                  key={`${item._id || index}-${index}`} 
                  onClick={() => setSelectedImage(item)}
                  className="break-inside-avoid bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer group relative border border-gray-200/70 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all"
                >
                  <img 
                    src={optimizedUrl} 
                    alt={item.title || 'Gallery Moment'} 
                    loading="lazy" 
                    className="w-full h-auto max-h-[220px] sm:max-h-[190px] md:max-h-[170px] lg:max-h-[180px] object-cover transform group-hover:scale-105 transition-transform duration-700 block" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 sm:p-4">
                    <span className="text-white font-bold text-xs">
                      {item.title || 'Rose Foundation'}
                    </span>
                    {item.category && (
                      <span className="text-[10px] uppercase font-semibold tracking-wider text-zinc-300 mt-0.5 block">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" 
          onClick={() => setSelectedImage(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition-colors z-[70] cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div 
            className="w-full max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-left" 
            onClick={e => e.stopPropagation()}
          >
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[300px]">
              <img 
                src={selectedImage.imageUrl || defaultGallery[0].imageUrl} 
                alt={selectedImage.title} 
                className="w-full h-full max-h-[70vh] object-contain" 
              />
            </div>
            
            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
              <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white mb-1">
                {selectedImage.title || 'Gallery Moment'}
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">
                  {selectedImage.category || 'Rose Foundation'}
                </span>
                {selectedImage.project && (
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 font-normal">
                    • Project: {selectedImage.project.title}
                  </span>
                )}
              </div>
              {selectedImage.description && (
                <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {selectedImage.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;