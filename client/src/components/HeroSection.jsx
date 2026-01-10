import React from 'react';

const HeroSection = ({ scrollToSection }) => (
  <section id="home" className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-red-600 flex items-center justify-center relative overflow-hidden">
    <div className="absolute inset-0 bg-black/30"></div>
    <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent animate-pulse">
        Empowering Communities
      </h1>
      <p className="text-xl md:text-2xl mb-8 opacity-90">
        Together we can create a better tomorrow for everyone
      </p>
      <button
        onClick={() => scrollToSection('about')}
        className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
      >
        Learn More
      </button>
    </div>
    <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
      <button onClick={() => scrollToSection('about')} className="text-white text-3xl">
        ⬇
      </button>
    </div>
  </section>
);

export default HeroSection;