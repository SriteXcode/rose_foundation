import React from 'react';
import { handleDonation } from '../utils/apiHandlers';

const DonationSection = ({ donationAmount, setDonationAmount, isLoading, setIsLoading, user }) => {
  const onDonationClick = () => handleDonation(donationAmount, setIsLoading, user);

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
              { label: 'Account Name', value: 'Black Rose Foundation' },
              { label: 'Account Number', value: '1234567890123456' },
              { label: 'Bank Name', value: 'State Bank of India' },
              { label: 'Branch', value: 'Lucknow Main Branch' },
              { label: 'IFSC Code', value: 'SBIN0001234' },
              { label: 'SWIFT Code', value: 'SBININBB123' }
            ].map((item, index) => (
              <div key={index} className="flex justify-between items-center py-3 border-b border-white/20">
                <span className="font-semibold">{item.label}:</span>
                <span className="font-mono bg-white/20 px-3 py-1 rounded">{item.value}</span>
              </div>
            ))}
          </div>

          <div className="text-center">
            <p className="opacity-80 mb-6">Your contributions help us continue our mission of empowering communities. Every donation makes a difference!</p>

            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {['₹500', '₹1000', '₹2500', '₹5000'].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setDonationAmount(amount.slice(1))}
                  className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                    donationAmount === amount.slice(1)
                      ? 'bg-white text-purple-600'
                      : 'bg-white/20 hover:bg-white/30'
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            <div className="flex gap-4 max-w-md mx-auto">
              <input
                type="number"
                placeholder="Custom amount"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="flex-1 px-4 py-3 rounded-full bg-white/20 border border-white/30 placeholder-white/70 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button
                onClick={onDonationClick}
                disabled={isLoading}
                className="bg-white text-purple-600 px-6 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Processing...' : 'Donate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DonationSection;