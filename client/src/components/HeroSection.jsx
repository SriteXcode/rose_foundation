import React, { useState, useEffect, Suspense, lazy } from 'react';
import axiosInstance from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowRight } from 'lucide-react';

const JoinUsModal = lazy(() => import('./modals/JoinUsModal'));

const HeroSection = ({ scrollToSection }) => {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [heroImages, setHeroImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fallbackHeroImage = "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&q=80&w=1200";

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
            : [];
            
          const mobileImages = settings.heroImagesMobile?.length > 0 
            ? settings.heroImagesMobile 
            : desktopImages;

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

  useEffect(() => {
    if (heroImages.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages]);

  const displayImage = heroImages.length > 0
    ? getOptimizedImageUrl(heroImages[currentImageIndex], isMobile ? { width: 800 } : { width: 1200 })
    : fallbackHeroImage;

  return (
    <section id="home" className="pt-20 pb-6 sm:pt-24 sm:pb-8 bg-fafafa dark:bg-zinc-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Content Column */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700/80 mb-4">
              Nonprofit Foundation
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4 leading-[1.15]">
              Empowering communities together
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed max-w-xl">
              We create a better tomorrow for everyone through education, relief and sustainable support programs that reach those who need it most.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3.5 mb-8 w-full sm:w-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-6 py-3 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto group"
              >
                <span>Get Involved</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => scrollToSection('about')}
                className="bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-gray-300 dark:border-zinc-700 px-6 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer w-full sm:w-auto"
              >
                Learn More
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-6 sm:gap-10 pt-5 border-t border-gray-200 dark:border-zinc-800/80 w-full">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">12k+</div>
                <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">Lives impacted</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">240</div>
                <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">Volunteers</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">18</div>
                <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium mt-1">Programs</div>
              </div>
            </div>

          </div>

          {/* Right Image Column - Compact on md/lg */}
          <div className="lg:col-span-5 relative w-full max-w-md lg:max-w-none mx-auto">
            <div className="relative rounded-2xl overflow-hidden shadow-xl bg-gray-100 dark:bg-zinc-900 border border-gray-200/60 dark:border-zinc-800/80 aspect-[4/3] sm:aspect-[16/11] max-h-[320px] md:max-h-[360px] lg:max-h-[380px]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={displayImage}
                  alt="Rose Foundation Community Care"
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {/* Carousel Slide Indicators */}
              {heroImages.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        idx === currentImageIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      <Suspense fallback={null}>
        {showJoinModal && (
          <JoinUsModal 
            isOpen={showJoinModal} 
            onClose={() => setShowJoinModal(false)} 
          />
        )}
      </Suspense>
    </section>
  );
};

export default HeroSection;

