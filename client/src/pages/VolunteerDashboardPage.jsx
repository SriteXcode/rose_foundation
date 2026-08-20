import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  Download, 
  Share2, 
  Copy, 
  ExternalLink, 
  Heart, 
  Users, 
  TrendingUp, 
  Calendar, 
  Search, 
  FileText, 
  Receipt, 
  ArrowLeft, 
  Sparkles,
  Lock,
  Building2,
  CheckCircle2,
  Edit3
} from 'lucide-react';
import { CLOUDINARY_LOGO_URL } from '../utils/constants';
import localLogo from '../assets/logo.webp';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

const VolunteerDashboardPage = () => {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();

  const [volunteerCode, setVolunteerCode] = useState(routeCode || '');
  const [searchInput, setSearchInput] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState('');
  const [isSavingUpi, setIsSavingUpi] = useState(false);

  const handleSaveCustomUpi = async () => {
    if (!dashboardData?.volunteer?._id) return;
    const trimmed = customUpiInput.trim();
    if (trimmed !== '' && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(trimmed)) {
      toast.error('Invalid UPI ID format! Must follow handle@bank format (e.g. name@icici, 9876543210@paytm). Cannot save an invalid UPI ID.');
      return;
    }

    setIsSavingUpi(true);
    try {
      const response = await axiosInstance.put(`/volunteers/${dashboardData.volunteer._id}`, {
        upiId: trimmed
      });
      toast.success('Unique UPI ID updated successfully!');
      setDashboardData(prev => ({
        ...prev,
        volunteer: { ...prev.volunteer, upiId: trimmed }
      }));
      setIsEditingUpi(false);
    } catch (error) {
      console.error('Save UPI ID error:', error);
      toast.error(error.response?.data?.error || 'Failed to update UPI ID');
    } finally {
      setIsSavingUpi(false);
    }
  };

  const badgeRef = useRef(null);

  // Fetch dashboard data
  const fetchDashboard = async (codeToFetch) => {
    setLoading(true);
    try {
      let endpoint = '';
      if (codeToFetch) {
        endpoint = `/volunteers/dashboard/${codeToFetch}`;
      } else {
        // Try fetching current logged-in user's volunteer portal
        endpoint = `/volunteers/my-portal`;
      }

      const response = await axiosInstance.get(endpoint);
      setDashboardData(response.data);
      const activeCode = response.data.volunteer.fundraiserCode || response.data.volunteer.volunteerCode;
      setVolunteerCode(activeCode);

      // Generate dynamic QR Code for the ledger
      const publicDonationUrl = `${window.location.origin}/v/${activeCode}`;
      const qrUrl = await QRCode.toDataURL(publicDonationUrl, {
        width: 320,
        margin: 1,
        color: {
          dark: '#09090b',
          light: '#ffffff'
        }
      });
      setQrDataUrl(qrUrl);
    } catch (error) {
      console.error('Failed to fetch volunteer dashboard:', error);
      const msg = error.response?.data?.error || 'Unable to load volunteer dashboard. Please check the volunteer code.';
      toast.error(msg);
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard(routeCode);
  }, [routeCode]);

  const handleSearchCode = (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    navigate(`/volunteer/dashboard/${searchInput.trim().toUpperCase()}`);
  };

  const copyDonationLink = () => {
    const code = dashboardData?.volunteer?.fundraiserCode || dashboardData?.volunteer?.volunteerCode;
    if (!code) return;
    const url = `${window.location.origin}/v/${code}`;
    navigator.clipboard.writeText(url);
    toast.success('Unique donation link copied to clipboard!');
  };

  const shareOnWhatsApp = () => {
    if (!dashboardData?.volunteer) return;
    const vol = dashboardData.volunteer;
    const code = vol.fundraiserCode || vol.volunteerCode;
    const url = `${window.location.origin}/v/${code}`;
    const text = `🙏 Namaste! I am ${vol.name}, volunteering with Black Rose Foundation (NGO). Support our social welfare programs and education initiatives by making a small donation through my official link: ${url}\n\nAll donations receive instant 80G tax exemptions & certificates. Every contribution matters!`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const downloadIDBadge = async () => {
    if (!badgeRef.current) return;
    setIsGeneratingBadge(true);
    try {
      const canvas = await html2canvas(badgeRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = imgData;
      link.download = `${dashboardData?.volunteer?.name?.replace(/\s+/g, '_')}_BRF_ID_Badge.png`;
      link.click();
      toast.success('ID Badge & QR Poster downloaded successfully!');
    } catch (error) {
      console.error('Error generating badge image:', error);
      toast.error('Failed to download badge image.');
    } finally {
      setIsGeneratingBadge(false);
    }
  };

  const exportLedgerToCSV = () => {
    if (!dashboardData?.donations || dashboardData.donations.length === 0) {
      toast.error('No donation records to export');
      return;
    }

    const headers = ['Date', 'Time', 'Donor Name', 'Amount (INR)', 'Transaction ID', 'Status', 'Payment Method'];
    const rows = dashboardData.donations.map((d) => {
      const dateObj = new Date(d.createdAt);
      return [
        `"${dateObj.toLocaleDateString()}"`,
        `"${dateObj.toLocaleTimeString()}"`,
        `"${d.donorName || 'Anonymous'}"`,
        d.amount,
        `"${d.transactionId || '-'}"`,
        `"${d.status}"`,
        `"${d.paymentMethod || 'Razorpay'}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${dashboardData.volunteer.name}_Donation_Ledger.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Donation ledger exported to CSV');
  };

  const filteredDonations = dashboardData?.donations?.filter((d) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = (d.donorName || '').toLowerCase().includes(term);
    const txnMatch = (d.transactionId || '').toLowerCase().includes(term);
    const amountMatch = String(d.amount).includes(term);
    return nameMatch || txnMatch || amountMatch;
  }) || [];

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 pt-20 sm:pt-24 pb-16 transition-colors text-left">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation & Header Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>

          {/* Quick Lookup Bar */}
          <form onSubmit={handleSearchCode} className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Enter Volunteer Code (e.g. BRF-VOL-...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
              />
            </div>
            <button
              type="submit"
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white px-4 py-2 rounded-full text-xs font-semibold cursor-pointer shadow-sm shrink-0"
            >
              Lookup
            </button>
          </form>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
            <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mx-auto"></div>
          </div>
        ) : dashboardData ? (
          <>
            {/* Top Volunteer Banner & Quick Actions */}
            <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm mb-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                
                {/* Volunteer Details */}
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="relative shrink-0">
                    <img
                      src={dashboardData.volunteer.image || DEFAULT_AVATAR}
                      alt={dashboardData.volunteer.name}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 bg-amber-500 text-zinc-950 p-1 rounded-full shadow-md">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/50 dark:border-amber-800/60">
                        Official Volunteer Fundraiser
                      </span>
                      <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-gray-200 dark:border-zinc-700">
                        {dashboardData.volunteer.volunteerCode}
                      </span>
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                      {dashboardData.volunteer.name}
                    </h1>
                    
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      {dashboardData.volunteer.designation || dashboardData.volunteer.role} • Joined {new Date(dashboardData.volunteer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Top Action Buttons */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  <button
                    onClick={copyDonationLink}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-2.5 rounded-full text-xs font-semibold border border-gray-200 dark:border-zinc-700 transition-all cursor-pointer shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </button>

                  <button
                    onClick={shareOnWhatsApp}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={downloadIDBadge}
                    disabled={isGeneratingBadge}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-4 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer shadow-sm disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isGeneratingBadge ? 'Generating...' : 'Download ID Badge'}</span>
                  </button>

                  <button
                    onClick={() => navigate(`/v/${dashboardData.volunteer.volunteerCode}`)}
                    className="p-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-zinc-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 cursor-pointer"
                    title="Open Public Donation Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              
              {/* Stat 1: Total Raised */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Total Raised</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Heart className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    ₹{dashboardData.stats.totalRaised.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">100% Attributed Collections</span>
                </div>
              </div>

              {/* Stat 2: Total Donors */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Generous Donors</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    {dashboardData.stats.donorCount}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Supporters via your QR</span>
                </div>
              </div>

              {/* Stat 3: Average Donation */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">Avg Contribution</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    ₹{dashboardData.stats.averageDonation.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Average per donation</span>
                </div>
              </div>

              {/* Stat 4: This Month */}
              <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between text-zinc-400 mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider">This Month</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white">
                    ₹{dashboardData.stats.thisMonthRaised.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1 block">Current monthly progress</span>
                </div>
              </div>

            </div>

            {/* Layout Grid: ID Badge Preview & Transparency Table */}
            <div className="grid lg:grid-cols-12 gap-8 items-start mb-8">
              
              {/* Left Column: Official ID Badge Card (Printable) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                      Official ID & Dual QR Badge
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                      Ready to Print
                    </span>
                  </div>

                  {/* Printable ID Badge Container */}
                  <div 
                    ref={badgeRef}
                    className="bg-white text-zinc-950 border border-gray-300 rounded-2xl p-5 shadow-md flex flex-col items-center text-center relative overflow-hidden"
                  >
                    {/* Top Strip */}
                    <div className="w-full bg-zinc-900 text-white py-2 px-3 rounded-xl mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img src={localLogo} alt="Logo" className="w-5 h-5 invert" />
                        <span className="text-[11px] font-extrabold tracking-tight">Black Rose Foundation</span>
                      </div>
                      <span className="text-[9px] font-mono bg-amber-400 text-zinc-950 font-bold px-1.5 py-0.5 rounded">
                        {dashboardData.volunteer.isFundraiser ? 'FUNDRAISER' : 'VOLUNTEER'}
                      </span>
                    </div>

                    {/* Photo */}
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm mb-2">
                      <img
                        src={dashboardData.volunteer.image || DEFAULT_AVATAR}
                        alt={dashboardData.volunteer.name}
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                      />
                    </div>

                    <h4 className="text-base font-extrabold text-zinc-900 leading-tight">
                      {dashboardData.volunteer.name}
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      {dashboardData.volunteer.designation || 'Official Fundraiser Lead'}
                    </p>
                    
                    <div className="bg-gray-100 border border-gray-200 px-2.5 py-0.5 rounded-md font-mono text-[10px] font-bold text-zinc-700 my-2">
                      ID: {dashboardData.volunteer.fundraiserCode || dashboardData.volunteer.volunteerCode}
                    </div>

                    {/* Dual QR Code Container */}
                    {dashboardData.volunteer.directPaymentQrImage ? (
                      <div className="w-full grid grid-cols-2 gap-2 my-2">
                        {/* QR 1: Direct Payment */}
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded-xl flex flex-col items-center justify-between">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded mb-1">
                            QR 1 • UPI Direct Pay
                          </span>
                          <img 
                            src={dashboardData.volunteer.directPaymentQrImage} 
                            alt="Direct Razorpay UPI QR" 
                            className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto" 
                            crossOrigin="anonymous"
                          />
                          <p className="text-[8px] font-bold text-zinc-800 mt-1">
                            GPay • PhonePe • Paytm
                          </p>
                        </div>

                        {/* QR 2: Ledger & Profile */}
                        <div className="bg-gray-50 border border-gray-200 p-2 rounded-xl flex flex-col items-center justify-between">
                          <span className="text-[8px] font-extrabold uppercase tracking-wider text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded mb-1">
                            QR 2 • Transparency
                          </span>
                          {qrDataUrl ? (
                            <img 
                              src={qrDataUrl} 
                              alt="Transparency Ledger QR" 
                              className="w-24 h-24 sm:w-28 sm:h-28 object-contain mx-auto" 
                            />
                          ) : (
                            <div className="w-24 h-24 flex items-center justify-center text-[10px] text-zinc-400">Loading...</div>
                          )}
                          <p className="text-[8px] font-bold text-zinc-800 mt-1">
                            Live Audit & 80G Tax
                          </p>
                        </div>
                      </div>
                    ) : (
                      /* Single Fallback QR Container */
                      <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-xs mb-2">
                        {qrDataUrl ? (
                          <img src={qrDataUrl} alt="Donation QR Code" className="w-36 h-36 object-contain mx-auto" />
                        ) : (
                          <div className="w-36 h-36 flex items-center justify-center text-xs text-zinc-400">Loading QR...</div>
                        )}
                        <p className="text-[9px] font-bold text-zinc-800 mt-1">
                          Scan with Camera to Donate & View Audit Ledger
                        </p>
                      </div>
                    )}

                    <p className="text-[9px] text-zinc-500 mt-1">
                      100% Tax Deductible (80G) • Direct Credited to Black Rose Foundation
                    </p>

                    {/* Unique UPI ID Card with Inline Customization */}
                    <div className="mt-2.5 text-center bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between gap-2 px-3">
                      <div className="text-left min-w-0 flex-1">
                        <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">Unique UPI ID / VPA</span>
                        {isEditingUpi ? (
                          <div className="flex items-center gap-1 mt-1">
                            <input
                              type="text"
                              value={customUpiInput}
                              onChange={(e) => setCustomUpiInput(e.target.value)}
                              placeholder="e.g. name@upi"
                              className="font-mono text-xs bg-white dark:bg-zinc-900 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 rounded text-zinc-900 dark:text-white w-full max-w-[160px]"
                            />
                            <button
                              type="button"
                              onClick={handleSaveCustomUpi}
                              disabled={isSavingUpi}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer shrink-0"
                            >
                              {isSavingUpi ? '...' : 'Save'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsEditingUpi(false)}
                              className="bg-gray-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-[9px] font-bold px-1.5 py-1 rounded cursor-pointer shrink-0"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white truncate block">
                            {dashboardData?.volunteer?.upiId || 'No UPI ID set (Click Edit)'}
                          </span>
                        )}
                      </div>

                      {!isEditingUpi && (
                        <div className="flex items-center gap-1 shrink-0">
                          {dashboardData?.volunteer?.upiId && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(dashboardData.volunteer.upiId);
                                toast.success('UPI ID copied!');
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-bold px-2 py-1 rounded cursor-pointer"
                            >
                              Copy
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              setCustomUpiInput(dashboardData?.volunteer?.upiId || '');
                              setIsEditingUpi(true);
                            }}
                            className="bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-200 text-[9px] font-bold px-2 py-1 rounded cursor-pointer flex items-center gap-1"
                            title="Customize UPI ID"
                          >
                            <Edit3 className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={downloadIDBadge}
                      disabled={isGeneratingBadge}
                      className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Printable Poster</span>
                    </button>
                  </div>
                </div>

                {/* Transparency Guarantee Card */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl p-4 text-xs space-y-2 text-emerald-900 dark:text-emerald-300">
                  <div className="flex items-center gap-2 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Razorpay Real-Time Webhook Audit</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-emerald-800 dark:text-emerald-400">
                    All direct payments made via your Razorpay UPI QR code deposit straight into the foundation's official bank account and are securely credited to your live transparency ledger in real time.
                  </p>
                </div>
              </div>

              {/* Right Column: Transparency Ledger Table */}
              <div className="lg:col-span-7 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                
                {/* Table Header & Search */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-zinc-800">
                  <div>
                    <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                      Transparency Payment Ledger
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Verified payments received exclusively through your unique QR code & link.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="relative flex-1 sm:w-48">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search ledger..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    
                    <button
                      onClick={exportLedgerToCSV}
                      className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 text-zinc-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shrink-0"
                      title="Export to CSV"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">CSV</span>
                    </button>
                  </div>
                </div>

                {/* Table */}
                {filteredDonations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-zinc-800 text-zinc-400 font-semibold">
                          <th className="pb-3 px-3">Date & Time</th>
                          <th className="pb-3 px-3">Donor Name</th>
                          <th className="pb-3 px-3">Amount</th>
                          <th className="pb-3 px-3">Payment ID</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3 text-right">Receipt</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                        {filteredDonations.map((donation) => {
                          const dateObj = new Date(donation.createdAt);
                          return (
                            <tr key={donation._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                              <td className="py-3.5 px-3 text-zinc-700 dark:text-zinc-300 font-medium">
                                <div>{dateObj.toLocaleDateString()}</div>
                                <div className="text-[10px] text-zinc-400">{dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                              </td>

                              <td className="py-3.5 px-3 font-semibold text-zinc-900 dark:text-white">
                                {donation.donorName || 'Anonymous Donor'}
                              </td>

                              <td className="py-3.5 px-3 font-extrabold text-emerald-600 dark:text-emerald-400">
                                ₹{donation.amount.toLocaleString()}
                              </td>

                              <td className="py-3.5 px-3 text-zinc-500 font-mono text-[11px]">
                                {donation.transactionId || '-'}
                              </td>

                              <td className="py-3.5 px-3">
                                <span className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Verified</span>
                                </span>
                              </td>

                              <td className="py-3.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => navigate(`/certificate/${donation._id}`)}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Certificate"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span className="hidden sm:inline">Cert</span>
                                  </button>
                                  <button
                                    onClick={() => navigate(`/invoice/${donation._id}`)}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Invoice"
                                  >
                                    <Receipt className="w-3 h-3" />
                                    <span className="hidden sm:inline">Tax</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                      {searchTerm ? 'No matching donations found' : 'No donations received yet'}
                    </h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      {searchTerm 
                        ? 'Try clearing your search query to see all contributions.' 
                        : 'Share your unique QR code or WhatsApp donation link with friends, family, and supporters to start raising funds!'}
                    </p>
                    <button
                      onClick={shareOnWhatsApp}
                      className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-sm cursor-pointer mt-2"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                      <span>Share on WhatsApp to Begin</span>
                    </button>
                  </div>
                )}

              </div>

            </div>
          </>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Volunteer Portal</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Enter your unique Volunteer Code to view your QR code, printable ID poster, and live transparency collection ledger.
            </p>
            <form onSubmit={handleSearchCode} className="space-y-3">
              <input
                type="text"
                placeholder="Enter Volunteer Code (e.g. BRF-VOL-...)"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white text-center font-mono font-semibold uppercase"
                required
              />
              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white py-3 rounded-xl text-xs font-semibold cursor-pointer shadow-sm"
              >
                Access Dashboard
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};

export default VolunteerDashboardPage;
