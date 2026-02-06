import React from 'react';
import { Link } from 'react-router-dom';

const AboutSection = () => (
  <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
        About Blackrose Foundation
        <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
      </h2>

      <div className="grid md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Blackrose Foundation is a non-profit organization dedicated to empowering communities and transforming lives. Since our establishment, we have been working tirelessly to address social issues and create sustainable solutions for those in need.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our foundation believes in the power of collective action and community participation. We work across various sectors including education, healthcare, women empowerment, environmental conservation, and rural development to create lasting positive impact.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            With a team of dedicated volunteers and professionals, we strive to bridge the gap between resources and needs, ensuring that help reaches those who need it most.
          </p>
          
          <div className="pt-4">
            <Link 
              to="/legal" 
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 transition-all transform hover:scale-105"
            >
              View Legal Documents →
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-3xl p-8 text-white text-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold mb-2">Community First</h3>
            <p className="text-lg">Empowering communities through sustainable development and social welfare initiatives.</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default AboutSection;
