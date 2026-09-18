import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { handleDonation } from '../utils/apiHandlers';
import { useAuth } from '../hooks/useAuth';
import { 
  Heart, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Lock, 
  ExternalLink, 
  QrCode,
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const PostDonationModal = lazy(() => import('./modals/PostDonationModal'));

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

const VolunteerDonationCard = ({ 
  volunteer, 
  compact = false, 
  className = '',
  showDedicatedLink = true,
  previewMode = false
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [donationAmount, setDonationAmount] = useState('500');
  const [cause, setCause] = useState('Education');
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [donorForm, setDonorForm] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const u = JSON.parse(stored);
        return {
          name: u.name || '',
          email: u.email || '',
          phone: u.phone || ''
        };
      }
    } catch (e) {
      // ignore
    }
    return { name: '', email: '', phone: '' };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationData, setDonationData] = useState(null);

  // Autofill user details when logged-in session loads/changes
  useEffect(() => {
    if (user) {
      setDonorForm((prev) => ({
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  // Load Active Campaigns
  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axiosInstance.get('/campaigns/active');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setActiveCampaigns(response.data);
          setCause(response.data[0].title);
        }
      } catch (error) {
        console.error('Failed to load campaigns for donation card:', error);
      }
    };
    fetchCampaigns();
  }, []);

  const activeCode = volunteer?.fundraiserCode || volunteer?.volunteerCode || '';

  const onDonate = (e) => {
    e.preventDefault();
    if (previewMode) {
      toast('Studio Preview: Payment checkout is disabled in story preview mode.', {
        icon: 'ℹ️'
      });
      return;
    }
    const amt = parseFloat(donationAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    const volunteerInfo = volunteer ? {
      volunteerId: volunteer._id,
      volunteerCode: activeCode,
      fundraiserCode: activeCode,
      volunteerName: volunteer.name,
      donorName: donorForm.name.trim() || user?.name || 'Anonymous Donor',
      donorEmail: donorForm.email.trim() || user?.email || 'anonymous@example.com',
      donorPhone: donorForm.phone.trim() || user?.phone || ''
    } : null;

    handleDonation(
      amt,
      setIsLoading,
      user,
      (data) => {
        setDonationData(data);
        setShowSuccessModal(true);
      },
      volunteerInfo
    );
  };

  const presetAmounts = ['300', '500', '1000', '2500', '5000'];

  return (
    <>
      <div className={`bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-700/60 rounded-3xl shadow-xl overflow-hidden text-left relative transition-all ${className}`}>
        
        {/* Decorative Top Accent Bar */}
        <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 w-full"></div>

        <div className={compact ? "p-5 sm:p-6 space-y-4" : "p-5 sm:p-7"}>
          
          {/* Card Header */}
          {compact ? (
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Make a Donation via Razorpay
              </h3>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Verified Fundraiser Appeal
                </span>
                <span className="text-[10px] text-zinc-400 font-mono font-bold">
                  80G Tax Exempt
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Make a Donation via Razorpay
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                Your contribution is 100% tax deductible and directly linked to this volunteer's campaign ledger.
              </p>
            </div>
          )}

          {/* Volunteer Attribution Banner (Only in non-compact mode) */}
          {!compact && volunteer && (
            <div className="flex items-center gap-3 bg-amber-50/50 dark:bg-zinc-800/60 border border-amber-200/60 dark:border-zinc-700/60 rounded-2xl p-3 mb-4">
              <div className="relative shrink-0">
                <img
                  src={volunteer.image || DEFAULT_AVATAR}
                  alt={volunteer.name}
                  className="w-11 h-11 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                />
                <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-zinc-950 p-0.5 rounded-full shadow-xs">
                  <ShieldCheck className="w-3 h-3" />
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                    {volunteer.name}
                  </h4>
                  <span className="font-mono text-[9px] font-bold text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-zinc-600">
                    {activeCode}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                  {volunteer.designation || volunteer.role || 'Official Volunteer'}
                </p>
              </div>
            </div>
          )}

          {/* Donation Form */}
          <form onSubmit={onDonate} className="space-y-4">
            
            {/* Cause Selector */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Select Cause or Campaign
              </label>
              <select
                value={cause}
                onChange={(e) => setCause(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {activeCampaigns.length > 0 && (
                  <optgroup label="Active Running Campaigns">
                    {activeCampaigns.map((camp) => (
                      <option key={camp._id} value={camp.title}>
                        Campaign: {camp.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                <optgroup label="General NGO Causes">
                  <option value="Education">Education & School Supplies</option>
                  <option value="Relief">Emergency Relief & Food Rations</option>
                  <option value="Healthcare">Healthcare & Health Camps</option>
                  <option value="General">General Community Welfare</option>
                </optgroup>
              </select>
            </div>

            {/* Select Preset Amount */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                Select Amount (₹)
              </label>
              <div className="grid grid-cols-5 gap-1.5 sm:gap-2 mb-2">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      donationAmount === amt
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
                        : 'bg-gray-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="500"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                min="1"
                required
              />
            </div>

            {/* Donor Details Form (Only in full/non-compact mode) */}
            {!compact && (
              <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block">
                    Donor Information (For 80G Receipt)
                  </span>
                  {user && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3 h-3" />
                      Autofilled from your account
                    </span>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    placeholder="Your Full Name"
                    value={donorForm.name}
                    onChange={(e) => setDonorForm({ ...donorForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    required
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email Address (for certificate)"
                    value={donorForm.email}
                    onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (optional)"
                    value={donorForm.phone}
                    onChange={(e) => setDonorForm({ ...donorForm, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  />
                </div>
              </div>
            )}

            {/* Dynamic Summary Notice */}
            <div className="bg-amber-50/80 dark:bg-amber-950/40 p-3 rounded-xl text-center text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/50">
              You are contributing <span className="font-extrabold text-sm">₹{donationAmount || '0'}</span> {volunteer?.name ? `attributed to ${volunteer.name}` : ''}
            </div>

            {/* Submit / Proceed Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>{isLoading ? 'Opening Payment Gateway...' : 'Proceed to Pay with Razorpay'}</span>
              <Heart className="w-4 h-4 fill-white dark:fill-zinc-900" />
            </button>

          </form>

          {/* Dedicated Page Link / Direct UPI Option */}
          {showDedicatedLink && activeCode && (
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between text-xs">
              <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                Prefer direct UPI QR scan?
              </span>
              <button
                type="button"
                onClick={() => navigate(`/v/${activeCode}`)}
                className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer text-[11px]"
              >
                <span>Dedicated Page & UPI QR</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>
      </div>

      {/* Success Receipt Modal */}
      {showSuccessModal && (
        <Suspense fallback={null}>
          <PostDonationModal
            show={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            donationData={donationData}
          />
        </Suspense>
      )}
    </>
  );
};

export default VolunteerDonationCard;
