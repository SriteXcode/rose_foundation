import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { Sparkles, Target, ArrowRight, BookOpen, Filter, Search, Heart } from 'lucide-react';
import Footer from '../components/Footer';

const defaultCampaignsList = [
  {
    _id: 'camp-1',
    title: 'Emergency Relief & Empowerment Drive',
    subtitle: 'Urgent Campaign',
    description: 'Providing emergency winter blankets, food ration kits, and medical care for underprivileged families across rural communities.',
    imageUrl: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    targetAmount: 150000,
    currentAmount: 85000,
    status: 'active',
    buttonText: 'Donate Now'
  },
  {
    _id: 'camp-2',
    title: 'Clean Water Filtration Station setup in Rural Schools',
    subtitle: 'Health & Hygiene',
    description: 'Setting up high-capacity clean drinking water filtration units to prevent water-borne illnesses among school children.',
    imageUrl: 'https://images.unsplash.com/photo-1542810634-71277d95dcbb?auto=format&fit=crop&q=80&w=800',
    targetAmount: 80000,
    currentAmount: 80000,
    status: 'completed',
    buttonText: 'Goal Achieved'
  }
];

const CampaignsPage = ({ scrollToSection }) => {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/campaigns');
        if (Array.isArray(response.data) && response.data.length > 0) {
          setCampaigns(response.data);
          setFilteredCampaigns(response.data);
        } else {
          setCampaigns(defaultCampaignsList);
          setFilteredCampaigns(defaultCampaignsList);
        }
      } catch (error) {
        console.error('Failed to fetch campaigns', error);
        setCampaigns(defaultCampaignsList);
        setFilteredCampaigns(defaultCampaignsList);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  useEffect(() => {
    let result = campaigns;
    if (activeFilter !== 'All') {
      result = result.filter(c => c.status === activeFilter.toLowerCase());
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(c => 
        (c.title && c.title.toLowerCase().includes(q)) ||
        (c.description && c.description.toLowerCase().includes(q)) ||
        (c.subtitle && c.subtitle.toLowerCase().includes(q))
      );
    }
    setFilteredCampaigns(result);
  }, [activeFilter, searchTerm, campaigns]);

  const displayCampaigns = filteredCampaigns.length > 0 ? filteredCampaigns : (campaigns.length > 0 ? campaigns : defaultCampaignsList);

  const handleDonateToCampaign = (campaign) => {
    if (scrollToSection) {
      scrollToSection('donate');
    } else {
      navigate('/#donate');
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Parallel Search & Dropdown Filter */}
        <div className="mb-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
                Grassroots Drives
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Our Campaigns
              </h1>
            </div>

            {/* Parallel Search Bar & Filter Dropdown */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search campaigns..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-full pl-10 pr-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                />
              </div>

              <div className="relative">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="bg-gray-50 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-full px-4 py-2.5 text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white cursor-pointer appearance-none pr-8"
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active Campaigns</option>
                  <option value="Completed">Completed Drives</option>
                </select>
                <Filter className="w-3.5 h-3.5 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Description Text Below Hero Title */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
            Discover our active fundraising initiatives, emergency relief drives, and community empowerment campaigns bringing real transformation across communities.
          </p>
        </div>

        {/* Campaigns Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium text-zinc-400">
            Loading campaigns...
          </div>
        ) : displayCampaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {displayCampaigns.map((camp, index) => {
              const target = camp.targetAmount || 100000;
              const current = camp.currentAmount || 0;
              const percentage = Math.min(100, Math.round((current / target) * 100));
              const coverImg = getOptimizedImageUrl(camp.imageUrl || defaultCampaignsList[index % defaultCampaignsList.length].imageUrl, { width: 600, height: 400 });
              const isCompleted = camp.status === 'completed' || percentage >= 100;

              return (
                <div 
                  key={camp._id || index}
                  className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Banner Image - 9:16 for phone, square for md, 16:9 for lg */}
                    <div className="aspect-[9/16] sm:aspect-square lg:aspect-[16/9] max-h-[260px] sm:max-h-[280px] lg:max-h-[240px] overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                      <img 
                        src={coverImg} 
                        alt={camp.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-1 shadow-sm">
                        <Sparkles className="w-3 h-3 text-amber-500" />
                        <span>{camp.subtitle || 'Initiative'}</span>
                      </div>
                      <div className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md ${isCompleted ? 'bg-emerald-600/90' : 'bg-zinc-900/90'}`}>
                        {isCompleted ? 'Completed' : 'Active'}
                      </div>
                    </div>

                    <div className="p-5 space-y-3">
                      <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white line-clamp-2">
                        {camp.title}
                      </h3>

                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                        {camp.description}
                      </p>

                      {/* Goal Progress Bar */}
                      <div className="bg-gray-50 dark:bg-zinc-800/60 p-3 rounded-xl border border-gray-100 dark:border-zinc-800 space-y-1.5">
                        <div className="flex justify-between items-center text-[11px] font-semibold">
                          <span className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <Target className="w-3 h-3 text-emerald-500" /> Raised
                          </span>
                          <span className="text-zinc-900 dark:text-white font-bold">{percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-zinc-700 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percentage}%` }} />
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-bold text-zinc-900 dark:text-white">₹{current.toLocaleString()}</span>
                          <span className="text-zinc-500">Target: ₹{target.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* Linked Blog Story Box (If related blog post exists) */}
                      {camp.relatedBlogPost && (
                        <div className="bg-blue-50/60 dark:bg-blue-950/30 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                            <span className="text-xs font-medium text-blue-950 dark:text-blue-200 truncate">
                              {camp.relatedBlogPost.title}
                            </span>
                          </div>
                          <Link
                            to={`/blog/${camp.relatedBlogPost.slug || camp.relatedBlogPost._id}`}
                            className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0 flex items-center gap-0.5"
                          >
                            <span>Read</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Action Footer */}
                  <div className="p-5 pt-0">
                    <button
                      onClick={() => handleDonateToCampaign(camp)}
                      disabled={isCompleted}
                      className={`w-full py-2.5 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
                        isCompleted
                          ? 'bg-gray-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed'
                          : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white'
                      }`}
                    >
                      <Heart className="w-3.5 h-3.5" />
                      <span>{isCompleted ? 'Goal Achieved' : (camp.buttonText || 'Donate Now')}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-20 text-center text-sm font-medium text-zinc-400">
            No campaigns found matching filter.
          </div>
        )}

      </div>
      <Footer scrollToSection={scrollToSection} />
    </div>
  );
};

export default CampaignsPage;
