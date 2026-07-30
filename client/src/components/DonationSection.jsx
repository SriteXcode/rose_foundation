import React, { useState, useEffect, Suspense, lazy } from 'react';
import { handleDonation } from '../utils/apiHandlers';
import { useNavigate } from 'react-router-dom';
import { Heart, GraduationCap, Utensils, Building2, ChevronDown, CheckCircle2, History, AlertCircle } from 'lucide-react';

const PostDonationModal = lazy(() => import('./modals/PostDonationModal'));

const DonationSection = ({ donationAmount, setDonationAmount, isLoading, setIsLoading, user, setShowLogin }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationData, setDonationData] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [cause, setCause] = useState('Education');
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [sendUpdates, setSendUpdates] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActiveCampaigns = async () => {
      try {
        const response = await axiosInstance.get('/campaigns/active');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setActiveCampaigns(response.data);
          setCause(response.data[0].title);
        }
      } catch (error) {
        console.error('Failed to load active campaigns for donation form', error);
      }
    };
    fetchActiveCampaigns();
  }, []);

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('anonymousDonations');
      if (saved) {
        try {
          setRecentDonations(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent donations');
        }
      }
    } else {
      setRecentDonations([]);
    }
  }, [user, showSuccessModal]);

  const onDonationClick = () => {
    const amt = donationAmount || '500';
    handleDonation(amt, setIsLoading, user, (data) => {
      setDonationData(data);
      setShowSuccessModal(true);
    });
  };

  const presetAmounts = ['500', '1000', '2000', '5000'];

  return (
    <section id="donate" className="py-4 md:py-6 bg-fafafa dark:bg-zinc-950 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
              Support Us
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight">
              Support our cause
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">
              Your contribution fuels programs that change lives. Choose an amount and cause to begin your journey of impact today.
            </p>

            {/* Impact Breakdown */}
            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 mt-0.5">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    ₹500 educates a child
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Covers school supplies and educational materials for one term.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 mt-0.5">
                  <Utensils className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    ₹1000 feeds a family
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Provides essential meal kits and nutrition for a whole month.
                  </p>
                </div>
              </div>
            </div>

            {/* Always Visible Direct Bank Details Box */}
            <div className="border border-gray-200/80 dark:border-zinc-800 rounded-xl p-4 bg-gray-50/70 dark:bg-zinc-900/80">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200/60 dark:border-zinc-800">
                <Building2 className="w-4 h-4 text-zinc-800 dark:text-zinc-200" />
                <span className="text-xs font-bold text-zinc-900 dark:text-white">
                  Direct Bank Transfer Details
                </span>
              </div>

              <div className="space-y-2 text-xs">
                {[
                  { label: 'Account Name', value: 'Blackrose Foundation' },
                  { label: 'Account Number', value: '251908200515' },
                  { label: 'Bank Name', value: 'IndusInd Bank' },
                  { label: 'Branch', value: 'Ratan lal Nagar Kanpur' },
                  { label: 'IFSC Code', value: 'INDB0002088' }
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center py-1 border-b border-gray-200/40 dark:border-zinc-800/40 last:border-0">
                    <span className="text-zinc-500 dark:text-zinc-400 font-medium">{item.label}:</span>
                    <span className="font-mono text-zinc-900 dark:text-white font-semibold bg-gray-200/60 dark:bg-zinc-800 px-2 py-0.5 rounded">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Note & Recent Anonymous Donations */}
            {!user && (
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    Anonymous donations reset on page refresh. To save your tax certificates anytime, please{' '}
                    <button onClick={() => setShowLogin(true)} className="underline font-bold hover:opacity-80">Login</button>.
                  </p>
                </div>

                {recentDonations.length > 0 && (
                  <div className="bg-gray-50 dark:bg-zinc-900 p-3 rounded-xl border border-gray-200/70 dark:border-zinc-800 text-xs">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      Recent Donations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentDonations.map((don) => (
                        <div key={don.donationId} className="flex items-center gap-2 bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-zinc-700">
                          <span className="font-bold">₹{don.amount}</span>
                          <div className="flex gap-1">
                            <button onClick={() => navigate(`/certificate/${don.donationId}`)} className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white underline">Certificate</button>
                            <span>•</span>
                            <button onClick={() => navigate(`/invoice/${don.donationId}`)} className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white underline">Invoice</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column Interactive Donation Card matching Screen 1 */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-md text-left">
              
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                Make a Donation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                Every gift makes a difference.
              </p>

              {/* Choose Cause / Active Running Campaigns - Positioned on Top */}
              <div className="mb-5">
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Choose a Cause or Running Campaign</span>
                  {activeCampaigns.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/40 px-2 py-0.5 rounded-full">
                      {activeCampaigns.length} Active Drive{activeCampaigns.length > 1 ? 's' : ''}
                    </span>
                  )}
                </label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer"
                >
                  {activeCampaigns.length > 0 && (
                    <optgroup label="🔥 Active Running Campaigns">
                      {activeCampaigns.map((camp) => (
                        <option key={camp._id} value={camp.title}>
                          Campaign: {camp.title}
                        </option>
                      ))}
                    </optgroup>
                  )}
                  <optgroup label="General Causes">
                    <option value="Education">Education & School Supplies</option>
                    <option value="Relief">Emergency Relief & Food Rations</option>
                    <option value="Healthcare">Healthcare & Health Camps</option>
                    <option value="General">General Community Welfare</option>
                  </optgroup>
                </select>
              </div>

              {/* Select Amount */}
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
                Select amount
              </label>

              <div className="grid grid-cols-4 gap-2 mb-4">
                {presetAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setDonationAmount(amt)}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      donationAmount === amt
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white'
                        : 'bg-gray-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-700 hover:bg-gray-100'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Custom Input */}
              <div className="mb-4">
                <input
                  type="number"
                  placeholder="Or enter custom amount in ₹"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                />
              </div>

              {/* Amount Banner */}
              <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-xl text-center text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-6 border border-gray-200/50 dark:border-zinc-700/50">
                You're donating <span className="text-zinc-900 dark:text-white font-extrabold text-sm">₹{donationAmount || '500'}</span>
              </div>

              {/* Impact Updates Toggle */}
              <div className="flex items-center justify-between py-3 border-t border-b border-gray-100 dark:border-zinc-800 mb-6">
                <div>
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white">
                    Send me impact updates
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Occasional stories from the field.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSendUpdates(!sendUpdates)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    sendUpdates ? 'bg-zinc-900 dark:bg-white' : 'bg-gray-200 dark:bg-zinc-700'
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white dark:bg-zinc-900 absolute top-1 transition-transform ${
                    sendUpdates ? 'right-1' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Submit Button matching Screen 1 */}
              <button
                onClick={onDonationClick}
                disabled={isLoading}
                className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isLoading ? 'Processing...' : 'Donate Now'}</span>
                <Heart className="w-4 h-4 fill-white dark:fill-zinc-900" />
              </button>

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
            user={user}
          />
        )}
      </Suspense>
    </section>
  );
};

export default DonationSection;