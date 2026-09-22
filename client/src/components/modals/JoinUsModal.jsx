import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/api';
import { X, UserCheck, GraduationCap, ArrowLeft, Camera, Check } from 'lucide-react';

const JoinUsModal = ({ isOpen, onClose }) => {
  const [step, setStep] = useState('selection'); // 'selection' -> 'instructions' -> 'form'
  const [role, setRole] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [agreed, setAgreed] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    aadhar: '',
    email: '',
    phone: '',
    qualification: '',
    bio: '',
    linkedin: '',
    instagram: '',
    image: null
  });

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setStep('instructions');
    setAgreed(false);
  };

  const handleInstructionNext = () => {
    if (agreed) {
      setStep('form');
    } else {
      toast.error("Please agree to the instructions first.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const getWordCount = (text) => {
    if (!text || !text.trim()) return 0;
    return text.trim().split(/\s+/).length;
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    const words = value.trim() ? value.trim().split(/\s+/) : [];
    if (words.length > 20) {
      const truncated = words.slice(0, 20).join(' ');
      setFormData(prev => ({ ...prev, bio: truncated }));
    } else {
      setFormData(prev => ({ ...prev, bio: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.aadhar || !formData.email || !formData.phone || !formData.image) {
      toast.error("Please fill all required fields and upload an image.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('aadhar', formData.aadhar);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('qualification', formData.qualification);
      data.append('bio', formData.bio);
      data.append('linkedin', formData.linkedin);
      data.append('instagram', formData.instagram);
      data.append('role', role);
      data.append('image', formData.image);

      await axiosInstance.post('/volunteers/apply', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Sent successfully! We will contact you soon...");
      if (window.fbq) {
        window.fbq('track', 'Lead', { content_name: 'Volunteer Application', role: role });
      }
      
      setFormData({ name: '', aadhar: '', email: '', phone: '', qualification: '', bio: '', linkedin: '', instagram: '', image: null });
      setPreview(null);
      setStep('selection');
      onClose();

    } catch (error) {
      console.error("Submission failed", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'form') setStep('instructions');
    else if (step === 'instructions') setStep('selection');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden shadow-2xl border border-gray-100 dark:border-zinc-800 text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-4 flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 shrink-0">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">Get Involved</span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-white">Join Our Mission</h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 overflow-y-auto flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Selection */}
            {step === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">
                  Select how you would like to contribute to our initiatives:
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleRoleSelect('Volunteer')}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 hover:border-zinc-900 dark:hover:border-white transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white mb-3 group-hover:scale-110 transition-transform">
                      <UserCheck className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">Volunteer</span>
                  </button>
                  <button 
                    onClick={() => handleRoleSelect('Intern')}
                    className="flex flex-col items-center justify-center p-6 rounded-3xl border border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 hover:border-zinc-900 dark:hover:border-white transition-all group cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-900 dark:text-white mb-3 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <span className="font-bold text-sm text-zinc-900 dark:text-white">Intern</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Instructions */}
            {step === 'instructions' && (
              <motion.div 
                key="instructions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Guidelines for {role}s</h3>
                  <button onClick={handleBack} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>
                
                <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-gray-200/70 dark:border-zinc-800 text-xs text-zinc-600 dark:text-zinc-300 space-y-2.5 max-h-56 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  <p><strong>1. Commitment:</strong> We value dedication. Ensure you can commit the required time for the selected role.</p>
                  <p><strong>2. Conduct:</strong> Maintain professionalism and respect towards all community members and staff.</p>
                  <p><strong>3. Verification:</strong> All provided details (Aadhar, Contact) will be verified.</p>
                  <p><strong>4. Orientation:</strong> Selected candidates must attend a mandatory orientation session.</p>
                  <p><strong>5. Privacy:</strong> Your data is secure with us and used solely for organizational purposes.</p>
                  {role === 'Intern' && (
                    <>
                      <p><strong>6. Certification:</strong> Internship certificates will be issued upon completion.</p>
                      <p><strong>7. Reporting:</strong> Progress reports must be submitted periodically.</p>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="agree" 
                    checked={agreed} 
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-zinc-900 focus:ring-zinc-900 border-gray-300 cursor-pointer"
                  />
                  <label htmlFor="agree" className="text-xs text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                    I agree to abide by the rules and regulations of Blackrose Foundation.
                  </label>
                </div>

                <button
                  onClick={handleInstructionNext}
                  disabled={!agreed}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3 rounded-full font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  Proceed to Application
                </button>
              </motion.div>
            )}

            {/* Step 3: Application Form */}
            {step === 'form' && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Apply as <span className="text-zinc-500 dark:text-zinc-400">{role}</span>
                  </h3>
                  <button onClick={handleBack} className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                      placeholder="Jane Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Phone No.</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Aadhar Number</label>
                      <input 
                        type="text" 
                        name="aadhar"
                        required
                        value={formData.aadhar}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                        placeholder="12-digit number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Qualification / Education</label>
                    <input 
                      type="text" 
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                      placeholder="e.g. B.Tech Computer Science, MSW, College Student"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Short Bio</label>
                      <span className={`text-[10px] font-semibold transition-colors ${getWordCount(formData.bio) >= 20 ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>
                        {getWordCount(formData.bio)} / 20 words
                      </span>
                    </div>
                    <textarea 
                      name="bio"
                      rows="2"
                      value={formData.bio}
                      onChange={handleBioChange}
                      className="w-full px-4 py-2 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                      placeholder="Brief description about your background and passion for volunteering..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">LinkedIn Profile (Optional)</label>
                      <input 
                        type="url" 
                        name="linkedin"
                        value={formData.linkedin}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Instagram Handle (Optional)</label>
                      <input 
                        type="text" 
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                        placeholder="https://instagram.com/username"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Passport Size Photo</label>
                    <div className="flex items-center space-x-3 bg-gray-50 dark:bg-zinc-800/50 p-2.5 rounded-xl border border-gray-200 dark:border-zinc-700">
                      <div className="shrink-0">
                        {preview ? (
                          <img src={preview} alt="Preview" className="h-10 w-10 object-cover rounded-full border border-gray-300" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-500">
                            <Camera className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      <input 
                        type="file" 
                        name="image"
                        accept="image/*"
                        onChange={handleImageChange}
                        required
                        className="block w-full text-xs text-zinc-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-zinc-900 file:text-white hover:file:bg-zinc-800 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {loading ? 'Submitting Application...' : 'Submit Application'}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinUsModal;

