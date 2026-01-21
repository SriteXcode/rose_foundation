import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import toast from 'react-hot-toast';

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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Verifying access...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">My Account</h1>
              <p className="opacity-90 mt-2">Welcome back, {user.name}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-colors backdrop-blur-sm border border-white/30"
            >
              Logout
            </button>
          </div>

          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === 'profile' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Profile Settings
            </button>
            <button
              onClick={() => setActiveTab('donations')}
              className={`flex-1 py-4 text-center font-semibold transition-colors ${
                activeTab === 'donations' 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Donation History
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'profile' ? (
              <div className="max-w-md mx-auto">
                <form onSubmit={handleUpdateProfile} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user.email}
                      disabled
                      className="w-full px-4 py-2 border rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800"
                      placeholder="Enter phone number"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            ) : (
              <div>
                {donations.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 font-semibold text-gray-600">Date</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Amount</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Transaction ID</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Status</th>
                          <th className="px-6 py-3 font-semibold text-gray-600">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {donations.map((donation) => (
                          <tr key={donation._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-gray-800">
                              {new Date(donation.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 font-semibold text-green-600">
                              ₹{donation.amount.toLocaleString()}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                              {donation.transactionId || '-'}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                donation.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                              }`}>
                                {donation.status.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {donation.status === 'completed' && (
                                <button
                                  onClick={() => navigate(`/certificate/${donation._id}`)}
                                  className="text-blue-600 hover:text-blue-800 font-semibold text-sm hover:underline flex items-center gap-1"
                                >
                                  <span>📜</span> Certificate
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-4">💝</div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">No donations yet</h3>
                    <p className="text-gray-500">Your generous contributions will appear here.</p>
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