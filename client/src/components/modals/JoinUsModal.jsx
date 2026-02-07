import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axiosInstance from '../../utils/api';

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
      toast.error("Please fill all fields and upload an image.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('aadhar', formData.aadhar);
      data.append('email', formData.email);
      data.append('phone', formData.phone);
      data.append('role', role);
      data.append('image', formData.image);

      await axiosInstance.post('/volunteers/apply', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success("Sent successfully! We will contact you soon...");
      
      // Reset
      setFormData({ name: '', aadhar: '', email: '', phone: '', image: null });
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-red-600 to-red-800 p-6 text-white flex justify-between items-center">
          <h2 className="text-2xl font-bold">Join Our Mission</h2>
          <button onClick={onClose} className="text-white/80 hover:text-white text-2xl">×</button>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            
            {/* Step 1: Selection */}
            {step === 'selection' && (
              <motion.div 
                key="selection"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <p className="text-center text-gray-600 text-lg">How would you like to contribute?</p>
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => handleRoleSelect('Volunteer')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-red-500 hover:bg-red-50 transition-all group"
                  >
                    <span className="text-4xl mb-3">🤝</span>
                    <span className="font-bold text-slate-700 group-hover:text-red-600">Volunteer</span>
                  </button>
                  <button 
                    onClick={() => handleRoleSelect('Intern')}
                    className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                  >
                    <span className="text-4xl mb-3">🎓</span>
                    <span className="font-bold text-slate-700 group-hover:text-blue-600">Intern</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* Step 2: Instructions */}
            {step === 'instructions' && (
              <motion.div 
                key="instructions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-800">Guidelines for {role}s</h3>
                  <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-800">Back</button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-sm text-gray-700 space-y-2 h-64 overflow-y-auto">
                  <p><strong>1. Commitment:</strong> We value dedication. Ensure you can commit the required time for the selected role.</p>
                  <p><strong>2. Conduct:</strong> Maintain professionalism and respect towards all community members and staff.</p>
                  <p><strong>3. Verification:</strong> All provided details (Aadhar, Contact) will be verified. False information will lead to immediate rejection.</p>
                  <p><strong>4. Orientation:</strong> Selected candidates must attend a mandatory orientation session.</p>
                  <p><strong>5. Privacy:</strong> Your data is secure with us and used solely for organizational purposes.</p>
                  {role === 'Intern' && (
                    <>
                      <p><strong>6. Certification:</strong> Internship certificates will be issued only upon successful completion of the tenure.</p>
                      <p><strong>7. Reporting:</strong> Regular progress reports must be submitted to your supervisor.</p>
                    </>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input 
                    type="checkbox" 
                    id="agree" 
                    checked={agreed} 
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                  />
                  <label htmlFor="agree" className="text-sm text-gray-600 cursor-pointer select-none">
                    I have read and understood the instructions. I agree to abide by the rules and regulations of the Blackrose Foundation.
                  </label>
                </div>

                <button
                  onClick={handleInstructionNext}
                  disabled={!agreed}
                  className={`w-full py-3 rounded-lg font-bold shadow-md transition-all ${
                    agreed 
                      ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Application
                </button>
              </motion.div>
            )}

            {/* Step 3: Application Form */}
            {step === 'form' && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-slate-800">
                    Apply as <span className="text-red-600">{role}</span>
                  </h3>
                  <button onClick={handleBack} className="text-sm text-gray-500 hover:text-gray-800">
                    ← Back to Guidelines
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                      placeholder="John Doe"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone No.</label>
                      <input 
                        type="tel" 
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="+91 9876543210"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
                      <input 
                        type="text" 
                        name="aadhar"
                        required
                        value={formData.aadhar}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
                        placeholder="12-digit number"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-gray-700 focus:ring-2 focus:ring-red-500 outline-none"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Passport Size Photo 
                      <span className="text-xs font-normal text-gray-500 ml-2">(Max 2MB)</span>
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="shrink-0">
                        {preview ? (
                          <img src={preview} alt="Preview" className="h-16 w-16 object-cover rounded-full border border-gray-300" />
                        ) : (
                          <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                            📷
                          </div>
                        )}
                      </div>
                      <label className="block">
                        <span className="sr-only">Choose profile photo</span>
                        <input 
                          type="file" 
                          name="image"
                          accept="image/*"
                          onChange={handleImageChange}
                          required
                          className="block w-full text-sm text-slate-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-red-50 file:text-red-700
                            hover:file:bg-red-100
                            cursor-pointer"
                        />
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-bold shadow-md hover:shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
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
