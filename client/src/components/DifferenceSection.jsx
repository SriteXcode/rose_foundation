import React from 'react';

const DifferenceSection = () => {
  const differences = [
    { icon: '🎯', title: 'Targeted Approach', desc: 'We focus on specific communities and their unique needs rather than generic solutions.' },
    { icon: '🔍', title: 'Transparency', desc: 'Complete transparency in our operations and fund utilization with regular impact reports.' },
    { icon: '🤝', title: 'Community Participation', desc: 'We involve local communities in planning and execution to ensure sustainability.' },
    { icon: '📊', title: 'Data-Driven Impact', desc: 'We measure and track the impact of our programs using scientific methods and metrics.' },
    { icon: '🔄', title: 'Sustainable Solutions', desc: 'Focus on long-term sustainable solutions rather than temporary relief measures.' },
    { icon: '💡', title: 'Innovation', desc: 'We use innovative approaches and technology to maximize our impact and reach.' }
  ];

  return (
    <section id="difference" className="py-20 bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          What Makes Us Different
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {differences.map((diff, index) => (
            <div key={index} className="bg-white/10 p-6 rounded-2xl text-center transform hover:scale-105 hover:bg-red-500/20 transition-all duration-300">
              <div className="text-4xl mb-4">{diff.icon}</div>
              <h3 className="text-xl font-bold mb-3">{diff.title}</h3>
              <p className="opacity-90">{diff.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DifferenceSection;