import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowRight, X } from 'lucide-react';
import { GallerySkeleton } from './SkeletonLoader';

const GallerySection = ({ limit = 6 }) => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(`/gallery?page=1&limit=${limit}`);
        const { items, totalItems } = response.data;
        
        if (items && items.length > 0) {
          setGalleryItems(items);
          setHasMore(totalItems > limit || items.length >= limit);
        } else {
          setGalleryItems([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
        setGalleryItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [limit]);

  const displayItems = galleryItems;

  return (
    <section id="gallery" className="py-4 md:py-6 bg-fafafa dark:bg-zinc-950 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-8">
          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
            Moments
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
            Gallery
          </h2>
        </div>

        {/* Responsive Masonry Layout */}
        {loading ? (
          <GallerySkeleton count={limit} />
        ) : displayItems.length > 0 ? (
          <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-4 gap-3 space-y-3">
            {displayItems.map((item, index) => {
              const rawUrl = item.imageUrl;
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
                    className="w-full h-auto transform group-hover:scale-105 transition-transform duration-500 block rounded-2xl" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 sm:p-4">
                    <span className="text-white font-semibold text-xs">
                      {item.title || 'Rose Foundation'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-zinc-400">
            No gallery images available at this time.
          </div>
        )}

        {(hasMore || displayItems.length >= 6) && (
          <div className="text-center mt-8">
            <button 
              onClick={() => navigate('/gallery')}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-300 dark:border-zinc-700 px-6 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer group"
            >
              <span>View Full Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fadeIn" onClick={() => setSelectedImage(null)}>
          <button 
            className="absolute top-6 right-6 text-white/80 hover:text-white p-2 rounded-full bg-white/10 transition-colors z-[70] cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden">
              <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-contain" />
            </div>
            <div className="p-6 bg-white dark:bg-zinc-900 border-t border-gray-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">{selectedImage.title || 'Gallery Image'}</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-wider">{selectedImage.category || 'Rose Foundation'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;
