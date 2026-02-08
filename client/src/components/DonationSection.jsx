import React, { useState, useEffect } from 'react';
import { handleDonation } from '../utils/apiHandlers';
import PostDonationModal from './modals/PostDonationModal';
import { useNavigate } from 'react-router-dom';

const DonationSection = ({ donationAmount, setDonationAmount, isLoading, setIsLoading, user, setShowLogin }) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [donationData, setDonationData] = useState(null);
  const [recentDonations, setRecentDonations] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      const saved = localStorage.getItem('anonymousDonations');
      if (saved) {
        try {
          setRecentDonations(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent donations');
        }
      }
    } else {
      setRecentDonations([]);
    }
  }, [user, showSuccessModal]);

  const onDonationClick = () => {
    handleDonation(donationAmount, setIsLoading, user, (data) => {
      setDonationData(data);
      setShowSuccessModal(true);
    });
  };

  return (
    <section id="donate" className="py-20 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Support Our Cause
          <div className="w-20 h-1 bg-white mx-auto mt-4"></div>
        </h2>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-3xl">
          <h3 className="text-2xl font-bold text-center mb-8">💳 Bank Details for Donations</h3>

          <div className="space-y-4 mb-8">
            {[
              { label: 'Account Name', value: 'Blackrose Foundation' },
              { label: 'Account Number', value: '251908200515' },
              { label: 'Bank Name', value: 'IndusInd Bank' },
              { label: 'Branch', value: 'Ratan lal Nagar Kanpur' },
              { label: 'IFSC Code', value: 'INDB0002088' },
              // { label: 'SWIFT Code', value: 'SBININBB123' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-white/20">
                <span className="font-semibold">{item.label}:</span>
                <span className="font-mono bg-white/20 px-3 py-1 rounded">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="opacity-80 mb-6">Your contributions help us continue our mission of empowering communities. Every donation makes a difference!</p>

            {!user && (
              <div className="mb-8 space-y-4">
                <div className="bg-yellow-400/20 border border-yellow-400/30 p-4 rounded-xl text-sm">
                  <p className="text-yellow-100">
                    <span className="font-bold">⚠️ Note:</span> Anonymous users will lose access to their certificate and invoice if the page is refreshed. 
                    For a better experience and to access your donation history anytime, please 
                    <button onClick={() => setShowLogin(true)} className="ml-1 underline font-bold hover:text-white transition-colors">Login</button>.
                  </p>
                </div>

                {recentDonations.length > 0 && (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-left">
                    <h4 className="text-sm font-bold mb-3 flex items-center gap-2">
                      <span>🕒</span> Recent Anonymous Donations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {recentDonations.map((don) => (
                        <div key={don.donationId} className="bg-white/10 hover:bg-white/20 p-2 rounded-lg flex items-center gap-3 transition-colors text-xs border border-white/10 group">
                          <div>
                            <span className="font-bold">₹{don.amount}</span>
                            <span className="opacity-60 ml-2">{new Date(don.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => navigate(`/certificate/${don.donationId}`)}
                              className="bg-white/20 hover:bg-white text-purple-600 px-2 py-1 rounded font-bold transition-all"
                              title="Certificate"
                            >
                              📜
                            </button>
                            <button 
                              onClick={() => navigate(`/invoice/${don.donationId}`)}
                              className="bg-white/20 hover:bg-white text-purple-600 px-2 py-1 rounded font-bold transition-all"
                              title="Invoice"
                            >
                              🧾
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {['5', '10', '500', '1000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount)}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    donationAmount === amount
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  ₹{amount}
                </button>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="number"
                placeholder="Custom amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full sm:flex-1 px-4 py-3 rounded-full bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={onDonationClick}
                disabled={isLoading}
                className="w-full sm:w-auto bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Donate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PostDonationModal 
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        donationData={donationData}
        user={user}
      />
    </section>
  );
};

export default DonationSection;