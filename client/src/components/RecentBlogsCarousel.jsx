import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar, 
  ArrowRight, 
  Heart, 
  Sparkles, 
  BookOpen 
} from 'lucide-react';
import axiosInstance from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageUtils';

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

const RecentBlogsCarousel = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCards, setVisibleCards] = useState(3);
  const [isPaused, setIsPaused] = useState(false);

  // Touch swipe support state
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Responsive cards calculation
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setVisibleCards(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCards(2);
      } else {
        setVisibleCards(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch recent posts from backend
  useEffect(() => {
    const fetchRecentPosts = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/blog?limit=6');
        if (response.data.posts && response.data.posts.length > 0) {
          setPosts(response.data.posts);
        } else {
          setPosts(defaultPosts);
        }
      } catch (error) {
        console.error('Failed to fetch recent blog posts for carousel:', error);
        setPosts(defaultPosts);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentPosts();
  }, []);

  const displayPosts = posts.length > 0 ? posts : defaultPosts;
  const maxIndex = Math.max(0, displayPosts.length - visibleCards);

  // Keep currentIndex within bounds if maxIndex changes
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex);
    }
  }, [maxIndex, currentIndex]);

  const handleNext = useCallback(() => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  }, [maxIndex]);

  const handlePrev = useCallback(() => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  }, [maxIndex]);

  // Auto-play interval
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;

    const interval = setInterval(() => {
      handleNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaused, maxIndex, handleNext]);

  // Touch Swipe Handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  const handleCardClick = (post) => {
    navigate(`/blog/${post.slug || post._id}`);
  };

  const handleDonateClick = (e, post) => {
    e.stopPropagation();
    navigate(`/blog/${post.slug || post._id}#donate`, {
      state: { scrollToDonation: true }
    });
  };

  return (
    <section 
      className="py-12 md:py-16 bg-gradient-to-b from-gray-50/70 via-white to-white dark:from-zinc-900/40 dark:via-zinc-950 dark:to-zinc-950 border-t border-gray-100 dark:border-zinc-800/80 overflow-hidden transition-colors"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-left">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-200/80 dark:border-amber-800/60 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" />
                Impact Stories & Updates
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Recent Blog Posts
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed max-w-2xl">
              Discover stories of hope, community outreach, and grassroots impact from our volunteers and field teams.
            </p>
          </div>

          {/* Carousel Controls & View All Button */}
          <div className="flex items-center gap-3 self-start md:self-end">
            <button
              onClick={() => navigate('/blog')}
              className="text-xs font-bold text-zinc-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 inline-flex items-center gap-1 transition-colors cursor-pointer mr-2"
            >
              <span>View All Articles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Previous Blog"
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next Blog"
                className="w-9 h-9 rounded-full bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-all cursor-pointer shadow-xs hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Slider */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-gray-100 dark:bg-zinc-900 rounded-2xl h-80 animate-pulse border border-gray-200 dark:border-zinc-800" />
            ))}
          </div>
        ) : (
          <div 
            className="relative overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="flex transition-transform duration-500 ease-out gap-6"
              style={{
                transform: `translateX(-${currentIndex * (100 / visibleCards)}%)`
              }}
            >
              {displayPosts.map((post, index) => {
                const cover = post.coverImage?.startsWith('http')
                  ? getOptimizedImageUrl(post.coverImage, { width: 600, height: 400 })
                  : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=800';

                return (
                  <div
                    key={post._id || index}
                    style={{
                      flex: `0 0 calc(${100 / visibleCards}% - ${(6 * (visibleCards - 1)) / visibleCards}px)`
                    }}
                    onClick={() => handleCardClick(post)}
                    className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 cursor-pointer group flex flex-col h-full hover:-translate-y-1"
                  >
                    {/* Image Box */}
                    <div className="aspect-[16/9] max-h-[190px] overflow-hidden bg-gray-100 dark:bg-zinc-800 relative">
                      <img 
                        src={cover} 
                        alt={post.title} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className="bg-zinc-900/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
                          {post.tags?.[0] || 'Story'}
                        </span>
                        {post.volunteerName && (
                          <span className="bg-amber-500 text-zinc-950 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Fundraiser
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-5 flex flex-col flex-1 text-left">
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-2 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-amber-500" />
                        <span>{new Date(post.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>

                      <h3 className="text-base font-bold text-zinc-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-4 flex-1 leading-relaxed">
                        {post.summary}
                      </p>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between gap-2 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCardClick(post);
                          }}
                          className="text-xs font-extrabold text-zinc-900 dark:text-white group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 cursor-pointer"
                        >
                          <span>Read Story</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => handleDonateClick(e, post)}
                          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all shadow-xs hover:shadow-md flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                          title="Donate directly to this cause"
                        >
                          <Heart className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
                          <span>Donate</span>
                        </button>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Carousel Pagination Dots */}
        {maxIndex > 0 && (
          <div className="flex justify-center items-center gap-1.5 mt-6">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx 
                    ? 'w-6 bg-amber-500' 
                    : 'w-2 bg-gray-300 dark:bg-zinc-700 hover:bg-gray-400 dark:hover:bg-zinc-600'
                }`}
              />
            ))}
          </div>
        )}

      </div>
    </section>
  );
};

export default RecentBlogsCarousel;
