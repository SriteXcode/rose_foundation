import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, Sparkles, ArrowRight, Target, ChevronLeft, ChevronRight } from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageUtils';
import axiosInstance from '../../utils/api';


const CampaignModal = ({ scrollToSection }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [campaignsList, setCampaignsList] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      try {
        let activeList = [];
        try {
          const response = await axiosInstance.get('/campaigns/active');
          if (Array.isArray(response.data) && response.data.length > 0) {
            activeList = response.data;
          }
        } catch (e) {
          console.error('Failed to get active campaigns', e);
        }

        if (activeList.length === 0) {
          try {
            const allRes = await axiosInstance.get('/campaigns');
            if (Array.isArray(allRes.data) && allRes.data.length > 0) {
              activeList = allRes.data;
            }
          } catch (e) {
            console.error('Failed to get all campaigns', e);
          }
        }

        if (activeList.length > 0) {
          setCampaignsList(activeList);
          // Pick random starting campaign
          const randomIdx = Math.floor(Math.random() * activeList.length);
          setCurrentIndex(randomIdx);
        } else {
          // Fallback to settings
          const settingsRes = await axiosInstance.get('/settings');
          if (settingsRes.data?.activeCampaign) {
            setCampaignsList([{...settingsRes.data.activeCampaign }]);
          }
        }
      } catch (error) {
        console.error('Failed to load active campaign', error);
      }
    };
    fetchActiveCampaigns();

    const hasSeen = sessionStorage.getItem('hasSeenCampaignPopup');
    let timer;

    if (!hasSeen) {
      timer = setTimeout(() => {
        setIsOpen(true);
        sessionStorage.setItem('hasSeenCampaignPopup', 'true');
      }, 3000);
    }

    const handleOpenModal = () => {
      setIsDismissed(false);
      setIsMinimized(false);
      setIsOpen(true);
    };
    window.addEventListener('openCampaignModal', handleOpenModal);

    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('openCampaignModal', handleOpenModal);
    };
  }, []);

  // Auto advance carousel every 6 seconds if modal is open and multiple campaigns exist
  useEffect(() => {
    if (!isOpen || campaignsList.length <= 1) return;

    const autoSlide = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % campaignsList.length);
    }, 6000);

    return () => clearInterval(autoSlide);
  }, [isOpen, campaignsList.length]);

  const campaign = campaignsList[currentIndex];

  if (campaign.status === 'completed' && campaignsList.length === 1) {
    // If only 1 completed campaign, don't show auto popup
  }

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsDismissed(true);
  };

  const handleOpen = () => {
    setIsMinimized(false);
    setIsDismissed(false);
    setIsOpen(true);
  };

  const handleDonateClick = () => {
    setIsOpen(false);
    setIsMinimized(false);
    setIsDismissed(true);
    if (scrollToSection) {
      scrollToSection('donate');
    }
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? campaignsList.length - 1 : prev - 1));
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % campaignsList.length);
  };

  const target = campaign.targetAmount || 100000;
  const current = campaign.currentAmount || 0;
  const percentage = Math.min(100, Math.round((current / target) * 100));

  const bannerImg = getOptimizedImageUrl(campaign.imageUrl ,{ width: 800, height: 450 });

  return (
    <>
      {/* Sticky Floating Campaign Button (User can hide/dismiss with ✕) */}
      <AnimatePresence>
        {isMinimized && !isOpen && !isDismissed && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed bottom-36 right-6 z-40 flex items-center group/btn"
          >
            <div className="relative flex items-center gap-1.5">
              <button
                onClick={handleOpen}
                className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 text-xs font-bold tracking-wide border border-zinc-700/50 dark:border-zinc-300/50 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500 animate-pulse" />
                </div>
                <span>Campaigns</span>
                {campaignsList.length > 1 && (
                  <span className="bg-amber-500 text-zinc-950 font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
                    {campaignsList.length}
                  </span>
                )}
              </button>

              {/* Hide / Dismiss Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsDismissed(true);
                }}
                aria-label="Hide campaign button"
                title="Hide campaign button"
                className="w-6 h-6 rounded-full bg-zinc-800 dark:bg-zinc-200 text-zinc-400 dark:text-zinc-600 hover:text-white dark:hover:text-black flex items-center justify-center transition-colors cursor-pointer border border-zinc-700 dark:border-zinc-300 shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Campaign Popup Modal with Carousel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Glassmorphic Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md sm:max-w-lg max-h-[85vh] bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-2xl overflow-hidden z-10 text-left flex flex-col"
            >
              {/* Header Image Banner Carousel */}
              <div className="aspect-[9/16] sm:aspect-square lg:aspect-[16/9] max-h-[200px] sm:max-h-[220px] lg:max-h-[200px] w-full relative overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 group">
                <img
                  key={campaign._id || currentIndex}
                  src={bannerImg}
                  alt={campaign.title}
                  className="w-full h-full object-cover transition-opacity duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Carousel Arrow Controls (If multiple active campaigns) */}
                {campaignsList.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevSlide}
                      aria-label="Previous Campaign"
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer z-20"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleNextSlide}
                      aria-label="Next Campaign"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all cursor-pointer z-20"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Carousel Dot Indicators */}
                    <div className="absolute bottom-2 right-4 flex items-center gap-1.5 z-20">
                      {campaignsList.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentIndex(idx); }}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === currentIndex ? 'w-5 bg-white' : 'w-1.5 bg-white/50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>{campaign.subtitle || 'Featured Drive'}</span>
                </div>

                {/* Close Cross Button */}
                <button
                  onClick={handleClose}
                  aria-label="Close campaign popup"
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer z-20"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* Banner Headline */}
                <div className="absolute bottom-3 left-4 right-16">
                  <h3 className="text-lg sm:text-xl font-extrabold text-white leading-tight tracking-tight drop-shadow-sm line-clamp-2">
                    {campaign.title}
                  </h3>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1">
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                  {campaign.description}
                </p>

                {/* Progress Bar Container */}
                <div className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-2">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-500" /> Goal Progress:
                    </span>
                    <span className="text-zinc-900 dark:text-white font-bold">{percentage}%</span>
                  </div>

                  <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2.5 rounded-full overflow-hidden">
                    <motion.div
                      key={campaign._id || currentIndex}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="bg-emerald-500 h-full rounded-full"
                    />
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="font-bold text-zinc-900 dark:text-white">₹{current.toLocaleString()} <span className="font-normal text-zinc-500">raised</span></span>
                    <span className="font-medium text-zinc-500">Target: ₹{target.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    onClick={handleDonateClick}
                    className="flex-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>{campaign.buttonText || 'Donate Now'}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={handleClose}
                    className="px-4 py-3 rounded-full text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-gray-200 dark:border-zinc-800"
                  >
                    Remind Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default CampaignModal;
