import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { 
  ShieldCheck, 
  ShieldAlert,
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
  Edit3,
  PenLine,
  Plus,
  Clock,
  AlertCircle,
  Trash2,
  Eye,
  BookOpen,
  X
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { CLOUDINARY_LOGO_URL } from '../utils/constants';
import localLogo from '../assets/logo.webp';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

const VolunteerDashboardPage = () => {
  const { code: routeCode } = useParams();
  const navigate = useNavigate();
  const { user, authLoading, setShowLogin } = useAuth();

  const [volunteerCode, setVolunteerCode] = useState(routeCode || '');
  const [searchInput, setSearchInput] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingBadge, setIsGeneratingBadge] = useState(false);
  const [isEditingUpi, setIsEditingUpi] = useState(false);
  const [customUpiInput, setCustomUpiInput] = useState('');
  const [isSavingUpi, setIsSavingUpi] = useState(false);

  // Field Stories & Blog Management State
  const [activeTab, setActiveTab] = useState('ledger'); // 'ledger' | 'stories'
  const [myPosts, setMyPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [storySearchTerm, setStorySearchTerm] = useState('');

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
    setAuthError(null);
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
      fetchMyPosts(response.data.volunteer);
    } catch (error) {
      console.error('Failed to fetch volunteer dashboard:', error);
      const status = error.response?.status;
      const errorMsg = error.response?.data?.error || error.response?.data?.message || 'Unable to load volunteer dashboard.';
      if (status === 401 || status === 403) {
        setAuthError({ status, message: errorMsg });
      } else {
        toast.error(errorMsg);
      }
      setDashboardData(null);
    } finally {
      setLoading(false);
    }
  };

  const isOwner = Boolean(
    user && dashboardData?.volunteer && (
      !routeCode ||
      (dashboardData.volunteer.userId && String(user.id) === String(dashboardData.volunteer.userId)) ||
      (dashboardData.volunteer.email && user.email?.toLowerCase() === dashboardData.volunteer.email?.toLowerCase())
    )
  );

  const fetchMyPosts = async (currentVolunteerData) => {
    setLoadingPosts(true);
    try {
      const vol = currentVolunteerData || dashboardData?.volunteer;
      const ownerCheck = Boolean(
        user && vol && (
          !routeCode ||
          (vol.userId && String(user.id) === String(vol.userId)) ||
          (vol.email && user.email?.toLowerCase() === vol.email?.toLowerCase())
        )
      );

      if (ownerCheck) {
        const response = await axiosInstance.get('/blog/my-posts');
        setMyPosts(response.data.posts || []);
      } else if (vol?._id) {
        const response = await axiosInstance.get(`/blog?volunteerId=${vol._id}&limit=100`);
        setMyPosts(response.data.posts || []);
      } else {
        setMyPosts([]);
      }
    } catch (error) {
      console.error('Failed to fetch volunteer stories:', error);
      setMyPosts([]);
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user && routeCode) {
      // Unauthenticated visitor looking at a volunteer's public portal
      fetchDashboard(routeCode);
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    fetchDashboard(routeCode);
  }, [routeCode, authLoading, user]);

  const handleOpenCreateStory = () => {
    navigate('/volunteer/story/new');
  };

  const handleOpenEditStory = (post) => {
    navigate(`/volunteer/story/edit/${post._id}`);
  };

  const handleDeleteStory = async (id) => {
    if (!window.confirm('Are you sure you want to delete this story? This action cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/blog/${id}`);
      toast.success('Story deleted successfully');
      setMyPosts(prev => prev.filter(p => p._id !== id));
    } catch (error) {
      console.error('Failed to delete story:', error);
      toast.error(error.response?.data?.error || 'Failed to delete story');
    }
  };

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

          {/* Quick Lookup Bar: Administrators Only */}
          {user?.role === 'admin' && (
            <form onSubmit={handleSearchCode} className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Admin: Lookup Code (BRF-VOL-...)"
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
          )}
        </div>

        {authLoading || (loading && user) ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-12 text-center animate-pulse">
            <div className="w-16 h-16 bg-gray-200 dark:bg-zinc-800 rounded-full mx-auto mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded w-1/4 mx-auto mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded w-1/3 mx-auto"></div>
          </div>
        ) : !user ? (
          <div className="bg-white dark:bg-zinc-900 border border-amber-300 dark:border-amber-700/60 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-lg relative overflow-hidden">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800 mb-3 inline-block">
              Fundraiser & Admin Access Only
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
              Fundraiser's Transparency Ledger
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              This live collection ledger and real-time donation audit is private. Only the authorized fundraiser and foundation administrators can view this page.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => setShowLogin(true)}
                className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Log In to View Ledger
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                Back to Home
              </button>
            </div>
          </div>
        ) : authError?.status === 403 ? (
          <div className="bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/50 rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto shadow-lg">
            <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-5 shadow-xs">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 px-3 py-1 rounded-full border border-red-200 dark:border-red-800 mb-3 inline-block">
              Access Denied
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white mb-2">
              Unauthorized Ledger Access
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mb-6 leading-relaxed">
              {authError.message || "This transparency ledger belongs to another fundraiser. Only that fundraiser or foundation administrators are authorized to access it."}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/volunteer/dashboard')}
                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                Go to My Dashboard
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                Back to Home
              </button>
            </div>
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

            {/* Tab Navigation: Transparency Ledger vs Field Stories */}
            <div className="flex flex-wrap items-center gap-2 mb-6 border-b border-gray-200 dark:border-zinc-800 pb-3">
              <button
                type="button"
                onClick={() => setActiveTab('ledger')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'ledger'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <Receipt className="w-4 h-4" />
                <span>Transparency Ledger & Dual QR Badge</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('stories')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer relative ${
                  activeTab === 'stories'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800/60'
                }`}
              >
                <PenLine className="w-4 h-4" />
                <span>{isOwner ? 'My Field Stories & Blogs' : `${dashboardData.volunteer.name}'s Field Stories`}</span>
                {myPosts.length > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'stories' 
                      ? 'bg-amber-400 text-zinc-950' 
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}>
                    {myPosts.length}
                  </span>
                )}
                {myPosts.some(p => p.status === 'pending') && (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Story pending approval" />
                )}
              </button>
            </div>

            {/* Tab 1: Ledger & ID Badge View */}
            {activeTab === 'ledger' && (
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
            )}

            {/* Tab 2: Field Stories & Blogs View */}
            {activeTab === 'stories' && (
              <div className="space-y-6">
                {/* Header with Info & Actions */}
                <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-amber-300/50 dark:border-amber-800/60">
                          {isOwner ? 'Fundraiser Community Journalism' : 'Verified Field Updates'}
                        </span>
                      </div>
                      <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white">
                        {isOwner ? 'My Field Stories & Ground Updates' : `${dashboardData.volunteer.name}'s Field Stories`}
                      </h2>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-2xl">
                        {isOwner
                          ? 'Document your relief drives and grassroots experiences. All submitted stories are reviewed and approved by administrators before appearing live on the public Black Rose blog.'
                          : `Read published ground stories and impact updates written by ${dashboardData.volunteer.name}.`}
                      </p>
                    </div>

                    {isOwner && (
                      <button
                        type="button"
                        onClick={handleOpenCreateStory}
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Write New Story</span>
                      </button>
                    )}
                  </div>

                  {/* Fundraiser Advantage Banner */}
                  <div className="mt-5 p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-900 dark:text-amber-200">
                      <span className="font-bold">Automated Attribution & Personalized Donation Card:</span> When stories are approved and published, they automatically embed the fundraiser's live Razorpay donation card directly in the article. All reader contributions credit immediately to this fundraiser's ledger.
                    </div>
                  </div>
                </div>

                {/* Review Status Tracker Banner */}
                {isOwner && (myPosts.some(p => p.status === 'pending') || myPosts.some(p => p.status === 'rejected')) && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div className="flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                      <span>
                        <strong>Story Review Status Update:</strong> {myPosts.filter(p => p.status === 'pending').length} story pending admin approval, {myPosts.filter(p => p.status === 'rejected').length} needs revision.
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wider bg-amber-200/60 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-300 dark:border-amber-800">
                      Live Review Tracking
                    </span>
                  </div>
                )}

                {/* Search & Story Count Filter */}
                {myPosts.length > 0 && (
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      Showing {myPosts.length} {myPosts.length === 1 ? 'story' : 'stories'}
                    </div>

                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="text"
                        placeholder="Search your stories..."
                        value={storySearchTerm}
                        onChange={(e) => setStorySearchTerm(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Stories Grid */}
                {loadingPosts ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
                    {[1, 2, 3].map(n => (
                      <div key={n} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 h-64 p-4" />
                    ))}
                  </div>
                ) : myPosts.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-dashed border-gray-300 dark:border-zinc-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-1">
                      You haven't written any stories yet
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6 leading-relaxed">
                      Share your firsthand volunteer experiences, community stories, or disaster relief efforts. Every article you publish raises awareness and invites donations to your campaign.
                    </p>
                    <button
                      type="button"
                      onClick={handleOpenCreateStory}
                      className="inline-flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white px-6 py-2.5 rounded-full text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Write Your First Story</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myPosts
                      .filter(p => {
                        const term = storySearchTerm.toLowerCase();
                        return (p.title || '').toLowerCase().includes(term) ||
                               (p.summary || '').toLowerCase().includes(term);
                      })
                      .map((post) => (
                        <div
                          key={post._id}
                          className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div>
                            {/* Card Image */}
                            <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-zinc-800">
                              {post.coverImage ? (
                                <img
                                  src={post.coverImage}
                                  alt={post.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-400">
                                  <FileText className="w-10 h-10 opacity-40" />
                                </div>
                              )}

                              {/* Status Badge */}
                              <div className="absolute top-3 left-3">
                                {post.status === 'published' ? (
                                  <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                                    <CheckCircle2 className="w-3 h-3" /> Live on Blog
                                  </span>
                                ) : post.status === 'pending' ? (
                                  <span className="inline-flex items-center gap-1 bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                                    <Clock className="w-3 h-3" /> Pending Admin Review
                                  </span>
                                ) : post.status === 'rejected' ? (
                                  <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                                    <AlertCircle className="w-3 h-3" /> Needs Revisions
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 bg-zinc-700 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                                    <FileText className="w-3 h-3" /> Draft
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Card Body */}
                            <div className="p-5">
                              <div className="flex items-center gap-2 text-[10px] text-zinc-400 mb-2">
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                {post.showDonationCard !== false && (
                                  <>
                                    <span>•</span>
                                    <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                                      <Heart className="w-3 h-3 fill-current" /> Donation Card Active
                                    </span>
                                  </>
                                )}
                              </div>

                              <h3 className="text-base font-bold text-zinc-900 dark:text-white line-clamp-2 mb-2">
                                {post.title}
                              </h3>

                              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed mb-4">
                                {post.summary}
                              </p>

                              {Array.isArray(post.tags) && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                  {post.tags.slice(0, 3).map((tag, idx) => (
                                    <span key={idx} className="text-[10px] bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-md font-medium">
                                      #{tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Card Footer Actions */}
                          <div className="px-5 py-3.5 bg-gray-50/70 dark:bg-zinc-900/60 border-t border-gray-100 dark:border-zinc-800/80 flex items-center justify-between gap-2">
                            <a
                              href={`/blog/${post.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </a>

                            {isOwner && (
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStory(post)}
                                  className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                  title="Edit"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteStory(post._id)}
                                  className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-semibold flex items-center cursor-pointer"
                                  title="Delete Story"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </>
        ) : user?.role === 'admin' ? (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">Administrator Ledger Audit</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Enter any volunteer or fundraiser code in the lookup bar above to view their live transparency ledger, or view all fundraisers in the Admin Panel.
            </p>
            <button
              onClick={() => navigate('/admin')}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white px-6 py-2.5 rounded-full text-xs font-bold cursor-pointer shadow-sm"
            >
              Go to Admin Panel
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-10 text-center max-w-lg mx-auto shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400 mb-4">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-1">No Fundraiser Profile Linked</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-6">
              Your logged-in account ({user?.email}) is not registered as an active volunteer or fundraiser.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 text-white px-6 py-2.5 rounded-full text-xs font-semibold cursor-pointer shadow-sm"
            >
              Back to Home
            </button>
          </div>
        )}

      </div>

    </div>
  );
};

export default VolunteerDashboardPage;
