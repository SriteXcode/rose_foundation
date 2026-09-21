import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  FileCheck,
  CheckCircle2,
  Search,
  ExternalLink,
  Eye,
  Copy,
  Check,
  Sparkles,
  Award,
  Lock,
  FileText,
  ChevronRight,
  X,
  LayoutGrid,
  ListFilter,
  Building2,
  Scale,
  Receipt,
  Globe2,
  Download,
  Info
} from 'lucide-react';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import SEO from '../components/SEO';

const documents = [
  {
    id: 'registration',
    title: 'Certificate of Incorporation',
    category: 'Corporate Registration',
    icon: Building2,
    badge: 'MCA Verified',
    description: 'Official Registration Certificate granted by the Ministry of Corporate Affairs, Government of India.',
    images: ['https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770496615/Certificate_of_Incorporation_page-0001_gsfgiy.jpg'],
    details: [
      { label: 'Registration No (CIN)', value: 'U96091UP2025NPL223505', copyable: true },
      { label: 'Date of Incorporation', value: 'January 15, 2025' },
      { label: 'Registered Under', value: 'Section 8 of the Companies Act, 2013' },
      { label: 'Registrar Authority', value: 'Registrar of Companies, Kanpur' },
      { label: 'Entity Type', value: 'Non-Profit Company Limited by Guarantee' }
    ],
    verifyUrl: 'https://www.mca.gov.in/'
  },
  {
    id: 'licence',
    title: 'Section 8 Licence',
    category: 'Non-Profit License',
    icon: Scale,
    badge: 'Govt Licensed',
    description: 'Licence granted under Section 8(1) of the Companies Act, 2013 for social welfare & charitable activities.',
    images: ['https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770496685/licence_page-0001_dnpygi.jpg'],
    details: [
      { label: 'Licence No', value: '163160', copyable: true },
      { label: 'Issued Authority', value: 'Central Government / Registrar of Companies' },
      { label: 'Approved Activity', value: 'Promoting Social Welfare, Education & Healthcare' }
    ],
    verifyUrl: 'https://www.mca.gov.in/'
  },
  {
    id: '80g',
    title: '80G Tax Exemption Certificate',
    category: 'Tax Benefit for Donors',
    icon: Award,
    badge: '50% Tax Exemption',
    description: 'Approval under Section 80G of Income Tax Act 1961 enabling Indian donors to claim 50% tax deductions on contributions.',
    images: [
      'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497359/AANCB5505DF20261_signed_page-0001_ckwhfz.jpg',
      'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497358/AANCB5505DF20261_signed_page-0002_j0nuec.jpg'
    ],
    details: [
      { label: 'Approval Order No', value: 'AANCB5505DF20261', copyable: true },
      { label: 'Form Identifier', value: 'Form No. 10AC' },
      { label: 'Tax Benefit', value: '50% Tax Deduction for Donors' },
      { label: 'Approval Date', value: 'February 20, 2025' },
      { label: 'Status', value: 'Active & Verified' }
    ],
    verifyUrl: 'https://www.incometax.gov.in/'
  },
  {
    id: '12a',
    title: '12A Registration Certificate',
    category: 'Income Tax Exemption',
    icon: Receipt,
    badge: 'Income Tax Exempt',
    description: 'Registration under Section 12A of the Income Tax Act, 1961 granting tax-exempt status to foundation income.',
    images: [
      'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497359/AANCB5505DF20261_signed_page-0001_ckwhfz.jpg',
      'https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770497358/AANCB5505DF20261_signed_page-0002_j0nuec.jpg'
    ],
    details: [
      { label: 'Registration No', value: 'AANCB5505DF20261', copyable: true },
      { label: 'Form Identifier', value: 'Form No. 10AC' },
      { label: 'Date of Approval', value: 'February 20, 2025' },
      { label: 'Validity Period', value: 'Perpetual / Active' }
    ],
    verifyUrl: 'https://www.incometax.gov.in/'
  },
  {
    id: 'pan',
    title: 'PAN Card Registration',
    category: 'Tax Identification',
    icon: FileText,
    badge: 'Tax Compliant',
    description: 'Official Permanent Account Number issued by the Income Tax Department of India.',
    images: ['https://res.cloudinary.com/dtjkpcuy9/image/upload/v1770496873/PAN_page-0001_okaely.jpg'],
    details: [
      { label: 'PAN Number', value: 'AANCB5505D', copyable: true },
      { label: 'Card Holder Name', value: 'Blackrose Foundation' },
      { label: 'Category', value: 'Company / Section 8 Non-Profit' },
      { label: 'Status', value: 'Active & Verified' }
    ],
    verifyUrl: 'https://www.incometax.gov.in/'
  },
  {
    id: 'darpan',
    title: 'NITI Aayog NGO Darpan',
    category: 'Government NGO Portal',
    icon: Globe2,
    badge: 'NITI Aayog Registered',
    description: 'Official enrollment on the Government of India NITI Aayog NGO Darpan portal for public transparency.',
    images: [],
    details: [
      { label: 'Darpan Unique ID', value: 'UP/2025/0631601', copyable: true },
      { label: 'Governing Portal', value: 'NITI Aayog, Govt of India' },
      { label: 'Key Sector', value: 'Social Welfare & Community Development' },
      { label: 'Public Audit Status', value: 'Verified & Listed' }
    ],
    verifyUrl: 'https://ngodarpan.gov.in/'
  }
];

const LegalDocumentsPage = () => {
  const [activeTab, setActiveTab] = useState('registration');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('explorer'); // 'explorer' or 'grid'
  const [copiedValue, setCopiedValue] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2500);
  };

  const filteredDocs = documents.filter((doc) => {
    const q = searchQuery.toLowerCase();
    return (
      doc.title.toLowerCase().includes(q) ||
      doc.category.toLowerCase().includes(q) ||
      doc.description.toLowerCase().includes(q) ||
      doc.details.some((d) => d.value.toLowerCase().includes(q))
    );
  });

  const selectedDoc = documents.find((d) => d.id === activeTab) || documents[0];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 pt-24 pb-20 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <SEO 
        title="Legal Documents & 80G Tax Exemption Certificates" 
        description="Inspect official Section 8 registration, MCA, 12A, and 80G tax deduction compliance certificates for Blackrose Foundation." 
      />
      
      {/* Toast Notification for Copied ID */}
      <AnimatePresence>
        {copiedValue && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 right-6 z-[120] bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-zinc-700 dark:border-zinc-200 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>Copied to Clipboard: <strong>{copiedValue}</strong></span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-black p-8 sm:p-12 text-white border border-zinc-800 shadow-2xl"
        >
          {/* Subtle Ambient Background Gradients */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 -mb-16 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold tracking-wide text-amber-400">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Full Government Compliance & Public Transparency</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
              Legal & <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-rose-400 to-amber-400">Regulatory Certifications</span>
            </h1>

            <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
              Blackrose Foundation operates with total fiscal integrity, regulatory compliance, and tax deduction eligibility for donors under 80G. Inspect our official Ministry of Corporate Affairs, Income Tax Department, and NITI Aayog certifications below.
            </p>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-zinc-800/80 text-left">
              <div>
                <span className="block text-xl font-bold text-white">Section 8</span>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Non-Profit Company</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-emerald-400">50% Tax Off</span>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">80G Donor Relief</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-white">12A Verified</span>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">Tax Exempt Income</span>
              </div>
              <div>
                <span className="block text-xl font-bold text-amber-400">NITI Aayog</span>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">NGO Darpan ID</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Toolbar Bar: Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search CIN, PAN, 80G or document title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 rounded-xl text-xs sm:text-sm border border-gray-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 dark:text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto justify-center">
            <button
              onClick={() => setViewMode('explorer')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'explorer'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Interactive Explorer</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Grid Showcase</span>
            </button>
          </div>
        </div>

        {/* View Mode 1: Interactive Explorer Mode */}
        {viewMode === 'explorer' && (
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar Document List */}
            <div className="lg:col-span-4 space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
                Official Records ({filteredDocs.length})
              </h3>

              <div className="space-y-2.5">
                {filteredDocs.map((doc) => {
                  const Icon = doc.icon;
                  const isActive = activeTab === doc.id;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => setActiveTab(doc.id)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-start gap-3.5 group cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-zinc-900 dark:border-white shadow-lg scale-[1.01]'
                          : 'bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-gray-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 shadow-sm'
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive
                            ? 'bg-white/10 text-amber-400 dark:bg-zinc-900 dark:text-amber-500'
                            : 'bg-gray-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-red-500 dark:group-hover:text-red-400'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <h4 className="font-bold text-xs sm:text-sm truncate">{doc.title}</h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                              isActive
                                ? 'bg-amber-400/20 text-amber-300 dark:bg-amber-500/20 dark:text-amber-700'
                                : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            }`}
                          >
                            {doc.badge}
                          </span>
                        </div>
                        <p className={`text-[11px] truncate ${isActive ? 'text-zinc-300 dark:text-zinc-600' : 'text-zinc-500 dark:text-zinc-400'}`}>
                          {doc.category}
                        </p>
                      </div>

                      <ChevronRight
                        className={`w-4 h-4 shrink-0 self-center transition-transform ${
                          isActive ? 'translate-x-1 text-white dark:text-zinc-900' : 'text-zinc-400 group-hover:translate-x-1'
                        }`}
                      />
                    </button>
                  );
                })}

                {filteredDocs.length === 0 && (
                  <div className="p-8 text-center bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 text-zinc-500 text-xs">
                    No documents matching "{searchQuery}"
                  </div>
                )}
              </div>
            </div>

            {/* Right Main Document Details Card */}
            <div className="lg:col-span-8">
              {selectedDoc && (
                <motion.div
                  key={selectedDoc.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-xl overflow-hidden"
                >
                  {/* Card Banner Header */}
                  <div className="p-6 sm:p-8 bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-rose-500/20 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-bold backdrop-blur-xs flex items-center gap-1.5">
                          <Award className="w-3.5 h-3.5" /> {selectedDoc.badge}
                        </span>

                        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Verified Document
                        </div>
                      </div>

                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{selectedDoc.title}</h2>
                      <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed max-w-2xl">{selectedDoc.description}</p>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-6 sm:p-8 space-y-8">
                    
                    {/* Key Attributes Grid */}
                    <div>
                      <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <FileCheck className="w-4 h-4 text-red-500" /> Key Registration Details
                      </h4>

                      <div className="grid sm:grid-cols-2 gap-3.5">
                        {selectedDoc.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="bg-gray-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-gray-100 dark:border-zinc-800 flex flex-col justify-between group hover:border-gray-300 dark:hover:border-zinc-700 transition-colors"
                          >
                            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">
                              {detail.label}
                            </span>

                            <div className="flex items-center justify-between gap-2">
                              <span className="text-sm font-extrabold text-zinc-900 dark:text-white break-all">
                                {detail.value}
                              </span>

                              {detail.copyable && (
                                <button
                                  onClick={() => handleCopy(detail.value)}
                                  title="Copy to clipboard"
                                  className="p-1.5 rounded-lg bg-gray-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 transition-colors cursor-pointer shrink-0"
                                >
                                  {copiedValue === detail.value ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Preview Images Container */}
                    {selectedDoc.images && selectedDoc.images.length > 0 && (
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          <Eye className="w-4 h-4 text-amber-500" /> Document Preview & Scan
                        </h4>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {selectedDoc.images.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => setLightboxImage({ url: imgUrl, title: `${selectedDoc.title} (Page ${idx + 1})` })}
                              className="group relative rounded-2xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-gray-100 dark:bg-zinc-800 cursor-pointer shadow-sm hover:shadow-md transition-all"
                            >
                              <img
                                src={getOptimizedImageUrl(imgUrl, { width: 600 })}
                                alt={`${selectedDoc.title} Page ${idx + 1}`}
                                className="w-full h-56 object-cover object-top transition-transform duration-500 group-hover:scale-105"
                              />

                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4 justify-between text-white">
                                <span className="text-xs font-bold">Click to Expand Page {idx + 1}</span>
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action & Verification Footer */}
                    <div className="pt-6 border-t border-gray-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        <Lock className="w-4 h-4 text-emerald-500" />
                        <span>Public Record Searchable on Government Portals</span>
                      </div>

                      {selectedDoc.verifyUrl && (
                        <a
                          href={selectedDoc.verifyUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full sm:w-auto px-5 py-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                          <span>Verify Official Portal</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>

                  </div>
                </motion.div>
              )}
            </div>

          </div>
        )}

        {/* View Mode 2: Grid Showcase Mode */}
        {viewMode === 'grid' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => {
              const Icon = doc.icon;
              return (
                <motion.div
                  key={doc.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-6 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-6 group"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center shadow-md">
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {doc.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-zinc-900 dark:text-white group-hover:text-red-500 transition-colors">
                        {doc.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                        {doc.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                      {doc.details.slice(0, 3).map((d, i) => (
                        <div key={i} className="flex justify-between items-center text-xs">
                          <span className="text-zinc-400 dark:text-zinc-500 font-medium">{d.label}:</span>
                          <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 flex items-center gap-2">
                    {doc.images && doc.images.length > 0 && (
                      <button
                        onClick={() => setLightboxImage({ url: doc.images[0], title: doc.title })}
                        className="flex-1 py-2.5 rounded-full bg-gray-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-900 hover:text-white dark:hover:bg-white dark:hover:text-zinc-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Scan
                      </button>
                    )}

                    <a
                      href={doc.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-full border border-gray-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                      title="Verify on Government Portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Verification Guide & FAQ Banner */}
        <div className="bg-gradient-to-r from-red-500/10 via-rose-500/5 to-amber-500/10 p-8 sm:p-10 rounded-3xl border border-red-500/20 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-2 max-w-2xl">
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Info className="w-6 h-6 text-red-500" /> How to Independently Verify Our Status
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
                Transparency is at the core of our operations. You can verify our <strong>Section 8 CIN</strong> on MCA.gov.in, confirm our <strong>80G 50% Tax Exemption status</strong> on IncomeTax.gov.in, or look up our <strong>Darpan Unique ID (UP/2025/0631601)</strong> on NITI Aayog's official registry portal.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 shrink-0">
              <a
                href="https://www.mca.gov.in/mcafast/getCompanyMasterDetails.do"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 border border-gray-200 dark:border-zinc-700"
              >
                <span>MCA Master Data</span>
                <ExternalLink className="w-3 h-3 text-red-500" />
              </a>

              <a
                href="https://ngodarpan.gov.in/index.php/home/statewise"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 border border-gray-200 dark:border-zinc-700"
              >
                <span>NITI Aayog Darpan</span>
                <ExternalLink className="w-3 h-3 text-amber-500" />
              </a>
            </div>
          </div>
        </div>

      </div>

      {/* High-Res Document Lightbox Modal */}
      <AnimatePresence>
        {lightboxImage && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImage(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full max-h-[90vh] bg-zinc-900 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800 z-10 flex flex-col"
            >
              {/* Lightbox Header */}
              <div className="p-4 sm:p-5 bg-zinc-950 border-b border-zinc-800 flex justify-between items-center text-white">
                <span className="text-sm font-bold truncate pr-4">{lightboxImage.title}</span>

                <div className="flex items-center gap-3">
                  <a
                    href={lightboxImage.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                    title="Open Original Image"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  <button
                    onClick={() => setLightboxImage(null)}
                    className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Lightbox Content Image */}
              <div className="p-4 overflow-auto flex-1 flex items-center justify-center bg-black/50">
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LegalDocumentsPage;
