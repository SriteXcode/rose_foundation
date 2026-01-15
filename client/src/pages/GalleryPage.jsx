import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';

const GalleryPage = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axiosInstance.get('/gallery');
        setGalleryItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        console.error('Failed to fetch gallery:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredItems(galleryItems);
    } else {
      setFilteredItems(galleryItems.filter(item => item.category === activeFilter));
    }
  }, [activeFilter, galleryItems]);

  // Extract unique categories
  const categories = ['All', ...new Set(galleryItems.map(item => item.category))];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Gallery</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            A visual journey through our impactful moments and community activities.
          </p>
          <div className="w-24 h-1 bg-red-500 mx-auto mt-6"></div>
        </div>

        {/* Filter Buttons */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-red-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-xl text-gray-500">Loading gallery...</div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
            {filteredItems.map((item, index) => (
              <div 
                key={index} 
                className="break-inside-avoid rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 group relative"
                onClick={() => setSelectedImage(item)}
              >
                {item.imageUrl?.startsWith('http') ? (
                  <img src={item.imageUrl} alt={item.title} loading="lazy" className="w-full h-auto object-cover" />
                ) : (
                  <div className="w-full h-64 bg-gray-200 flex items-center justify-center text-6xl">{item.imageUrl}</div>
                )}
                
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 text-center">
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-sm opacity-90">{item.category}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelectedImage(null)}>
          <button className="absolute top-4 right-4 text-white text-4xl hover:text-red-500 transition-colors z-[70] p-2 bg-black/50 rounded-full">✕</button>
          
          <div className="max-w-5xl w-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <div className="relative group w-full flex justify-center">
              {selectedImage.imageUrl?.startsWith('http') ? (
                <img 
                  src={selectedImage.imageUrl} 
                  alt={selectedImage.title} 
                  className="max-h-[75vh] w-auto object-contain rounded-xl shadow-2xl border border-white/10" 
                />
              ) : (
                <div className="text-9xl text-white text-center bg-white/5 p-20 rounded-full">{selectedImage.imageUrl}</div>
              )}
            </div>

            {/* Info overlay below image */}
            <div className="mt-6 text-center text-white max-w-2xl px-4">
              <h3 className="text-3xl font-bold mb-2">{selectedImage.title}</h3>
              <div className="flex justify-center gap-3 items-center">
                <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold uppercase tracking-wider border border-white/10">
                  {selectedImage.category}
                </span>
                {selectedImage.project && (
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
                    Project: {selectedImage.project.title}
                  </span>
                )}
              </div>
              {selectedImage.description && (
                <p className="mt-4 text-gray-400 text-lg leading-relaxed">{selectedImage.description}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;