import React, { useState, useEffect } from 'react';
import axiosInstance from '../utils/api';

const TeamSection = () => {
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await axiosInstance.get('/volunteers');
        setTeamMembers(response.data);
      } catch (error) {
        console.error('Failed to fetch team members', error);
      }
    };
    fetchTeam();
  }, []);

  if (teamMembers.length === 0) return null;

  return (
    <section id="team" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
          Our Dedicated Team
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div key={member._id || index} className="bg-gray-50 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2 text-center group border border-gray-100">
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
        </div>
      </div>
    </section>
  );
};

export default TeamSection;