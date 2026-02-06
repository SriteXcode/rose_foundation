import React, { useState } from 'react';
import { motion } from 'framer-motion';

const LegalDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('registration');

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const documents = [
    {
      id: 'registration',
      title: 'Registration Certificate',
      description: 'Official NGO Registration Certificate under the Societies Registration Act.',
      details: [
        { label: 'Registration No', value: 'U96091UP2025NPL223505' },
        { label: 'Date of Registration', value: 'January 15, 2025' },
        { label: 'Registered Under', value: 'Section 8 of the Companies Act, 2013' },
        { label: 'Registrar', value: 'Registrar of Companies, Uttar Pradesh' }
      ]
    },
    {
      id: 'pan',
      title: 'PAN Card',
      description: 'Permanent Account Number for financial transparency and taxation purposes.',
      details: [
        { label: 'PAN Number', value: 'AANCB5505D' },
        { label: 'Card Holder', value: 'Blackrose Foundation' },
        { label: 'Status', value: 'Active' }
      ]
    },
    {
      id: '12a',
      title: '12A Registration',
      description: 'Registration under Section 12A of the Income Tax Act, 1961 for tax exemption on income.',
      details: [
        { label: 'Registration No', value: 'AANCB5505DF20261' },
        { label: 'Date of Approval', value: 'February 20, 2025' },
        { label: 'Validity', value: 'Perpetual' }
      ]
    },
    {
      id: '80g',
      title: '80G Certificate',
      description: 'Certificate under Section 80G of the Income Tax Act, allowing donors to claim tax deductions.',
      details: [
        { label: 'Approval No', value: 'AANCB5505DF20261' },
        { label: 'Benefit', value: '50% Tax Exemption for Donors' },
        { label: 'Status', value: 'Active' }
      ]
    },
    {
      id: 'darpan',
      title: 'NGO Darpan',
      description: 'Registered with NITI Aayog NGO Darpan portal.',
      details: [
        { label: 'Unique ID', value: 'UP/2025/0631601' },
        { label: 'Sector', value: 'Social Welfare' }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Legal & <span className="text-red-600">Compliance</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            We are committed to full transparency and accountability. Here you can find our official registration documents and compliance details.
          </p>
          <div className="w-24 h-1 bg-red-600 mx-auto mt-6 rounded-full"></div>
        </motion.div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Sidebar Navigation */}
          <motion.div 
            className="lg:col-span-1 space-y-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-28">
              <h3 className="text-xl font-bold text-slate-800 mb-6 px-2">Document List</h3>
              <div className="space-y-2">
                {documents.map((doc) => (
                  <button
                    key={doc.id}
                    onClick={() => setActiveTab(doc.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-300 font-medium flex items-center justify-between group ${
                      activeTab === doc.id 
                        ? 'bg-red-50 text-red-600 shadow-sm border border-red-100' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-slate-900'
                    }`}
                  >
                    <span>{doc.title}</span>
                    <span className={`text-xl transition-transform duration-300 ${
                      activeTab === doc.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'
                    }`}>→</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {documents.map((doc) => (
              activeTab === doc.id && (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
                >
                  <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-red-600 rounded-full opacity-20 blur-2xl"></div>
                    <div className="relative z-10">
                      <h2 className="text-3xl font-bold mb-2">{doc.title}</h2>
                      <p className="text-gray-300">{doc.description}</p>
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="grid gap-6 md:grid-cols-2">
                      {doc.details.map((detail, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-red-100 transition-colors">
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{detail.label}</p>
                          <p className="text-lg font-semibold text-slate-800 break-words">{detail.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 pt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold">
                        <span className="mr-2">✓</span> Verified Document
                      </div>
                      
                      {/* Placeholder for actual document download/view if available in future */}
                      <button className="text-slate-400 text-sm font-medium cursor-not-allowed" disabled>
                        Preview Unavailable
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            ))}
          </div>

        </div>
      </div>
    </div>
  );
};

export default LegalDocumentsPage;
