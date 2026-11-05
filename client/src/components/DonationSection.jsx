import React, { useState, useEffect, Suspense, lazy } from 'react';
import axiosInstance from '../utils/api';
import { handleDonation } from '../utils/apiHandlers';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Heart, 
  GraduationCap, 
  Utensils, 
  Building2, 
  CheckCircle2, 
  History, 
  AlertCircle, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Copy, 
  Check, 
  CreditCard, 
  ArrowRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import QRCode from 'qrcode';
import { useFoundationSettings } from '../hooks/useFoundationSettings';
import { buildUpiUrl } from '../utils/upiUtils';

const PostDonationModal = lazy(() => import('./modals/PostDonationModal'));

const DonationSection = ({ donationAmount, setDonationAmount, isLoading, setIsLoading, user, setShowLogin }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationData, setDonationData] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const [cause, setCause] = useState('Education');
  const [activeCampaigns, setActiveCampaigns] = useState([]);
  const [sendUpdates, setSendUpdates] = useState(true);
  const [volunteerInfo, setVolunteerInfo] = useState(null);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const [paymentTab, setPaymentTab] = useState('online'); // 'online' | 'qr'
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const { upiId: officialUpiId, upiPayeeName, qrCodeUrl: customQrCodeUrl } = useFoundationSettings();
  const volunteerCodeParam = searchParams.get('volunteer');

  useEffect(() => {
    let timer;
    const handleHighlight = () => {
      setIsHighlighted(true);
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        setIsHighlighted(false);
      }, 4500);
    };

    window.addEventListener('highlightDonationSection', handleHighlight);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener('highlightDonationSection', handleHighlight);
    };
  }, []);

  useEffect(() => {
    // If admin uploaded a custom bank standee QR image
    if (customQrCodeUrl) {
      setQrCodeDataUrl(customQrCodeUrl);
      return;
    }

    const generateQr = async () => {
      try {
        const upiString = buildUpiUrl({
          upiId: officialUpiId,
          payeeName: upiPayeeName,
          amount: null // Static/open QR for scanning any amount
        });
        const dataUrl = await QRCode.toDataURL(upiString, {
          width: 260,
          margin: 1,
          color: {
            dark: '#09090b',
            light: '#ffffff'
          }
        });
        setQrCodeDataUrl(dataUrl);
      } catch (err) {
        console.error('Failed to generate donation QR code:', err);
      }
    };
    generateQr();
  }, [officialUpiId, upiPayeeName, customQrCodeUrl]);

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(officialUpiId);
    setCopiedUpi(true);
    toast.success('UPI ID copied: ' + officialUpiId);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  useEffect(() => {
    if (volunteerCodeParam) {
      axiosInstance.get(`/volunteers/code/${volunteerCodeParam}`)
        .then(res => {
          setVolunteerInfo({
            volunteerId: res.data._id,
            volunteerCode: res.data.volunteerCode,
            volunteerName: res.data.name
          });
        })
        .catch(err => console.warn('Could not load volunteer for donation section:', err));
    }
  }, [volunteerCodeParam]);

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
    }, volunteerInfo);
  };

  const presetAmounts = ['500', '1000', '2000', '5000'];

  return (
    <section 
      id="donate" 
      className={`py-8 md:py-12 transition-all duration-700 border-t border-b ${
        isHighlighted 
          ? 'bg-amber-100 dark:bg-amber-950/70 border-amber-400 dark:border-amber-600 ring-4 ring-amber-400/80 shadow-[0_0_80px_rgba(251,191,36,0.35)]' 
          : 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-200/70 dark:border-amber-900/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Content */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5 block">
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
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 mt-0.5 shadow-xs border border-amber-200/50 dark:border-zinc-700">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
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
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 mt-0.5 shadow-xs border border-amber-200/50 dark:border-zinc-700">
                  <Utensils className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    ₹1,000 feeds a family
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Provides essential groceries and nutritious ration kits for a week.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0 mt-0.5 shadow-xs border border-amber-200/50 dark:border-zinc-700">
                  <Building2 className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    ₹2,000 empowers women
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Funds vocational training and small-scale self-help business setups.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Bank Account Transfer Card */}
            <div className="bg-white/80 dark:bg-zinc-900/80 p-5 rounded-2xl border border-amber-200/80 dark:border-zinc-800 shadow-xs mb-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
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
                    <span className="font-mono text-zinc-900 dark:text-white font-semibold bg-amber-50 dark:bg-zinc-800 px-2 py-0.5 rounded border border-amber-200/40 dark:border-zinc-700">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick UPI QR Scan Switcher */}
            <div 
              onClick={() => setPaymentTab('qr')}
              className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-100/90 via-amber-50 to-amber-100/60 dark:from-zinc-900 dark:to-amber-950/30 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-zinc-950 flex items-center justify-center font-bold shrink-0 shadow-xs">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    Prefer direct UPI QR code scan?
                  </h4>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Pay instantly via Google Pay, PhonePe, or Paytm
                  </p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform" />
            </div>

            {/* Note & Recent Anonymous Donations */}
            {!user && (
              <div className="mt-5 space-y-3">
                <div className="flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300 bg-amber-100/70 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900/40">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                  <p>
                    Anonymous donations reset on page refresh. To save your tax certificates anytime, please{' '}
                    <button onClick={() => setShowLogin(true)} className="underline font-bold hover:opacity-80 cursor-pointer">Login</button>.
                  </p>
                </div>

                {recentDonations.length > 0 && (
                  <div className="bg-white/80 dark:bg-zinc-900 p-3 rounded-xl border border-gray-200/70 dark:border-zinc-800 text-xs">
                    <div className="font-semibold text-zinc-800 dark:text-zinc-200 mb-1.5 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5" />
                      Recent Donations
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentDonations.map((don) => (
                        <div key={don.donationId} className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 px-2 py-0.5 rounded-lg border border-gray-200 dark:border-zinc-700">
                          <span className="font-bold">₹{don.amount}</span>
                          <div className="flex gap-1">
                            <button onClick={() => navigate(`/certificate/${don.donationId}`)} className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white underline cursor-pointer">Certificate</button>
                            <span>•</span>
                            <button onClick={() => navigate(`/invoice/${don.donationId}`)} className="text-zinc-600 dark:text-zinc-300 hover:text-black dark:hover:text-white underline cursor-pointer">Invoice</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Right Column Interactive Donation Card */}
          <div className="lg:col-span-6 w-full">
            <div 
              className={`bg-white dark:bg-zinc-900 border rounded-2xl p-6 sm:p-7 shadow-md text-left transition-all duration-700 ${
                isHighlighted
                  ? 'ring-4 ring-amber-400 border-amber-400 shadow-[0_0_60px_rgba(251,191,36,0.35)] scale-[1.01]'
                  : 'border-gray-200/80 dark:border-zinc-800'
              }`}
            >
              {isHighlighted && (
                <div className="mb-4 py-2 px-3.5 bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/40 rounded-xl flex items-center gap-2.5 text-amber-800 dark:text-amber-200 text-xs font-bold animate-fadeIn">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 animate-pulse shrink-0" />
                  <span>Ready to make an impact! Choose your payment method below.</span>
                </div>
              )}
              
              <h3 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                Make a Donation
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
                Every gift makes a difference.
              </p>

              {/* Payment Mode Selector Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-gray-100 dark:bg-zinc-800 rounded-xl mb-5">
                <button
                  type="button"
                  onClick={() => setPaymentTab('online')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentTab === 'online'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Instant Online Pay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTab('qr')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentTab === 'qr'
                      ? 'bg-amber-500 text-zinc-950 shadow-xs'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>Scan UPI QR Code</span>
                </button>
              </div>

              {paymentTab === 'online' ? (
                <>
                  {/* Supporting Volunteer Badge if present */}
                  {volunteerInfo && (
                    <div className="mb-5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700/60 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[11px] font-bold text-amber-900 dark:text-amber-200">
                            Supporting Volunteer: {volunteerInfo.volunteerName}
                          </div>
                          <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400">
                            ID: {volunteerInfo.volunteerCode}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setVolunteerInfo(null)}
                        className="text-[10px] font-semibold text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                  )}

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
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-xs'
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

                  {/* Submit Button */}
                  <button
                    onClick={onDonationClick}
                    disabled={isLoading}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 group"
                  >
                    <span>{isLoading ? 'Processing...' : 'Donate Now'}</span>
                    <Heart className="w-4 h-4 fill-white dark:fill-zinc-900 group-hover:scale-110 transition-transform" />
                  </button>
                </>
              ) : (
                /* QR Scan View - Clean QR Only */
                <div className="space-y-4 animate-fadeIn">
                  <div className="text-center bg-gray-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-gray-200/70 dark:border-zinc-800">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                      Direct UPI Instant Payment
                    </span>
                    <h4 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white mb-4">
                      Scan with Any UPI App
                    </h4>

                    {/* QR Code Container */}
                    <div className="bg-white p-3 rounded-2xl border border-gray-200 shadow-md max-w-[240px] mx-auto mb-4">
                      {qrCodeDataUrl ? (
                        <img 
                          src={qrCodeDataUrl} 
                          alt="Blackrose Foundation Direct UPI QR" 
                          className="w-full h-auto object-contain mx-auto rounded-lg"
                        />
                      ) : (
                        <div className="w-52 h-52 flex items-center justify-center text-xs text-zinc-400">
                          Generating QR...
                        </div>
                      )}
                    </div>

                    {/* Official UPI ID Copy Box */}
                    <div className="flex items-center justify-between gap-2 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2.5 rounded-xl text-left max-w-[300px] mx-auto">
                      <div className="min-w-0">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block">
                          Official Foundation UPI ID
                        </span>
                        <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate block">
                          {officialUpiId}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyUpi}
                        className="inline-flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer transition-colors"
                      >
                        {copiedUpi ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedUpi ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 font-medium">
                      Scan using any UPI app on your phone to donate any amount directly.
                    </p>
                  </div>

                  <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 rounded-xl p-3 flex items-center gap-2 text-[11px] text-amber-900 dark:text-amber-300">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Direct deposits credit directly to registered IndusInd Bank account • 80G Tax Exempt</span>
                  </div>
                </div>
              )}

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
