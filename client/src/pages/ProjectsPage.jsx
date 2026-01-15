import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';
import ProjectDetailsModal from '../components/modals/ProjectDetailsModal';

const ProjectsPage = () => {
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await axiosInstance.get('/works');
        setWorks(response.data);
        setFilteredWorks(response.data);
      } catch (error) {
        console.error('Failed to fetch works:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorks();
  }, []);

  useEffect(() => {
    if (activeFilter === 'All') {
      setFilteredWorks(works);
    } else {
      setFilteredWorks(works.filter(work => work.category === activeFilter));
    }
  }, [activeFilter, works]);

  // Extract unique categories
  const categories = ['All', ...new Set(works.map(work => work.category))];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Projects</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the initiatives we have undertaken to transform lives and communities.
          </p>
          <div className="w-24 h-1 bg-purple-600 mx-auto mt-6"></div>
        </div>

        {/* Filter Buttons */}
        {!loading && categories.length > 1 && (
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveFilter(category)}
                className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 ${
                  activeFilter === category
                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:shadow'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-xl text-gray-500">Loading projects...</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredWorks.map((work, index) => (
              <div 
                key={index} 
                onClick={() => setSelectedProject(work)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:-translate-y-2 transition-all duration-300 group"
              >
                <div className="h-56 overflow-hidden relative">
                  {work.images?.[0]?.startsWith('http') || work.icon?.startsWith('http') ? (
                    <img 
                      src={work.images?.[0] || work.icon} 
                      alt={work.title} 
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-100 flex items-center justify-center text-6xl">
                      {work.icon || '🌟'}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">{work.category}</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      work.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {work.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">{work.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">{work.description}</p>
                  <button className="text-purple-600 font-semibold text-sm hover:underline">Read More →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </div>
  );
};

export default ProjectsPage;