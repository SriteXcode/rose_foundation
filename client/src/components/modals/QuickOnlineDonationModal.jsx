import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ShieldCheck, Check, Sparkles, CreditCard, Lock } from 'lucide-react';
import axiosInstance from '../../utils/api';
import { handleDonation } from '../../utils/apiHandlers';
import toast from 'react-hot-toast';

const QuickOnlineDonationModal = ({
  isOpen = false,
  onClose,
  initialAmount = '500',
  initialCause = '',
  onSuccess
}) => {
  const [amount, setAmount] = useState(initialAmount);
  const [customAmount, setCustomAmount] = useState('');
  const [cause, setCause] = useState(initialCause || 'Education & Child Welfare');
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');

  // Get logged in user if available
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  })();

  // Autofill user details if logged in
  useEffect(() => {
    if (user) {
      if (user.name) setDonorName(user.name);
      if (user.email) setDonorEmail(user.email);
      if (user.phone) setDonorPhone(user.phone);
    }
  }, [user]);

  // Sync initial cause and amount when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialAmount) {
        setAmount(initialAmount);
        setCustomAmount('');
      }
      if (initialCause) {
        setCause(initialCause);
      }
    }
  }, [isOpen, initialAmount, initialCause]);

  // Fetch active campaigns for cause dropdown
  useEffect(() => {
    let isMounted = true;
    const fetchCampaigns = async () => {
      try {
        const response = await axiosInstance.get('/campaigns/active');
        if (isMounted && Array.isArray(response.data) && response.data.length > 0) {
          setActiveCampaigns(response.data);
        }
      } catch (err) {
        console.warn('Could not load active campaigns for quick donation modal:', err);
      }
    };
    fetchCampaigns();
    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  const presetAmounts = ['200', '500', '1000', '2000', '5000'];
  const effectiveAmount = customAmount ? customAmount : amount;

  const handleDonateNow = () => {
    const finalAmt = parseFloat(effectiveAmount);
    if (!finalAmt || finalAmt <= 0) {
      toast.error('Please select or enter a valid donation amount');
      return;
    }

    const volunteerInfo = {
      donorName: donorName.trim() || user?.name || 'Anonymous Donor',
      donorEmail: donorEmail.trim() || user?.email || '',
      donorPhone: donorPhone.trim() || user?.phone || '',
      cause: cause
    };

    handleDonation(
      finalAmt,
      setIsLoading,
      user,
      (data) => {
        if (onSuccess) {
          onSuccess(data);
        }
        onClose();
      },
      volunteerInfo
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-5 sm:p-6 text-zinc-900 dark:text-white max-h-[92vh] overflow-y-auto no-scrollbar text-left"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-pink-500 flex items-center justify-center text-white shadow-md">
              <Heart className="w-4 h-4 fill-white" />
            </div>
            <div>
              <h3 className="text-base font-bold leading-tight">Online Donation</h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">Blackrose Foundation • 80G Tax Exemption</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-full text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
            Select Donation Amount
          </label>
          <div className="grid grid-cols-5 gap-1.5 mb-2.5">
            {presetAmounts.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => {
                  setAmount(amt);
                  setCustomAmount('');
                }}
                className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  effectiveAmount === amt
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-400'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                ₹{amt}
              </button>
            ))}
          </div>

          {/* Custom Amount Input */}
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-zinc-400">
              ₹
            </span>
            <input
              type="number"
              placeholder="Or enter custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setAmount('');
              }}
              min="1"
              className="w-full bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-xl pl-8 pr-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Cause Selector */}
        <div className="mb-4">
          <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
            <span>Choose Cause or Campaign</span>
            {activeCampaigns.length > 0 && (
              <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                {activeCampaigns.length} Active Drive{activeCampaigns.length > 1 ? 's' : ''}
              </span>
            )}
          </label>
          <select
            value={cause}
            onChange={(e) => setCause(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
          >
            {/* If initial cause is set and not in defaults, show it first */}
            {initialCause && (
              <option value={initialCause}>
                📍 Supporting: {initialCause}
              </option>
            )}

            {activeCampaigns.length > 0 && (
              <optgroup label="🔥 Active Campaigns">
                {activeCampaigns.map((camp) => (
                  <option key={camp._id} value={camp.title}>
                    Campaign: {camp.title}
                  </option>
                ))}
              </optgroup>
            )}

            <optgroup label="Standard Causes">
              <option value="Education & Child Welfare">Education & Child Welfare</option>
              <option value="Emergency Food & Relief">Emergency Food & Relief</option>
              <option value="Healthcare & Medical Camps">Healthcare & Medical Camps</option>
              <option value="Women Empowerment">Women Empowerment</option>
              <option value="General Community Welfare">General Community Welfare</option>
            </optgroup>
          </select>
        </div>

        {/* Donor Info (Optional) */}
        <div className="mb-5 space-y-2">
          <label className="block text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            Donor Information (For 80G Receipt & Certificate)
          </label>
          <input
            type="text"
            placeholder="Your Full Name (optional)"
            value={donorName}
            onChange={(e) => setDonorName(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="email"
              placeholder="Email address"
              value={donorEmail}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <input
              type="tel"
              placeholder="Phone number"
              value={donorPhone}
              onChange={(e) => setDonorPhone(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>
        </div>

        {/* Action Button: Donate Now */}
        <button
          type="button"
          onClick={handleDonateNow}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-gradient-to-r from-rose-600 via-pink-600 to-rose-500 hover:from-rose-500 hover:to-pink-500 text-white font-extrabold text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <span>Opening Payment Gateway...</span>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              <span>Donate ₹{effectiveAmount || '500'} via Razorpay</span>
            </>
          )}
        </button>

        {/* Security & Trust Footer */}
        <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-zinc-500 dark:text-zinc-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured by Razorpay • UPI, Cards, NetBanking • Instant Receipt</span>
        </div>
      </motion.div>
    </div>
  );
};

export default QuickOnlineDonationModal;
