import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';
import { Sparkles, FileText, Receipt, ArrowRight } from 'lucide-react';

const PostDonationModal = ({ isOpen, onClose, donationData, user }) => {
  const navigate = useNavigate();
  const [donorName, setDonorName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (donationData) {
      setDonorName(donationData.donorName === 'Anonymous' ? '' : donationData.donorName);
      setIsSubmitted(donationData.donorName !== 'Anonymous');
    }
  }, [donationData]);

  if (!isOpen || !donationData) return null;

  const handleUpdateName = async (e) => {
    e.preventDefault();
    if (!donorName.trim()) {
      toast.error('Please enter a name for the certificate');
      return;
    }

    setIsUpdating(true);
    try {
      await axiosInstance.put(`/payment/update-donor/${donationData.donationId}`, {
        donorName: donorName
      });

      if (!user) {
        try {
          const saved = JSON.parse(localStorage.getItem('anonymousDonations') || '[]');
          const updated = saved.map(d => d.donationId === donationData.donationId ? { ...d, donorName } : d);
          localStorage.setItem('anonymousDonations', JSON.stringify(updated));
        } catch (storageErr) {
          console.error('Failed to update localStorage donation:', storageErr);
        }
      }

      setIsSubmitted(true);
      toast.success('Donor name updated!');
    } catch (error) {
      console.error('Update donor error:', error);
      toast.error('Failed to update name. You can still proceed.');
      setIsSubmitted(true);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100 dark:border-zinc-800 text-left">
        
        {/* Top Header Card */}
        <div className="bg-zinc-900 dark:bg-zinc-950 p-8 text-center text-white relative">
          <div className="w-14 h-14 bg-white/10 dark:bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/10">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 block mb-1">
            Thank You
          </span>
          <h2 className="text-2xl font-extrabold">Donation Successful!</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Thank you for your generous contribution of <span className="text-white font-bold">₹{donationData.amount}</span>
          </p>
        </div>

        <div className="p-6 sm:p-8">
          {!isSubmitted && !user ? (
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                  Enter Donor Name for Certificate
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>{isUpdating ? 'Updating...' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
                Your support makes a real difference. You can now view and download your tax certificate and invoice.
              </p>
              
              <div className="grid grid-cols-1 gap-2.5">
                <button
                  onClick={() => navigate(`/certificate/${donationData.donationId}`)}
                  className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  <span>Download Certificate</span>
                </button>
                
                <button
                  onClick={() => navigate(`/invoice/${donationData.donationId}`)}
                  className="w-full flex items-center justify-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-300 dark:border-zinc-700 py-3 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  <Receipt className="w-4 h-4" />
                  <span>Get Tax Invoice</span>
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs font-medium pt-2 cursor-pointer"
              >
                Maybe Later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostDonationModal;

