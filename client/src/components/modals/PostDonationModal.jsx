import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/api';
import toast from 'react-hot-toast';

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
      // Assuming we have an endpoint to update donation details
      await axiosInstance.put(`/payment/update-donor/${donationData.donationId}`, {
        donorName: donorName
      });
      setIsSubmitted(true);
      toast.success('Donor name updated!');
    } catch (error) {
      console.error('Update donor error:', error);
      toast.error('Failed to update name. You can still proceed.');
      setIsSubmitted(true); // Allow them to proceed anyway
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all">
        <div className="bg-green-600 p-6 text-center text-white">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold">Donation Successful!</h2>
          <p className="opacity-90 mt-1">Thank you for your generous contribution of ₹{donationData.amount}</p>
        </div>

        <div className="p-6">
          {!isSubmitted && !user ? (
            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Enter Donor Name for Certificate
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isUpdating}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
              >
                {isUpdating ? 'Updating...' : 'Continue'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Your support makes a real difference. You can now download your certificate of appreciation.
              </p>
              
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={() => navigate(`/certificate/${donationData.donationId}`)}
                  className="flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1"
                >
                  <span>📜</span> Download Certificate
                </button>
                
                <button
                  onClick={() => navigate(`/invoice/${donationData.donationId}`)}
                  className="flex items-center justify-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 py-3 rounded-xl font-bold transition-all transform hover:-translate-y-1"
                >
                  <span>🧾</span> Get Invoice
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full text-gray-500 text-sm font-medium hover:text-gray-700 pt-2"
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
