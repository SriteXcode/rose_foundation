import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  Heart, 
  Zap, 
  QrCode, 
  Copy, 
  Check, 
  ShieldCheck 
} from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import QuickOnlineDonationModal from './QuickOnlineDonationModal';
import PostDonationModal from './PostDonationModal';
import { useFoundationSettings } from '../../hooks/useFoundationSettings';
import { buildUpiUrl } from '../../utils/upiUtils';

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 320 : -320,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.22 },
      scale: { duration: 0.22 }
    }
  },
  exit: (direction) => ({
    x: direction < 0 ? 320 : -320,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: 'spring', stiffness: 320, damping: 32 },
      opacity: { duration: 0.18 }
    }
  })
};

const ImageLightboxModal = ({
  items = [],
  initialIndex = 0,
  isOpen = false,
  onClose
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0);
  const { upiId: OFFICIAL_UPI_ID, upiPayeeName: PAYEE_NAME, qrCodeUrl: customQrCodeUrl } = useFoundationSettings();

  // Quick Donation Card states
  const [showDonationCard, setShowDonationCard] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [donationSuccessData, setDonationSuccessData] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState('500');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Detect mobile
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      const mobileRegex = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
      setIsMobileDevice(mobileRegex.test(userAgent) || window.innerWidth < 768);
    };
    checkMobile();
  }, []);

  // Sync index when initialIndex changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
      setDirection(0);
      setShowDonationCard(false);
      setShowOnlineModal(false);
      setDonationSuccessData(null);
    }
  }, [isOpen, initialIndex]);

  // Seamless Infinite Loop Pagination
  const paginate = useCallback((newDirection) => {
    if (!items || items.length <= 1) return;
    setDirection(newDirection);
    setCurrentIndex((prev) => (prev + newDirection + items.length) % items.length);
  }, [items]);

  const handleNext = useCallback(() => paginate(1), [paginate]);
  const handlePrev = useCallback(() => paginate(-1), [paginate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // Don't navigate images if an input popup is open
      if (showOnlineModal) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (showDonationCard) {
          setShowDonationCard(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose, showDonationCard, showOnlineModal]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Preload neighboring images for seamless instant sliding without flashes
  useEffect(() => {
    if (!isOpen || !items || items.length <= 1) return;
    const nextIdx = (currentIndex + 1) % items.length;
    const prevIdx = (currentIndex - 1 + items.length) % items.length;

    if (items[nextIdx]?.imageUrl) {
      const nextImg = new Image();
      nextImg.src = items[nextIdx].imageUrl;
    }
    if (items[prevIdx]?.imageUrl) {
      const prevImg = new Image();
      prevImg.src = items[prevIdx].imageUrl;
    }
  }, [isOpen, currentIndex, items]);

  // Generate UPI QR Code for quick donation card
  useEffect(() => {
    if (!showDonationCard) return;

    if (customQrCodeUrl) {
      setQrCodeDataUrl(customQrCodeUrl);
      return;
    }

    let isMounted = true;
    const generateQr = async () => {
      try {
        const upiString = buildUpiUrl({
          upiId: OFFICIAL_UPI_ID,
          payeeName: PAYEE_NAME,
          amount: null,
          note: 'Donation to ' + PAYEE_NAME
        });

        const dataUrl = await QRCode.toDataURL(upiString, {
          width: 220,
          margin: 1,
          color: {
            dark: '#0f172a',
            light: '#ffffff'
          }
        });
        if (isMounted) {
          setQrCodeDataUrl(dataUrl);
        }
      } catch (err) {
        console.error('Failed to generate lightbox QR code:', err);
      }
    };

    generateQr();
    return () => {
      isMounted = false;
    };
  }, [showDonationCard, OFFICIAL_UPI_ID, PAYEE_NAME, customQrCodeUrl]);

  const handleCopyUpi = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopied(true);
    toast.success(`UPI ID copied: ${OFFICIAL_UPI_ID}`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUpiApp = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const amt = parseFloat(selectedAmount);
    const upiUrl = amt && amt > 0
      ? `upi://pay?pa=${OFFICIAL_UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&am=${amt}&cu=INR&tn=${encodeURIComponent('Donation to ' + PAYEE_NAME)}&mode=02`
      : `upi://pay?pa=${OFFICIAL_UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&cu=INR&tn=${encodeURIComponent('Donation to ' + PAYEE_NAME)}&mode=02`;

    if (isMobileDevice) {
      toast.success('Opening UPI App... (UPI ID copied)');
      window.location.href = upiUrl;
    } else {
      toast.success(`UPI ID copied: ${OFFICIAL_UPI_ID}\nScan the QR code with your mobile UPI app.`);
    }
  };

  if (!isOpen || !items || items.length === 0) return null;

  const currentItem = items[currentIndex] || items[0];
  const hasMultiple = items.length > 1;
  const currentCause = currentItem.title || currentItem.category || 'Education & Social Relief';
  const presetAmounts = ['200', '500', '1000', '2000'];

  return (
    <>
      <div 
        className="fixed inset-0 z-[70] bg-black/92 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 select-none animate-fadeIn"
        onClick={onClose}
      >
        {/* Top Bar: Clean Close button */}
        <div 
          className="flex items-center justify-end w-full max-w-5xl mx-auto z-20 pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Lightbox (Esc)"
            title="Close (Esc)"
            className="p-2 sm:p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer border border-white/15 backdrop-blur-md"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Main Center Stage with Sliding Animation & Gestures */}
        <div 
          className="relative flex-1 flex items-center justify-center w-full max-w-5xl mx-auto my-2 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation Previous Button */}
          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              aria-label="Previous Image (Left Arrow)"
              title="Previous (Left Arrow)"
              className="absolute left-1 sm:left-3 z-30 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-90 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Sliding Image Viewer with Drag Gestures */}
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.65}
              onDragEnd={(e, { offset, velocity }) => {
                const swipeConfidenceThreshold = 8000;
                const swipePower = Math.abs(offset.x) * velocity.x;

                if (offset.x < -45 || swipePower < -swipeConfidenceThreshold) {
                  handleNext();
                } else if (offset.x > 45 || swipePower > swipeConfidenceThreshold) {
                  handlePrev();
                }
              }}
              className="w-full h-full flex items-center justify-center max-h-[66vh] sm:max-h-[70vh] touch-pan-y cursor-grab active:cursor-grabbing"
            >
              <img
                src={currentItem.imageUrl}
                alt={currentItem.title || 'Gallery Image'}
                className="max-w-full max-h-full object-contain rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 pointer-events-none select-none"
              />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Next Button */}
          {hasMultiple && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              aria-label="Next Image (Right Arrow)"
              title="Next (Right Arrow)"
              className="absolute right-1 sm:right-3 z-30 p-2.5 sm:p-3 rounded-full bg-black/50 hover:bg-black/75 text-white/90 hover:text-white border border-white/20 backdrop-blur-md shadow-lg transition-all hover:scale-110 active:scale-90 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Quick Donation Card overlay right on top of enlarged image if requested */}
          <AnimatePresence>
            {showDonationCard && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="absolute z-40 w-[320px] sm:w-[350px] max-w-[calc(100vw-2.5rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-2xl border border-rose-300 dark:border-rose-900/60 rounded-3xl shadow-2xl p-4 sm:p-5 text-zinc-900 dark:text-white max-h-[85vh] overflow-y-auto no-scrollbar"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                      <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold leading-tight">Support Our Cause</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate max-w-[190px]">
                        {currentCause}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowDonationCard(false)}
                    aria-label="Close Donation Card"
                    className="p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Option 1: Instant Online Pay (DO NOT REDIRECT -> opens popup) */}
                <div className="mb-3.5">
                  <button
                    type="button"
                    onClick={() => {
                      // Open popup directly without redirecting!
                      setShowOnlineModal(true);
                    }}
                    className="w-full group flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 fill-white" />
                      </div>
                      <div className="text-left">
                        <span className="block leading-tight font-extrabold">Instant Online Pay</span>
                        <span className="text-[10px] font-normal text-rose-100">Card, NetBanking & Razorpay</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center justify-center mb-3">
                  <div className="border-t border-zinc-200 dark:border-zinc-800 w-full"></div>
                  <span className="bg-white dark:bg-zinc-900 px-2 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 shrink-0">
                    Or Scan & Pay UPI
                  </span>
                </div>

                {/* Option 2: UPI QR Code Only */}
                <div className="flex flex-col items-center">
                  <div className="p-3 bg-white rounded-2xl border-2 border-amber-300 shadow-inner flex flex-col items-center mb-3">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="Donate via UPI QR"
                        className="w-36 h-36 sm:w-40 sm:h-40 object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-36 h-36 sm:w-40 sm:h-40 flex items-center justify-center text-zinc-400">
                        <QrCode className="w-8 h-8 animate-spin" />
                      </div>
                    )}
                  </div>

                  {/* UPI Copy */}
                  <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs mb-2">
                    <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate">
                      {OFFICIAL_UPI_ID}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 shrink-0 cursor-pointer"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-500" />
                          <span className="text-emerald-500">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="mt-1 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    <span>0% Fee • Official IndusInd Bank UPI</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom Info Bar: Title, Category & "Support Our Cause" Button */}
        <div 
          className="w-full max-w-4xl mx-auto z-20 pointer-events-auto bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-3 sm:p-4 text-left shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white leading-tight">
                {currentItem.title || 'Rose Foundation Moments'}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
                  {currentItem.category || 'Gallery'}
                </span>
                {currentItem.project && (
                  <span className="text-[11px] text-zinc-400 font-medium">
                    • Project: {currentItem.project.title || currentItem.project}
                  </span>
                )}
              </div>
            </div>

            {/* Support Our Cause Action Button */}
            <button
              type="button"
              onClick={() => setShowDonationCard(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-rose-600/30 transition-all hover:scale-105 active:scale-95 cursor-pointer shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span>Support Our Cause</span>
            </button>
          </div>

          {currentItem.description && (
            <p className="mt-2 text-xs text-zinc-300 leading-relaxed max-h-16 overflow-y-auto no-scrollbar">
              {currentItem.description}
            </p>
          )}
        </div>
      </div>

      {/* Online Donation Popup (Asks for Amount & Cause, then opens Razorpay - NO REDIRECT) */}
      <QuickOnlineDonationModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        initialAmount={selectedAmount}
        initialCause={currentCause}
        onSuccess={(donationData) => {
          setDonationSuccessData(donationData);
          setShowDonationCard(false);
        }}
      />

      {/* Post Donation Modal with Receipt / Certificate when Razorpay succeeds */}
      {donationSuccessData && (
        <PostDonationModal
          isOpen={!!donationSuccessData}
          onClose={() => setDonationSuccessData(null)}
          donationData={donationSuccessData}
        />
      )}
    </>
  );
};

export default ImageLightboxModal;
