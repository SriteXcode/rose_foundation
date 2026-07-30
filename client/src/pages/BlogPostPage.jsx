import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import DOMPurify from 'dompurify';
import Footer from '../components/Footer';
import { ArrowLeft, Calendar, User, Share2, Copy, Check } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-xs font-semibold text-zinc-400">Loading article...</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors pt-20 sm:pt-24 pb-16">
      
      {/* Container */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/blog')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Articles</span>
        </button>

        {/* Article Meta Header */}
        <div className="text-left mb-6">
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

        {/* Summary Card */}
        {post.summary && (
          <div className="bg-gray-50 dark:bg-zinc-900 border-l-4 border-zinc-900 dark:border-white p-5 sm:p-6 mb-8 text-zinc-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed rounded-r-xl text-left italic">
            "{post.summary}"
          </div>
        )}

        {/* Article Body */}
        <div
          className="blog-content text-zinc-800 dark:text-zinc-200 text-sm sm:text-base leading-relaxed space-y-4 text-left border-b border-gray-100 dark:border-zinc-800 pb-12"
          dangerouslySetInnerHTML={{
            __html: cleanContent(
              DOMPurify.sanitize(post.content, {
                FORBID_ATTR: ['style'],
              })
            ),
          }}
        />

        {/* Share Section */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-left">
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

      <div className="mt-16">
        <Footer />
      </div>
    </div>
  );
};

export default BlogPostPage;