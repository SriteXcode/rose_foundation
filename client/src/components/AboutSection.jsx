import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight, Image as ImageIcon } from 'lucide-react';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const AboutSection = () => {
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await axiosInstance.get('/gallery?limit=1000');
        const data = Array.isArray(response.data) ? response.data : (response.data.items || []);
        
        if (Array.isArray(data) && data.length > 0) {
          const validImages = data
            .map(item => item.imageUrl)
            .filter(img => img && typeof img === 'string' && img.startsWith('http'));
          
          if (validImages.length > 0) {
            setImages(validImages);
          }
        }
      } catch (error) {
        console.error('Failed to fetch gallery image for About section', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryImages();
  }, []);

  // Automatic slideshow with smooth fade-in fade-out transition
  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % images.length);
        setIsFading(false);
      }, 500); // 500ms fade out transition duration
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [images]);

  const currentImage = images[currentIndex] 
    ? getOptimizedImageUrl(images[currentIndex], { width: 1000 })
    : null;

  return (
    <section id="about" className="py-4 md:py-6 bg-white dark:bg-zinc-950 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Image with Fade Animation */}
          <div className="lg:col-span-5 order-2 lg:order-1 w-full max-w-md lg:max-w-none mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-900 aspect-[4/3] max-h-[300px] md:max-h-[340px] lg:max-h-[360px] relative">
              {currentImage ? (
                <img 
                  src={currentImage} 
                  alt="Volunteers helping communities" 
                  loading="lazy" 
                  className={`w-full h-full object-cover transform hover:scale-105 transition-all duration-700 ${
                    isFading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
                  }`} 
                />
              ) : (
                /* Blink / Fade In Fade Out Animation Frame when no image is loaded */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200/60 to-gray-100 dark:from-zinc-900 dark:via-zinc-800/70 dark:to-zinc-900 p-6 text-center animate-pulse-fade">
                  <div className="w-14 h-14 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3 border border-rose-500/20 shadow-xs">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <span className="text-xs font-extrabold text-zinc-700 dark:text-zinc-300 uppercase tracking-widest">
                    Blackrose Foundation
                  </span>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                    Empowering Communities Together
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column Content */}
          <div className="lg:col-span-7 order-1 lg:order-2 flex flex-col items-start text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              About Us
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
              A foundation built on compassion
            </h2>

            <p className="text-zinc-600 dark:text-zinc-400 text-base sm:text-lg leading-relaxed mb-3">
              Blackrose Foundation is a community-driven nonprofit dedicated to uplifting underprivileged families. We believe every person deserves access to education, healthcare and opportunity regardless of their circumstances.
            </p>

            <p className="text-zinc-600 dark:text-zinc-400 text-base leading-relaxed mb-6">
              Through transparent operations and grassroots initiatives, we deliver meaningful, lasting change in the communities we serve.
            </p>

            {/* Checkmark List */}
            <div className="space-y-3 mb-6 w-full">
              {[
                "Transparent and accountable operations",
                "100% community-first approach",
                "Sustainable, long-term impact programs"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-zinc-800 dark:text-zinc-200 font-medium text-sm sm:text-base">
                    {item}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              to="/campaigns"
              className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-6 py-3 rounded-full text-xs font-semibold transition-all shadow-sm group"
            >
              <span>Explore Our Work</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;
