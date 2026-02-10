import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import DOMPurify from 'dompurify';
import Footer from '../components/Footer';

const BlogPostPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

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
  return html
    // remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    // replace non-breaking spaces with normal space
    .replace(/&nbsp;/g, ' ')
    // remove soft hyphens
    .replace(/&shy;/g, '');
};



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Hero Section */}
      <div className="w-full min-h-[40vh] md:min-h-[60vh] relative bg-slate-900 overflow-hidden flex items-center justify-center">
        {/* Blurred Background Layer */}
        <div 
          className="absolute inset-0 scale-110 blur-2xl opacity-60 bg-cover bg-center"
          style={{ backgroundImage: `url(${post.coverImage})` }}
        ></div>

        {/* Overlay to dim background for text readability */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Foreground Image Layer */}
        <img
          src={post.coverImage}
          alt={post.title}
          className="relative z-20 w-full h-full max-h-[75vh] md:max-h-[85vh] object-contain shadow-2xl"
        />

        {/* Text Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end z-30">
          <div className="max-w-4xl w-full mx-auto px-4 pb-8 md:pb-12 text-white drop-shadow-lg">
            <div className="flex flex-wrap gap-2 mb-4">
              {post.tags?.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-red-600 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight drop-shadow-md">
              {post.title}
            </h1>

            <div className="text-sm md:text-base text-gray-100 font-medium">
              By {post.author || 'Admin'} •{' '}
              {new Date(post.createdAt).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
        {/* Summary Block */}
        <div className="bg-gray-50 border-l-4 border-red-600 p-6 md:p-8 mb-12 italic text-gray-700 text-lg rounded-r-lg shadow-sm">
          {post.summary}
        </div>

        {/* Blog Body Content */}
        <div
          className="blog-content text-gray-700 text-base leading-relaxed max-w-none"
          // dangerouslySetInnerHTML={{
          //   __html: DOMPurify.sanitize(post.content, {
          //     FORBID_ATTR: ['style'],
          //   }),
          // }}
          dangerouslySetInnerHTML={{
  __html: cleanContent(
    DOMPurify.sanitize(post.content, {
      FORBID_ATTR: ['style'],
    })
  ),
}}
        />

        {/* Article Footer / Share */}
        <div className="mt-16 pt-8 border-t border-gray-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Share this article</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast.success('Link copied to clipboard!');
              }}
              className="px-4 py-2.5 bg-gray-900 hover:bg-black text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              <span>🔗</span> Copy Link
            </button>
            
            <a 
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Twitter
            </a>
            
            <a 
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
            >
              Facebook
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogPostPage;