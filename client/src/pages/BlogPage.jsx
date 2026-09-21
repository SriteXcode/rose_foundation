import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import Footer from '../components/Footer';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { ArrowLeft, Search, Calendar, Tag, ArrowRight, BookOpen, Sparkles, Heart } from 'lucide-react';
import SEO from '../components/SEO';

const defaultPosts = [
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
  },
  {
    _id: 'default-3',
    slug: 'digital-literacy-for-children',
    title: 'Bridging the Digital Divide for Underprivileged Students',
    summary: 'How basic computer education and mentorship are opening new doors of learning for primary school children.',
    coverImage: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&q=80&w=800',
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    tags: ['Digital Access', 'Youth']
  }
];

const BlogPage = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
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
