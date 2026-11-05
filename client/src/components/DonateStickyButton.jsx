import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { 
  Heart, 
  GripVertical, 
  QrCode, 
  ChevronRight, 
  Minimize2, 
  X, 
  Copy, 
  Check, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';
import QRCode from 'qrcode';
import toast from 'react-hot-toast';
import QuickOnlineDonationModal from './modals/QuickOnlineDonationModal';
import PostDonationModal from './modals/PostDonationModal';
import { useFoundationSettings } from '../hooks/useFoundationSettings';
import { buildUpiUrl } from '../utils/upiUtils';

const DonateStickyButton = () => {
  const { upiId: OFFICIAL_UPI_ID, upiPayeeName: PAYEE_NAME, qrCodeUrl: customQrCodeUrl } = useFoundationSettings();
  // mode: starts as 'expanded' (capsule) and collapses into 'collapsed' (smaller circle) after 5s of no interaction
  const [mode, setMode] = useState('expanded');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [showOnlineModal, setShowOnlineModal] = useState(false);
  const [donationSuccessData, setDonationSuccessData] = useState(null);

  const isDraggingRef = useRef(false);
  const containerRef = useRef(null);
  const inactivityTimerRef = useRef(null);
  const dragControls = useDragControls();

  const [dragConstraints, setDragConstraints] = useState({ left: -300, right: 16, top: -50, bottom: 500 });
  const effectiveAmount = '500';

  // Viewport bounds constraint to ensure button is NEVER hidden or lost off-screen
  useEffect(() => {
    const updateConstraints = () => {
      if (typeof window !== 'undefined') {
        setDragConstraints({
          left: -window.innerWidth + 90,
          right: 16,
          top: -50,
          bottom: window.innerHeight - 130
        });
      }
    };
    updateConstraints();
    window.addEventListener('resize', updateConstraints);
    return () => window.removeEventListener('resize', updateConstraints);
  }, []);

  // Auto-collapse capsule into smaller circular version after 5 seconds of no interaction
  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    // Only run 5-second countdown when in 'expanded' (capsule) mode
    if (mode === 'expanded') {
      inactivityTimerRef.current = setTimeout(() => {
        // Do not collapse if currently dragging or online modal is active
        if (!isDraggingRef.current && !showOnlineModal) {
          setMode('collapsed');
        }
      }, 5000);
    }
  }, [mode, showOnlineModal]);

  useEffect(() => {
    if (mode === 'expanded') {
      resetInactivityTimer();
    } else {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    }
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [mode, resetInactivityTimer]);

  // Collapse card/pill when clicking outside the container
  useEffect(() => {
    if (mode === 'collapsed') return;

    const handleClickOutside = (event) => {
      // Don't collapse if currently dragging
      if (isDraggingRef.current) return;
      // Don't collapse if online modal is open
      if (showOnlineModal) return;

      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setMode('collapsed');
      }
    };

    document.addEventListener('pointerdown', handleClickOutside);
    return () => {
      document.removeEventListener('pointerdown', handleClickOutside);
    };
  }, [mode, showOnlineModal]);

  // Generate QR Code dynamically whenever the amount changes or mode switches to 'card'
  useEffect(() => {
    if (mode !== 'card') return;

    // If admin configured a custom bank QR image
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
        console.error('Failed to generate quick pay QR code:', err);
      }
    };

    generateQr();
    return () => {
      isMounted = false;
    };
  }, [mode, effectiveAmount, OFFICIAL_UPI_ID, PAYEE_NAME, customQrCodeUrl]);

  const handleDragStart = () => {
    isDraggingRef.current = true;
  };

  const handleDragEnd = () => {
    // Prevent accidental click triggering when finishing a drag gesture
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 120);
  };

  const handleCopyUpi = (e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(OFFICIAL_UPI_ID);
    setCopied(true);
    toast.success(`UPI ID copied: ${OFFICIAL_UPI_ID}`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open Online Pay Modal directly without redirecting
  const handleQuickPayOnline = (e) => {
    e?.stopPropagation();
    if (isDraggingRef.current) return;
    setShowOnlineModal(true);
  };

  const handleCollapsedClick = (e) => {
    e?.stopPropagation();
    if (isDraggingRef.current) return;
    setMode('expanded');
  };

  const handleExpandedClick = (e) => {
    e?.stopPropagation();
    if (isDraggingRef.current) return;
    setMode('card');
  };

  return (
    <>
      <motion.div
        ref={containerRef}
        drag
        dragConstraints={dragConstraints}
        dragControls={dragControls}
        dragListener={mode !== 'card'} // In card mode, dedicated top handle drags so inner buttons respond instantly
        dragMomentum={false}
        dragElastic={0.06}
        onDragStart={() => {
          handleDragStart();
          resetInactivityTimer();
        }}
        onDragEnd={handleDragEnd}
        onMouseEnter={resetInactivityTimer}
        onMouseMove={resetInactivityTimer}
        onTouchStart={resetInactivityTimer}
        onTouchMove={resetInactivityTimer}
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="fixed top-20 right-4 sm:top-24 sm:right-6 z-50 select-none"
      >
        <AnimatePresence mode="wait">
          {/* ================= STATE 1: COLLAPSED (SMALL CIRCLE) ================= */}
          {mode === 'collapsed' && (
            <motion.div
              key="collapsed"
              initial={{ scale: 0.85, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={handleCollapsedClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCollapsedClick(e); }}
              aria-label="Donate Now - Drag anywhere or click to expand"
              title="Donate Now (Click to expand / Drag anywhere)"
              className="group relative flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 shadow-[0_6px_22px_rgba(244,63,94,0.45)] hover:shadow-[0_8px_28px_rgba(244,63,94,0.65)] border border-white/40 cursor-grab active:cursor-grabbing hover:scale-105 active:scale-95 transition-transform touch-none"
            >
              <Heart className="w-5 h-5 fill-white text-white" />

              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400 border border-white dark:border-zinc-900 shadow-sm"></span>
              </span>

              <div className="absolute -left-1 bottom-0 p-0.5 rounded-full bg-black/40 text-white/80 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-2.5 h-2.5" />
              </div>
            </motion.div>
          )}

          {/* ================= STATE 2: EXPANDED (CAPSULE / PILL BUTTON) ================= */}
          {mode === 'expanded' && (
            <motion.div
              key="expanded"
              initial={{ scale: 0.85, opacity: 1 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 1 }}
              transition={{ duration: 0.2 }}
              onClick={handleExpandedClick}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleExpandedClick(e); }}
              aria-label="Donate Now - Click for Quick Pay & QR card"
              title="Click to open Quick Pay card & QR / Drag to move"
              className="group relative flex items-center gap-2 bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white pl-2.5 pr-2 py-2 rounded-full shadow-[0_8px_25px_rgba(244,63,94,0.45)] hover:shadow-[0_10px_32px_rgba(244,63,94,0.65)] border border-white/30 cursor-grab active:cursor-grabbing backdrop-blur-md touch-none"
            >
              <div className="text-white/70 group-hover:text-white transition-colors cursor-grab active:cursor-grabbing">
                <GripVertical className="w-3.5 h-3.5" />
              </div>

              <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Heart className="w-3.5 h-3.5 fill-white text-white" />
              </div>

              <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase whitespace-nowrap">
                Donate Now
              </span>

              <span className="flex items-center gap-1 text-[11px] font-bold bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-full shadow-sm ml-0.5 whitespace-nowrap">
                <Zap className="w-3 h-3 fill-zinc-950" />
                <span>Quick Pay</span>
                <ChevronRight className="w-3 h-3" />
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMode('collapsed');
                }}
                aria-label="Collapse to small button"
                title="Collapse to small button"
                className="p-1 rounded-full text-white/75 hover:text-white hover:bg-white/20 transition-colors ml-0.5 cursor-pointer"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          )}

          {/* ================= STATE 3: CARD (QUICK PAYMENT & QR) ================= */}
          {mode === 'card' && (
            <motion.div
              key="card"
              initial={{ scale: 0.9, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="w-[320px] sm:w-[350px] max-w-[calc(100vw-2rem)] bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-rose-200 dark:border-rose-900/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] p-4 sm:p-5 text-zinc-900 dark:text-white overflow-hidden"
            >
              {/* Header with Dedicated Drag Handle */}
              <div 
                onPointerDown={(e) => dragControls.start(e)}
                className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-3 cursor-grab active:cursor-grabbing select-none"
                title="Drag header to move card anywhere"
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-grab active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                  </div>
                  <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                    <Heart className="w-4 h-4 fill-rose-600 dark:fill-rose-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                      <span>Quick Donation</span>
                      <span className="text-[9px] font-normal text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">⠿ drag</span>
                    </h3>
                    <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Blackrose Foundation</p>
                  </div>
                </div>

                <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => setMode('expanded')}
                    title="Collapse to pill"
                    aria-label="Collapse to pill"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('collapsed')}
                    title="Close (collapse)"
                    aria-label="Close"
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Section 1: Quick Online Payment Button (DO NOT REDIRECT -> opens popup) */}
              <div className="mb-4">
                <button
                  type="button"
                  onClick={handleQuickPayOnline}
                  className="w-full group relative flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                      <Zap className="w-3.5 h-3.5 fill-white text-white" />
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

              {/* Section 2: UPI QR Code Only */}
              <div className="flex flex-col items-center">
                <div className="relative p-3 bg-white rounded-2xl border-2 border-amber-300 dark:border-amber-500/50 shadow-inner flex flex-col items-center mb-3">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Donate via UPI QR"
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center text-zinc-400">
                      <QrCode className="w-10 h-10 animate-spin" />
                    </div>
                  )}
                </div>

                {/* UPI ID with 1-click Copy */}
                <div className="w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs">
                  <span className="font-mono text-[11px] text-zinc-700 dark:text-zinc-300 truncate select-all">
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

                <div className="mt-2.5 flex items-center justify-center gap-1 text-[10px] text-zinc-600 dark:text-zinc-300">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span>0% Fee • Official Verified IndusInd UPI</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Online Donation Popup (Asks for Amount & Cause, then opens Razorpay - NO REDIRECT) */}
      <QuickOnlineDonationModal
        isOpen={showOnlineModal}
        onClose={() => setShowOnlineModal(false)}
        initialAmount={effectiveAmount || '500'}
        initialCause="Education & Child Welfare"
        onSuccess={(data) => {
          setDonationSuccessData(data);
          setMode('collapsed');
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

export default DonateStickyButton;
