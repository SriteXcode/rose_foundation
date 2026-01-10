import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';

const NewsletterHistoryPage = () => {
  const [newsletters, setNewsletters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/newsletter/history`);
        if (response.ok) {
          const data = await response.json();
          setNewsletters(data);
        }
      } catch (error) {
        console.error('Failed to fetch newsletter history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Newsletter Archive</h1>
          <p className="text-xl text-gray-600">Catch up on our past updates and stories.</p>
          <div className="w-24 h-1 bg-red-500 mx-auto mt-6"></div>
        </div>

        {loading ? (
          <div className="text-center text-gray-500 py-12">Loading archive...</div>
        ) : newsletters.length === 0 ? (
          <div className="text-center text-gray-500 py-12">No past newsletters found.</div>
        ) : (
          <div className="space-y-6">
            {newsletters.map((newsletter) => (
              <div 
                key={newsletter._id} 
                className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                <div 
                  className="p-6 cursor-pointer flex justify-between items-center"
                  onClick={() => toggleExpand(newsletter._id)}
                >
                  <div className="flex-1">
                    <div className="text-sm text-red-600 font-semibold mb-1">
                      {formatDate(newsletter.sentAt)}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{newsletter.subject}</h3>
                  </div>
                  <div className={`transform transition-transform duration-300 ${expandedId === newsletter._id ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
                
                {/* Expandable Content */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ${
                    expandedId === newsletter._id ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="p-6 pt-0 border-t border-gray-100">
                    <div 
                      className="prose prose-red max-w-none text-gray-600 mt-4 whitespace-pre-wrap newsletter-content"
                      dangerouslySetInnerHTML={{ __html: newsletter.content }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterHistoryPage;