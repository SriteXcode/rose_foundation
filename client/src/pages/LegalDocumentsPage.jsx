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
      title: 'Certificate of Incorporation',
      description: 'Official Registration Certificate issued by the Ministry of Corporate Affairs.',
      images: ['https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770496615/Certificate_of_Incorporation_page-0001_gsfgiy.jpg'],
      details: [
        { label: 'Registration No (CIN)', value: 'U96091UP2025NPL223505' },
        { label: 'Date of Incorporation', value: 'January 15, 2025' },
        { label: 'Registered Under', value: 'Section 8 of the Companies Act, 2013' },
        { label: 'Registrar', value: 'Registrar of Companies, Kanpur' }
      ]
    },
    {
      id: 'licence',
      title: 'Section 8 Licence',
      description: 'Licence granted under section 8(1) of the Companies Act, 2013.',
      images: ['https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770496685/licence_page-0001_dnpygi.jpg'],
      details: [
        { label: 'Licence No', value: '163160' },
        { label: 'Issued By', value: 'Central Government / Registrar of Companies' }
      ]
    },
    {
      id: 'pan',
      title: 'PAN Card',
      description: 'Permanent Account Number for financial transparency and taxation purposes.',
      images: ['https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770496873/PAN_page-0001_okaely.jpg'],
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
      images: [
        'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497359/AANCB5505DF20261_signed_page-0001_ckwhfz.jpg',
        'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497358/AANCB5505DF20261_signed_page-0002_j0nuec.jpg'
      ],
      details: [
        { label: 'Registration No', value: 'AANCB5505DF20261' },
        { label: 'Form Type', value: 'Form No. 10AC' },
        { label: 'Date of Approval', value: 'February 20, 2025' },
        { label: 'Validity', value: 'Perpetual' }
      ]
    },
    {
      id: '80g',
      title: '80G Certificate',
      description: 'Certificate under Section 80G of the Income Tax Act, allowing donors to claim tax deductions.',
      images: [
        'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497359/AANCB5505DF20261_signed_page-0001_ckwhfz.jpg',
        'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497358/AANCB5505DF20261_signed_page-0002_j0nuec.jpg'
      ],
      details: [
        { label: 'Approval No', value: 'AANCB5505DF20261' },
        { label: 'Form Type', value: 'Form No. 10AC' },
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
                    <div className="grid gap-6 md:grid-cols-2 mb-8">
                      {doc.details.map((detail, index) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-xl border border-gray-100 hover:border-red-100 transition-colors">
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">{detail.label}</p>
                          <p className="text-lg font-semibold text-slate-800 break-words">{detail.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Document Image Preview */}
                    {doc.images && doc.images.length > 0 && (
                      <div className="space-y-8">
                        {doc.images.map((url, idx) => (
                          <div key={idx} className="border rounded-2xl overflow-hidden bg-gray-50 shadow-inner group">
                            <div className="bg-gray-100 px-4 py-2 border-b flex justify-between items-center">
                              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                                {doc.images.length > 1 ? `Page ${idx + 1}` : 'Document Preview'}
                              </span>
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-xs text-red-600 font-bold hover:underline"
                              >
                                Open Original ↗
                              </a>
                            </div>
                            <div className="p-4 flex justify-center">
                              <img 
                                src={url} 
                                alt={`${doc.title} - Page ${idx + 1}`} 
                                className="max-w-full h-auto rounded-lg shadow-md transition-transform duration-500 group-hover:scale-[1.02]"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-8 mt-8 border-t border-gray-100 flex flex-col sm:flex-row gap-4 justify-between items-center">
                      <div className="flex items-center text-green-600 bg-green-50 px-4 py-2 rounded-full text-sm font-bold">
                        <span className="mr-2">✓</span> Verified Document
                      </div>
                      
                      {doc.images && doc.images.length > 0 ? (
                        <a 
                          href={doc.images[0]} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="bg-slate-800 text-white px-6 py-2 rounded-xl font-bold hover:bg-slate-900 transition-colors flex items-center gap-2"
                        >
                          <span>👁️</span> View Full Document
                        </a>
                      ) : (
                        <button className="text-slate-400 text-sm font-medium cursor-not-allowed" disabled>
                          Preview Unavailable
                        </button>
                      )}
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
