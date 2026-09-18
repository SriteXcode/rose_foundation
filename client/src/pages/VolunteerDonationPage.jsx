import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { handleDonation } from '../utils/apiHandlers';
import { Heart, GraduationCap, Utensils, ShieldCheck, CheckCircle2, QrCode, ArrowLeft, Building2, User, Mail, Phone, ExternalLink } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const PostDonationModal = lazy(() => import('../components/modals/PostDonationModal'));

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

const VolunteerDonationPage = () => {
  const { volunteerCode } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const code = volunteerCode || searchParams.get('volunteer');

  const [volunteer, setVolunteer] = useState(null);
  const [loadingVolunteer, setLoadingVolunteer] = useState(true);
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
      // ignore error
    }
    return { name: '', email: '', phone: '' };
  });

  // Autofill user details when logged-in user changes or loads
  useEffect(() => {
    if (user) {
      setDonorForm(prev => ({
        name: prev.name || user.name || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationData, setDonationData] = useState(null);

  // Load Volunteer Info
  useEffect(() => {
    const fetchVolunteer = async () => {
      if (!code) {
        setLoadingVolunteer(false);
        return;
      }
      try {
        setLoadingVolunteer(true);
        const response = await axiosInstance.get(`/volunteers/code/${code}`);
        setVolunteer(response.data);
      } catch (error) {
        console.error('Failed to load volunteer:', error);
        toast.error('Volunteer profile not found. You can still make a general donation.');
      } finally {
        setLoadingVolunteer(false);
      }
    };

    fetchVolunteer();
  }, [code]);

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
        console.error('Failed to load campaigns:', error);
      }
    };
    fetchCampaigns();
  }, []);

  const onDonate = (e) => {
    e.preventDefault();
    const amt = parseFloat(donationAmount);
    if (!amt || amt <= 0) {
      toast.error('Please enter a valid donation amount');
      return;
    }

    const activeCode = volunteer?.fundraiserCode || volunteer?.volunteerCode;
    const volunteerInfo = volunteer ? {
      volunteerId: volunteer._id,
      volunteerCode: activeCode,
      fundraiserCode: activeCode,
      volunteerName: volunteer.name,
      donorName: donorForm.name.trim() || 'Anonymous Donor',
      donorEmail: donorForm.email.trim() || 'anonymous@example.com',
      donorPhone: donorForm.phone.trim() || ''
    } : null;

    handleDonation(
      amt,
      setIsLoading,
      user, // user session
      (data) => {
        setDonationData(data);
        setShowSuccessModal(true);
      },
      volunteerInfo
    );
  };

  const presetAmounts = ['300', '500', '1000', '2500', '5000'];
  const activeCode = volunteer?.fundraiserCode || volunteer?.volunteerCode;

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pt-20 pb-16 transition-colors text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation / Back Button */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {volunteer && volunteer.canViewLedger && (
            <button
              onClick={() => navigate(`/volunteer/dashboard/${activeCode}`)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              title="Restricted Ledger (Visible to Fundraiser & Admin only)"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>View Fundraiser's Transparency Ledger</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Volunteer Banner */}
        {loadingVolunteer ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 mb-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/2"></div>
          </div>
        ) : volunteer ? (
          <div className="bg-white dark:bg-zinc-900 border border-amber-300/80 dark:border-amber-700/50 rounded-2xl p-5 sm:p-6 shadow-sm mb-6 relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-amber-400/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <div className="relative shrink-0">
                <img
                  src={volunteer.image || DEFAULT_AVATAR}
                  alt={volunteer.name}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-amber-400 shadow-sm"
                />
                <span className="absolute bottom-0 right-0 bg-amber-500 text-zinc-950 p-1 rounded-full shadow-md" title="Verified Fundraiser">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </span>
              </div>

              <div className="text-center sm:text-left flex-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
                  <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/50 dark:border-amber-800/60">
                    Official Fundraiser
                  </span>
                  <span className="font-mono text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                    ID: {activeCode}
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">
                  Supporting {volunteer.name}
                </h1>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                  {volunteer.designation || 'Official Fundraiser Lead'} • Black Rose Foundation
                </p>
                {volunteer.bio && (
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 line-clamp-2 italic">
                    "{volunteer.bio}"
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Main Donation Container */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Form & Amount */}
          <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">
              Make a Donation via Razorpay
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Your contribution is 100% tax deductible and directly linked to this volunteer's campaign ledger.
            </p>

            <form onSubmit={onDonate} className="space-y-4">
              
              {/* Select Cause */}
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                  Select Cause or Campaign
                </label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
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
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {presetAmounts.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setDonationAmount(amt)}
                      className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                        donationAmount === amt
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                          : 'bg-gray-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  placeholder="Or enter custom amount in ₹"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                  min="1"
                  required
                />
              </div>

              {/* Donor Details */}
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
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <input
                    type="email"
                    placeholder="Email Address (for certificate)"
                    value={donorForm.email}
                    onChange={(e) => setDonorForm({ ...donorForm, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
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

              {/* Summary Banner */}
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl text-center text-xs font-semibold text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-900/50">
                You are contributing <span className="font-extrabold text-sm">₹{donationAmount || '0'}</span> {volunteer ? `attributed to ${volunteer.name}` : ''}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Opening Payment Gateway...' : 'Proceed to Pay with Razorpay'}</span>
                <Heart className="w-4 h-4 fill-white dark:fill-zinc-900" />
              </button>

            </form>
          </div>

          {/* Right Column: Security & Transparency Notice */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Direct Razorpay UPI QR Card */}
            {volunteer?.directPaymentQrImage && (
              <div className="bg-white dark:bg-zinc-900 border-2 border-emerald-500/80 dark:border-emerald-500/60 rounded-2xl p-5 shadow-sm text-center relative overflow-hidden">
                <div className="inline-block bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2">
                  Direct UPI QR Scan
                </div>
                <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white mb-1">
                  Scan & Pay Directly via UPI
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">
                  Scan with PhonePe, Google Pay, Paytm, or BHIM. Automatically mapped to {volunteer.name}'s live ledger!
                </p>

                <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-sm max-w-[200px] mx-auto mb-2">
                  <img 
                    src={volunteer.directPaymentQrImage} 
                    alt="Direct Razorpay UPI QR" 
                    className="w-full h-auto object-contain mx-auto"
                    crossOrigin="anonymous" 
                  />
                </div>
                <p className="text-[10px] font-mono font-bold text-zinc-700 dark:text-zinc-300">
                  ID: {activeCode}
                </p>

                {volunteer?.upiId && (
                  <div className="mt-3 pt-3 border-t border-emerald-100 dark:border-emerald-950 flex items-center justify-between gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 px-3 py-2 rounded-xl">
                    <div className="text-left min-w-0">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 block">Unique Fundraiser UPI ID</span>
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate block">{volunteer.upiId}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(volunteer.upiId);
                        toast.success('Unique UPI ID copied to clipboard!');
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shrink-0 cursor-pointer transition-colors"
                    >
                      Copy UPI ID
                    </button>
                  </div>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm text-xs space-y-3">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white font-bold pb-2 border-b border-gray-100 dark:border-zinc-800">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>100% Safe & Direct Transfer</span>
              </div>
              <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Supports all UPI Apps (GPay, PhonePe, Paytm), Debit/Credit Cards & NetBanking.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Directly credited to Black Rose Foundation's registered bank account.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span>Instant downloadable 80G tax receipt and donation certificate.</span>
                </li>
              </ul>
            </div>

            {/* Direct Bank Account Fallback */}
            <div className="bg-gray-50 dark:bg-zinc-900/60 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 text-xs">
              <div className="flex items-center gap-2 mb-2 font-bold text-zinc-900 dark:text-white">
                <Building2 className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                <span>Official Bank Details</span>
              </div>
              <div className="space-y-1.5 text-zinc-600 dark:text-zinc-400 font-mono text-[11px]">
                <div><span className="font-sans font-medium text-zinc-500">Account Name:</span> Blackrose Foundation</div>
                <div><span className="font-sans font-medium text-zinc-500">Account No:</span> 251908200515</div>
                <div><span className="font-sans font-medium text-zinc-500">IFSC:</span> INDB0002088</div>
                <div><span className="font-sans font-medium text-zinc-500">Bank:</span> IndusInd Bank</div>
              </div>
            </div>

          </div>

        </div>

      </div>

      <Suspense fallback={null}>
        {showSuccessModal && (
          <PostDonationModal
            isOpen={showSuccessModal}
            onClose={() => setShowSuccessModal(false)}
            donationData={donationData}
            user={null}
          />
        )}
      </Suspense>
    </div>
  );
};

export default VolunteerDonationPage;
