import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import Footer from '../components/Footer';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowLeft, Search, Calendar, Tag, ArrowRight, BookOpen, Sparkles, Heart, Ban, CheckCircle2, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import SEO from '../components/SEO';

const defaultPosts = [
  {
    _id: 'default-nepal',
    slug: 'bring-nepal-back-to-life',
    title: 'Bring Nepal back to Life',
    summary: 'Stand With Nepal is a humanitarian awareness and relief campaign created to support communities affected by disaster and help them move from immediate relief toward recovery and rebuilding.',
    coverImage: 'https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date('2026-09-22T10:00:00.000Z').toISOString(),
    tags: ['BEINGTOGETHER', 'HUMANITY'],
    volunteerName: 'Harsh Yadav',
    volunteerCode: 'BRF-VOL-HY2026'
  },
  {
    _id: 'default-1',
    slug: 'empowering-youth-kanpur',
    title: 'Empowering Youth Through Education & Vocational Training',
    summary: 'Discover how our skill-building programs are creating sustainable livelihood opportunities for young adults in Kanpur.',
    coverImage: 'https://images.unsplash.com/photo-1531545514256-b1400bc00f31?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date().toISOString(),
    tags: ['Education', 'Community']
  },
  {
    _id: 'default-2',
    slug: 'community-relief-drive-2026',
    title: 'Winter Relief Drive: Reaching 500+ Families in Need',
    summary: 'A detailed recap of our winter relief drive bringing warmth, essential supplies, and healthcare support to vulnerable households.',
    coverImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    tags: ['Relief', 'Outreach']
  }
];

const BlogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAdmin = user?.role === 'admin' || savedUser?.role === 'admin';

  const [posts, setPosts] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/blog?page=${page}&limit=10&search=${searchTerm}`);
      if (response.data.posts && response.data.posts.length > 0) {
        setPosts(response.data.posts);
        setTotalPages(response.data.totalPages || 1);
      } else {
        setPosts(defaultPosts);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Failed to fetch posts', error);
      setPosts(defaultPosts);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axiosInstance.get('/campaigns');
        if (Array.isArray(response.data)) {
          setCampaigns(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch campaigns for blog page:', err);
      }
    };
    fetchCampaigns();
  }, []);

  const handleToggleCampaign = async (campaign, e) => {
    if (e) e.stopPropagation();
    if (!campaign || !campaign._id) return;
    setCampaignLoading(true);
    const isCurrentlyDisabled = campaign.status === 'disabled';
    const newStatus = isCurrentlyDisabled ? 'active' : 'disabled';
    try {
      const res = await axiosInstance.put(`/campaigns/${campaign._id}`, { status: newStatus });
      toast.success(newStatus === 'disabled' ? 'Campaign disabled by admin!' : 'Campaign re-enabled by admin!');
      setCampaigns(prev => prev.map(c => c._id === campaign._id ? res.data : c));
    } catch (err) {
      console.error('Failed to update campaign status:', err);
      toast.error('Failed to update campaign status');
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchPosts();
  };

  const displayPosts = posts.length > 0 ? posts : defaultPosts;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-20 sm:pt-24 pb-16">
      <SEO 
        title="NGO News, Impact Stories & Articles" 
        description="Read the latest articles, community impact stories, field updates, and news from Blackrose Foundation." 
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header with Parallel Search */}
        <div className="mb-8 text-left">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1 block">
                Articles & Stories
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Our Blog
              </h1>
            </div>

            {/* Parallel Search Bar */}
            <form onSubmit={handleSearch} className="relative flex items-center w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-full pl-10 pr-20 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              />
              <button 
                type="submit"
                className="absolute right-1 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
              >
                Search
              </button>
            </form>
          </div>

          {/* Description Text Below Hero Title */}
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-2xl mt-1">
            Stories, ground updates, and insights on community empowerment from the Rose Foundation.
          </p>
        </div>

        {/* Featured Campaign Spotlight Banner (If active or managed campaign exists) */}
        {campaigns.length > 0 && (
          <div className="mb-10 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/30 dark:via-zinc-900 dark:to-zinc-900 p-4 sm:p-5 rounded-2xl border border-amber-200/80 dark:border-amber-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
            <div className="space-y-1 max-w-3xl">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-500 text-zinc-950 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Campaign Drive Spotlight
                </span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  campaigns[0].status === 'disabled'
                    ? 'bg-gray-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300'
                }`}>
                  {campaigns[0].status === 'disabled' ? 'Status: Disabled' : 'Status: Active'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-white">
                {campaigns[0].title}
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {campaigns[0].description}
              </p>
            </div>

            {/* Admin Action Button on Featured Banner */}
            {isAdmin && (
              <button
                type="button"
                disabled={campaignLoading}
                onClick={(e) => handleToggleCampaign(campaigns[0], e)}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer shrink-0 shadow-xs active:scale-95 ${
                  campaigns[0].status === 'disabled'
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
                title={campaigns[0].status === 'disabled' ? 'Re-enable this campaign' : 'Disable this campaign'}
              >
                {campaigns[0].status === 'disabled' ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Enable Campaign (Admin)</span>
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" />
                    <span>Disable Campaign (Admin)</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Posts Grid */}
        {loading ? (
          <div className="py-20 text-center text-sm font-medium text-zinc-400">
            Loading articles...
          </div>
        ) : displayPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {displayPosts.map((post, index) => {
              const cover = post.coverImage?.startsWith('http')
                ? getOptimizedImageUrl(post.coverImage, { width: 600, height: 400 })
                : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800';

              const linkedCampaign = post.campaign || campaigns.find(c => 
                (c.relatedBlogPost?._id && String(c.relatedBlogPost._id) === String(post._id)) || 
                (c.relatedBlogPost && String(c.relatedBlogPost) === String(post._id))
              );

              return (
                <div 
                  key={post._id || index} 
                  onClick={() => navigate(`/blog/${post.slug || post._id}`)}
                  className="bg-white dark:bg-zinc-900 border border-gray-200/70 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group flex flex-col h-full"
                >
                  <div className="aspect-[16/9] max-h-[190px] md:max-h-[180px] lg:max-h-[190px] overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                    <img 
                      src={cover} 
                      alt={post.title} 
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-2.5">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <span>•</span>
                      <span className="bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider">
                        {post.tags?.[0] || 'Community'}
                      </span>
                      {post.volunteerName && (
                        <span className="bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          Fundraiser Story
                        </span>
                      )}
                    </div>
                    
                    <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 mb-4 flex-1 leading-relaxed">
                      {post.summary}
                    </p>

                    {/* Linked Campaign & Admin Control */}
                    {linkedCampaign && (
                      <div className="mb-3 p-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                            {linkedCampaign.title}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase ${
                            linkedCampaign.status === 'disabled'
                              ? 'bg-gray-200 dark:bg-zinc-700 text-zinc-500'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                          }`}>
                            {linkedCampaign.status === 'disabled' ? 'Disabled' : 'Active'}
                          </span>
                        </div>

                        {isAdmin && (
                          <button
                            type="button"
                            disabled={campaignLoading}
                            onClick={(e) => handleToggleCampaign(linkedCampaign, e)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-all cursor-pointer shrink-0 flex items-center gap-1 shadow-xs ${
                              linkedCampaign.status === 'disabled'
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                            title={linkedCampaign.status === 'disabled' ? 'Re-enable campaign' : 'Disable campaign'}
                          >
                            {linkedCampaign.status === 'disabled' ? (
                              <>
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Enable</span>
                              </>
                            ) : (
                              <>
                                <Ban className="w-3 h-3" />
                                <span>Disable</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    )}
                    
                    <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between mt-auto">
                      <span className="text-xs font-semibold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1.5">
                        <span>Read Article</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                      {post.volunteerCode && (
                        <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                          <Heart className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          Support Fundraiser
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-700" />
            <p className="text-base font-semibold">No posts found matching your search.</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-3">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-gray-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 text-xs font-semibold rounded-full border border-gray-300 dark:border-zinc-700 text-zinc-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        )}

      </div>
      
      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default BlogPage;
