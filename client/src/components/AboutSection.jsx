import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';

const defaultAboutImages = [
  "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=1000",
  "https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=1000"
];

const AboutSection = () => {
  const [aboutImage, setAboutImage] = useState(defaultAboutImages[0]);

  useEffect(() => {
    const fetchRandomGalleryImage = async () => {
      try {
        const response = await axiosInstance.get('/gallery?limit=1000');
        const data = response.data.items || response.data;
        
        if (Array.isArray(data) && data.length > 0) {
          const validImages = data.map(item => item.imageUrl).filter(img => img && img.startsWith('http'));
          if (validImages.length > 0) {
            const randomIndex = Math.floor(Math.random() * validImages.length);
            setAboutImage(validImages[randomIndex]);
            return;
          }
        }
        
        // Fallback to random default image
        const randomIndex = Math.floor(Math.random() * defaultAboutImages.length);
        setAboutImage(defaultAboutImages[randomIndex]);
      } catch (error) {
        console.error('Failed to fetch gallery image for About section', error);
        const randomIndex = Math.floor(Math.random() * defaultAboutImages.length);
        setAboutImage(defaultAboutImages[randomIndex]);
      }
    };

    fetchRandomGalleryImage();
  }, []);

  const displaySrc = getOptimizedImageUrl(aboutImage, { width: 1000 });

  return (
    <section id="about" className="py-4 md:py-6 bg-white dark:bg-zinc-900/50 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Column Image */}
          <div className="lg:col-span-5 order-2 lg:order-1 w-full max-w-md lg:max-w-none mx-auto">
            <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 aspect-[4/3] max-h-[300px] md:max-h-[340px] lg:max-h-[360px] relative">
              <img 
                key={displaySrc}
                src={displaySrc} 
                alt="Volunteers helping communities" 
                loading="lazy" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-700" 
              />
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

            {/* Action Link */}
            <Link 
              to="/legal" 
              className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-900 dark:text-white hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors group cursor-pointer"
            >
              <span>View Legal Documents</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
};

export default AboutSection;

