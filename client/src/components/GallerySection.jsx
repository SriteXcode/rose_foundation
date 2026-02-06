import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const GallerySection = ({ limit = 10 }) => {
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
          setHasMore(totalItems > limit);
        } else {
            // Fallback
            setGalleryItems([
              { imageUrl: '📚', type: 'icon' }, { imageUrl: '🏥', type: 'icon' }, 
              { imageUrl: '👩‍🏫', type: 'icon' }, { imageUrl: '🌱', type: 'icon' },
              { imageUrl: '🤝', type: 'icon' }, { imageUrl: '🎓', type: 'icon' },
              { imageUrl: '💊', type: 'icon' }, { imageUrl: '🏘️', type: 'icon' }
            ]);
            setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, [limit]);

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
          Gallery
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {galleryItems.map((item, index) => {
            const optimizedUrl = getOptimizedImageUrl(item.imageUrl);
            const isImage = optimizedUrl && optimizedUrl.startsWith('http');
            
            return (
            <div
              key={`${item._id || index}-${index}`}
              onClick={() => setSelectedImage(item)}
              className="aspect-square bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl md:text-6xl cursor-pointer transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden"
            >
              {/* Check if it's a real image URL or an emoji icon fallback */}
              {isImage ? (
                <img src={optimizedUrl} alt={item.title || 'Gallery Item'} loading="lazy" className="w-full h-full object-cover" width="300" height="300" />
              ) : (
                <span>{item.imageUrl}</span>
              )}
            </div>
          )})}
          
          {loading && Array.from({ length: limit }).map((_, i) => (
             <div key={`skeleton-${i}`} className="aspect-square bg-gray-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>

        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button 
              onClick={() => navigate('/gallery')}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              View Full Gallery
            </button>
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white text-4xl hover:text-red-500 transition-colors z-[70] p-2 bg-black/50 rounded-full">✕</button>
          <div className="w-full max-w-md bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-fadeIn" onClick={e => e.stopPropagation()}>
            <div className="flex-1 bg-black flex items-center justify-center overflow-hidden relative">
              {selectedImage.imageUrl?.startsWith('http') ? (
                <img src={selectedImage.imageUrl} alt={selectedImage.title} className="w-full h-full object-contain" />
              ) : (
                <div className="text-9xl text-white select-none">{selectedImage.imageUrl}</div>
              )}
            </div>
            <div className="p-6 bg-white border-t border-gray-100">
              <h3 className="text-2xl font-bold text-gray-900 leading-tight mb-2">{selectedImage.title || 'Gallery Image'}</h3>
              <p className="text-red-600 font-medium uppercase tracking-wider text-sm">{selectedImage.category || 'Rose Foundation'}</p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default GallerySection;