import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';
import { User, LogOut, FileText, Receipt, Heart, ShieldCheck, Phone, Mail } from 'lucide-react';

const ProfilePage = ({ user, setUser, authLoading, handleLogout }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      navigate('/');
      return;
    }
    setProfileForm({ name: user.name, phone: user.phone || '' });
    fetchDonations();
  }, [user, navigate, authLoading]);

  const fetchDonations = async () => {
    try {
      const response = await axiosInstance.get('/user/donations');
      setDonations(response.data);
    } catch (error) {
      console.error('Failed to fetch donations', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axiosInstance.put('/user/profile', profileForm);
      const data = response.data;
      
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
      toast.success('Profile updated successfully');
    } catch (error) {
      const msg = error.response?.data?.error || 'Failed to update profile';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex items-center justify-center">
        <div className="animate-pulse text-sm font-semibold text-zinc-400">Verifying access...</div>
      </div>
    );
  }

  if (!user) return null;

  const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'U';

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 pt-20 sm:pt-24 pb-16 transition-colors text-left">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Account Header Container */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-extrabold text-xl flex items-center justify-center shadow-md shrink-0">
                {initials}
              </div>
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-0.5">
                  My Account
                </span>
                <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white">
                  {user.name}
                </h1>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="inline-flex items-center gap-2 bg-transparent hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white border border-gray-300 dark:border-zinc-700 px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

          </div>
        </div>

        {/* Main Content Box */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
          
          {/* Tab Bar */}
          <div className="flex border-b border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'profile' 
                  ? 'text-zinc-900 dark:text-white border-zinc-900 dark:border-white bg-white dark:bg-zinc-900' 
                  : 'text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`flex-1 py-4 text-xs font-bold transition-colors cursor-pointer border-b-2 ${
                activeTab === 'donations' 
                  ? 'text-zinc-900 dark:text-white border-zinc-900 dark:border-white bg-white dark:bg-zinc-900' 
                  : 'text-zinc-400 border-transparent hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              Donation History
            </button>
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === 'profile' ? (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-zinc-800/50 border border-gray-200/50 dark:border-zinc-700/50 text-xs font-medium text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                    />
                    <p className="text-[11px] text-zinc-400 mt-1">Primary account email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm cursor-pointer disabled:opacity-50 mt-4"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {donations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-zinc-800 text-zinc-400 font-semibold">
                          <th className="pb-3 px-3">Date</th>
                          <th className="pb-3 px-3">Amount</th>
                          <th className="pb-3 px-3">Transaction ID</th>
                          <th className="pb-3 px-3">Status</th>
                          <th className="pb-3 px-3 text-right">Documents</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                        {donations.map((donation) => (
                          <tr key={donation._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="py-4 px-3 text-zinc-900 dark:text-white font-medium">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-4 px-3 font-extrabold text-zinc-900 dark:text-white">
                              ₹{donation.amount.toLocaleString()}
                            </td>
                            <td className="py-4 px-3 text-zinc-500 font-mono text-[11px]">
                              {donation.transactionId || '-'}
                            </td>
                            <td className="py-4 px-3">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                donation.status === 'completed' 
                                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50' 
                                  : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                              }`}>
                                {donation.status}
                              </span>
                            </td>
                            <td className="py-4 px-3 text-right">
                              {donation.status === 'completed' && (
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => navigate(`/certificate/${donation._id}`)}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Certificate"
                                  >
                                    <FileText className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Certificate</span>
                                  </button>
                                  <button
                                    onClick={() => navigate(`/invoice/${donation._id}`)}
                                    className="p-1.5 rounded-lg border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                                    title="Invoice"
                                  >
                                    <Receipt className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Invoice</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-zinc-900 dark:text-white">No donations recorded yet</h3>
                    <p className="text-xs text-zinc-400 max-w-sm mx-auto">
                      Your future contributions toward our cause will appear here along with downloadable certificates.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default ProfilePage;