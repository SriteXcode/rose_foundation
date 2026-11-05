import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowRight } from 'lucide-react';
import { GallerySkeleton } from './SkeletonLoader';
import ImageLightboxModal from './modals/ImageLightboxModal';

const GallerySection = ({ limit = 6 }) => {
  const navigate = useNavigate();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(null);

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
          <div className="columns-2 sm:columns-3 md:columns-4 gap-4">
            {displayItems.map((item, index) => {
              const rawUrl = item.imageUrl;
              const optimizedUrl = getOptimizedImageUrl(rawUrl, { width: 600 });

              return (
                <div
                  key={`${item._id || index}-${index}`}
                  onClick={() => setLightboxIndex(index)}
                  className="break-inside-avoid mb-4 bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden cursor-pointer group relative border border-gray-200/70 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <img 
                    src={optimizedUrl} 
                    alt={item.title || 'Gallery Moment'} 
                    loading="lazy" 
                    className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-500 block" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 sm:p-4">
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

      {/* Seamless Infinite Loop Lightbox Modal */}
      <ImageLightboxModal
        items={displayItems}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </section>
  );
};

export default GallerySection;
