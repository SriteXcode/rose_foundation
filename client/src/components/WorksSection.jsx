import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import ProjectDetailsModal from './modals/ProjectDetailsModal';

const WorksSection = ({ limit }) => {
  const navigate = useNavigate();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await axiosInstance.get('/works');
        const data = response.data;
        // If no data from API, fall back to initial static data for demonstration if needed, 
        // or just show empty. For now, we'll assume if API works we use it.
        if (data.length > 0) {
          setWorks(data);
        } else {
          // Fallback content if DB is empty
            setWorks([
            { icon: '📚', title: 'Education Programs', description: 'Quality education, scholarships, and learning resources for underprivileged children.' },
            { icon: '🏥', title: 'Healthcare Initiatives', description: 'Mobile health camps, free medical checkups, and health awareness programs.' },
            { icon: '👩‍💼', title: 'Women Empowerment', description: 'Skills training, microfinance support, and leadership development programs.' },
            { icon: '🌱', title: 'Environmental Conservation', description: 'Tree plantation drives, waste management, and environmental awareness campaigns.' },
            { icon: '🏘️', title: 'Community Development', description: 'Infrastructure development, clean water projects, and sustainable livelihood programs.' },
            { icon: '🍽️', title: 'Food Security', description: 'Mid-day meals, nutrition supplements, and emergency food distribution during crises.' }
          ]);
        }
      } catch (error) {
        console.error('Failed to fetch works:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  const displayedWorks = limit ? works.slice(0, limit) : works;

  return (
    <section id="works" className="py-20 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Our Works
          <div className="w-20 h-1 bg-white mx-auto mt-4"></div>
        </h2>

        {loading ? (
          <div className="text-center text-xl">Loading projects...</div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedWorks.map((work, index) => (
                <div 
                  key={index} 
                  onClick={() => setSelectedProject(work)}
                  className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl transform hover:scale-105 transition-all duration-300 hover:bg-white/20 overflow-hidden flex flex-col cursor-pointer"
                >
                  <div className="h-40 mb-4 flex items-center justify-center overflow-hidden rounded-xl bg-white/5">
                    {work.images?.[0]?.startsWith('http') || work.icon?.startsWith('http') ? (
                      <img 
                        src={work.images?.[0] || work.icon} 
                        alt={work.title} 
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-5xl">{work.icon || '🌟'}</div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-3 text-center">{work.title}</h3>
                  <p className="text-center opacity-90 text-sm line-clamp-3">{work.description}</p>
                </div>
              ))}
            </div>

            {limit && works.length > limit && (
              <div className="text-center mt-12">
                <button 
                  onClick={() => navigate('/projects')}
                  className="bg-white text-purple-600 px-8 py-3 rounded-full font-bold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl"
                >
                  View All Projects
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ProjectDetailsModal 
        project={selectedProject} 
        onClose={() => setSelectedProject(null)} 
      />
    </section>
  );
};

export default WorksSection;