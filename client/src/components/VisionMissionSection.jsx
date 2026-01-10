import React from 'react';

const VisionMissionSection = () => (
  <section id="vision" className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
        Our Vision & Mission
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
      </h2>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
            <p className="text-lg leading-relaxed">
              To create a world where every individual has equal opportunities to thrive, regardless of their background or circumstances. We envision communities that are self-sufficient, empowered, and united in their pursuit of progress and well-being.
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
          <div className="text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
            <p className="text-lg leading-relaxed">
              To empower communities through sustainable development programs, education initiatives, healthcare support, and social welfare activities. We are committed to creating lasting positive change through innovative solutions and collaborative partnerships.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default VisionMissionSection;