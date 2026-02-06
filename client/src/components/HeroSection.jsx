import React, { useState, useEffect } from 'react';
import JoinUsModal from './modals/JoinUsModal';
import axiosInstance from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';

const HeroSection = ({ scrollToSection }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axiosInstance.get('/settings');
        const settings = response.data;
        
        const updateImages = () => {
          const mobile = window.innerWidth < 768;
          setIsMobile(mobile);
          
          const desktopImages = settings.heroImagesDesktop?.length > 0 
            ? settings.heroImagesDesktop 
            : []; // Fallback if needed, currently empty to show gradient
            
          const mobileImages = settings.heroImagesMobile?.length > 0 
            ? settings.heroImagesMobile 
            : desktopImages; // Fallback to desktop if no mobile

          setHeroImages(mobile ? mobileImages : desktopImages);
        };

        updateImages();
        window.addEventListener('resize', updateImages);
        return () => window.removeEventListener('resize', updateImages);

      } catch (error) {
        console.error("Failed to fetch hero images", error);
      }
    };

    fetchSettings();
  }, []);

  // Carousel timer
  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages]);

  return (
    <section id="home" className="min-h-screen bg-slate-900 flex items-center justify-center relative overflow-hidden">
      
      {/* Background Carousel */}
      <div className="absolute inset-0 z-0">
        {heroImages.length > 0 ? (
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImageIndex}
              src={heroImages[currentImageIndex]}
              alt="Hero Background"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="w-full h-full object-fit-cover"
            />
          </AnimatePresence>
        ) : (
          // Fallback Gradient if no images
          <div className="w-full h-full bg-gradient-to-br from-slate-800 via-slate-700 to-red-600"></div>
        )}
        {/* Overlay to ensure text readability */}
        <div className="absolute inset-0 bg-black/50"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent animate-pulse">
          Empowering Communities
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90 drop-shadow-md">
          Together we can create a better tomorrow for everyone
        </p>
        
        <div className="flex flex-col gap-4 items-center">
          <button
            onClick={() => scrollToSection('about')}
            className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl w-48 shadow-lg"
          >
            Learn More
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="bg-white/10 backdrop-blur-md border-2 border-white/50 hover:bg-white/20 text-white px-8 py-3 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl flex items-center justify-center gap-2 w-48 group shadow-lg"
          >
            <span>✨</span> Join Us
          </button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce z-10">
        <button onClick={() => scrollToSection('about')} className="text-white text-3xl drop-shadow-md">
          ⬇
        </button>
      </div>

      <JoinUsModal 
        isOpen={showJoinModal} 
        onClose={() => setShowJoinModal(false)} 
      />
    </section>
  );
};

export default HeroSection;