import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';

const TeamSection = ({ limit = 10 }) => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchTeam = async (pageNum) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/volunteers?page=${pageNum}&limit=${limit}`);
      const { volunteers, totalPages } = response.data;
      
      if (volunteers && volunteers.length > 0) {
        setTeamMembers(prev => pageNum === 1 ? volunteers : [...prev, ...volunteers]);
        setHasMore(pageNum < totalPages);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Failed to fetch team members', error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam(page);
  }, [page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  if (loading && page === 1 && teamMembers.length === 0) {
      // Show initial loading skeleton layout if completely empty
      // Or we can let it render the section and show skeletons inside the grid
  } else if (teamMembers.length === 0 && !loading) {
      return null; 
  }

  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
          Our Dedicated Team
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>

        <div className="flex flex-wrap justify-center gap-8">
          {teamMembers.map((member, index) => (
            <div key={`${member._id || index}-${index}`} className="bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 text-center group border border-gray-100 w-full sm:w-72">
              <div className="p-8 flex flex-col items-center">
                <div className="w-32 h-32 rounded-full overflow-hidden mb-6 border-4 border-red-100 group-hover:border-red-500 transition-colors duration-300 shadow-md">
                    <img 
                        src={member.image} 
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-red-600 transition-colors">{member.name}</h3>
                <p className="text-gray-500 font-medium uppercase tracking-wide text-sm">{member.designation}</p>
              </div>
            </div>
          ))}
          
          {loading && Array.from({ length: page === 1 ? limit : 4 }).map((_, i) => (
             <div key={`skeleton-${i}`} className="bg-gray-50 rounded-xl shadow p-8 flex flex-col items-center animate-pulse border border-gray-100 w-full sm:w-72">
                <div className="w-32 h-32 rounded-full bg-gray-200 mb-6"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
             </div>
          ))}
        </div>

        {hasMore && !loading && (
          <div className="text-center mt-12">
            <button 
              onClick={handleLoadMore}
              className="bg-red-600 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-red-700 transition-all shadow-lg hover:shadow-xl"
            >
              Load More Team Members
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TeamSection;