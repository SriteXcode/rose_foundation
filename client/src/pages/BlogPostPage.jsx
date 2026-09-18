import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import DOMPurify from 'dompurify';
import Footer from '../components/Footer';
import VolunteerDonationCard from '../components/VolunteerDonationCard';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Share2, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  ExternalLink,
  Clock,
  Heart
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" fill="%23e4e4e7"/><path fill="%23a1a1aa" d="M64 28a22 22 0 1 0 0 44 22 22 0 0 0 0-44zM32 98c0-17.7 14.3-30 32-30s32 12.3 32 30v6H32v-6z"/></svg>`;

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axiosInstance.get(`/blog/${slug}`);
        setPost(response.data);
      } catch (error) {
        console.error('Failed to fetch post', error);
        toast.error('Article not found or pending admin approval.');
        navigate('/blog');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug, navigate]);

  const cleanContent = (html) => {
    if (!html) return '';
    return html
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&shy;/g, '');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Article link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-xs font-semibold text-zinc-400 animate-pulse">Loading article...</div>
      </div>
    );
  }

  if (!post) return null;

  // Resolve linked volunteer (populated or fallback to post metadata)
  const volunteer = post.volunteerId || (post.volunteerCode ? {
    _id: post.volunteerId?._id,
    name: post.volunteerName || post.author,
    image: post.volunteerImage || '',
    volunteerCode: post.volunteerCode,
    fundraiserCode: post.volunteerCode,
    designation: post.volunteerId?.designation || 'Official Fundraiser Lead',
    role: post.volunteerId?.role || 'Volunteer',
    upiId: post.volunteerUpiId || post.volunteerId?.upiId,
    directPaymentQrImage: post.volunteerId?.directPaymentQrImage
  } : null);

  const hasDonationCard = post.showDonationCard !== false && volunteer;

  // Smoothly scroll to the personalized donation card
  const scrollToDonationCard = () => {
    const isDesktop = window.innerWidth >= 1280;
    const targetId = isDesktop ? 'personalized-donation-card-desktop' : 'personalized-donation-card-mobile';
    const cardEl = document.getElementById(targetId) || document.getElementById('personalized-donation-card-mobile') || document.getElementById('personalized-donation-card-desktop');

    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      cardEl.classList.add('ring-4', 'ring-amber-400', 'rounded-3xl', 'transition-all');
      setTimeout(() => {
        cardEl.classList.remove('ring-4', 'ring-amber-400');
      }, 1800);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-20 sm:pt-24 pb-16">
      
      {/* Pending / Preview Mode Alert Banner */}
      {post.isPreview && (
        <div className="bg-amber-500 text-zinc-950 px-4 py-2.5 text-xs font-bold text-center flex items-center justify-center gap-2 mb-6">
          <Clock className="w-4 h-4" />
          <span>Preview Mode: This article is currently pending admin approval and is not yet publicly listed.</span>
        </div>
      )}

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Control Bar with Back & Donate Button */}
        <div className="flex items-center justify-between mb-6 gap-3 flex-wrap sm:flex-nowrap">
          <button 
            onClick={() => navigate('/blog')}
            className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Articles</span>
          </button>

          <div className="flex items-center gap-2.5">
            {volunteer?.volunteerCode && (
              <button
                onClick={() => navigate(`/v/${volunteer.volunteerCode}`)}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
              >
                <span>Support via {volunteer.name} Directly</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}

            {hasDonationCard && (
              <button
                type="button"
                onClick={scrollToDonationCard}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 px-4 py-2 rounded-full text-xs font-extrabold transition-all shadow-sm hover:shadow-md cursor-pointer hover:scale-102 active:scale-98"
                title="Scroll down to personalized donation card"
              >
                <Heart className="w-3.5 h-3.5 fill-zinc-950 text-zinc-950" />
                <span>Donate to Cause</span>
              </button>
            )}
          </div>
        </div>

        {/* Layout: Fluid article content + Fixed width sticky sidebar on large screens (>= 1280px) */}
        <div className={hasDonationCard ? "xl:flex xl:items-start xl:gap-10 2xl:gap-12" : "max-w-4xl mx-auto"}>
          
          {/* Article Main Body (Fluid width varying by screen size) */}
          <div className={hasDonationCard ? "flex-1 min-w-0 text-left" : "text-left"}>
            
            {/* Article Meta Header */}
            <div className="mb-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {post.author || 'Rose Foundation'}
                </span>
                {post.tags?.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-gray-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ml-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-white leading-tight tracking-tight">
                {post.title}
              </h1>
            </div>

            {/* Fundraiser Author Pill (If written by / attributed to volunteer) */}
            {volunteer && (
              <div className="flex items-center justify-between gap-4 bg-amber-50/70 dark:bg-zinc-900 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl p-4 mb-6 shadow-xs">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={volunteer.image || DEFAULT_AVATAR}
                      alt={volunteer.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-xs"
                    />
                    <span className="absolute -bottom-0.5 -right-0.5 bg-amber-500 text-zinc-950 p-0.5 rounded-full shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-white truncate">
                        {volunteer.name}
                      </h4>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                        Official Fundraiser
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                      {volunteer.designation || 'Campaign Field Lead'}
                    </p>
                  </div>
                </div>

                {hasDonationCard && (
                  <button
                    type="button"
                    onClick={scrollToDonationCard}
                    className="bg-amber-500 hover:bg-amber-600 text-zinc-950 px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer shadow-xs inline-flex items-center gap-1.5 hover:scale-102 active:scale-98"
                  >
                    <Heart className="w-3.5 h-3.5 fill-zinc-950" />
                    <span>Make a Donation</span>
                  </button>
                )}
              </div>
            )}

            {/* Hero Cover Image */}
            {post.coverImage && (
              <div className="w-full aspect-[16/9] bg-gray-100 dark:bg-zinc-900 rounded-2xl overflow-hidden mb-8 border border-gray-200/70 dark:border-zinc-800 shadow-sm">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Summary Excerpt */}
            {post.summary && (
              <div className="bg-gray-50 dark:bg-zinc-900 border-l-4 border-amber-500 dark:border-amber-400 p-5 sm:p-6 mb-8 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed rounded-r-xl italic">
                "{post.summary}"
              </div>
            )}

            {/* Article Content Body */}
            <div
              className="blog-content text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-4 border-b border-gray-100 dark:border-zinc-800 pb-10 clearfix"
              dangerouslySetInnerHTML={{
                __html: cleanContent(
                  DOMPurify.sanitize(post.content, {
                    ADD_TAGS: ['figure', 'figcaption', 'img', 'div', 'h3', 'h4', 'p', 'span'],
                    ADD_ATTR: ['class', 'src', 'alt', 'target', 'href', 'style', 'width', 'height', 'data-width', 'data-placement'],
                  })
                ),
              }}
            />

            {/* Mobile & Medium Device Inline Donation Card (< 1280px) */}
            {hasDonationCard && (
              <div id="personalized-donation-card-mobile" className="block xl:hidden my-10 max-w-lg mx-auto w-full scroll-mt-28">
                <VolunteerDonationCard volunteer={volunteer} compact={true} />
              </div>
            )}

            {/* Fundraiser Author Bio Box (At bottom of article) */}
            {volunteer && (
              <div className="mt-8 bg-gray-50 dark:bg-zinc-900/60 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <img
                    src={volunteer.image || DEFAULT_AVATAR}
                    alt={volunteer.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-xs shrink-0"
                  />
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block mb-1">
                      About the Fundraiser Author
                    </span>
                    <h3 className="text-base font-extrabold text-zinc-900 dark:text-white">
                      {volunteer.name}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      {volunteer.bio || `${volunteer.name} is an active social welfare advocate and official volunteer fundraiser with Black Rose Foundation, dedicated to grassroots community empowerment.`}
                    </p>
                    <div className="mt-3 flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/v/${volunteer.volunteerCode}`)}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer inline-flex items-center gap-1"
                      >
                        <span>View Official Donation Page</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Share Section */}
            <div className="mt-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Share this article
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-2 bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-200/80 dark:border-zinc-800 px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>
                <a 
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-gray-100 dark:bg-zinc-900 hover:bg-gray-200 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-200/80 dark:border-zinc-800 px-4 py-2 rounded-full text-xs font-semibold transition-all"
                >
                  Twitter / X
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Desktop Sticky Donation Card with Fixed Width (>= 1280px) */}
          {hasDonationCard && (
            <div id="personalized-donation-card-desktop" className="hidden xl:block w-[380px] 2xl:w-[400px] shrink-0 sticky top-24 scroll-mt-28">
              <VolunteerDonationCard volunteer={volunteer} compact={true} />
            </div>
          )}

        </div>

      </div>

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default BlogPostPage;