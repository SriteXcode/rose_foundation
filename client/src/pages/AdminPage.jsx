import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../utils/constants';
import ImageUpload from '../components/ImageUpload';
import toast from 'react-hot-toast';

const AdminPage = ({ user, adminData, loadAdminData, authLoading }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [works, setWorks] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  
  // Edit/Add States
  const [editingUser, setEditingUser] = useState(null);
  const [editingWork, setEditingWork] = useState(null); 
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', imageUrl: '', category: 'General', project: '' });
  const [tagType, setTagType] = useState('none'); // 'project', 'custom', 'none'

  const [newsletterForm, setNewsletterForm] = useState({ subject: '', message: '' });
  const [settingsForm, setSettingsForm] = useState({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check auth and load initial data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    // Load dashboard stats if not present
    if (!adminData?.isLoaded) {
      loadAdminData();
    }
  }, [user, navigate, adminData, loadAdminData, authLoading]);

  // Fetch data based on active tab
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') return;
    
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'projects') fetchWorks();
    if (activeTab === 'gallery') fetchGallery();
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab, user, authLoading]);

  // --- API Fetch Functions ---
  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      if (response.ok) {
        const data = await response.json();
        setSettingsForm({
          siteName: data.siteName || '',
          contactEmail: data.contactEmail || '',
          contactPhone: data.contactPhone || '',
          address: data.address || ''
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchWorks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/works`);
      if (response.ok) {
        setWorks(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch works', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/gallery`);
      if (response.ok) {
        setGalleryItems(await response.json());
      }
    } catch (error) {
      console.error('Failed to fetch gallery', error);
    }
  };

  // --- User Management ---
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success('User deleted');
        fetchUsers();
      }
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/users/${editingUser._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          phone: editingUser.phone,
          role: editingUser.role
        })
      });

      if (response.ok) {
        toast.success('User updated successfully');
        setEditingUser(null);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to update user');
      }
    } catch (error) {
      toast.error('Failed to update user');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Work/Project Management ---
  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const url = editingWork?._id 
        ? `${API_BASE_URL}/works/${editingWork._id}`
        : `${API_BASE_URL}/works`;
      
      const method = editingWork?._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editingWork || {})
      });

      if (response.ok) {
        toast.success(`Project ${editingWork?._id ? 'updated' : 'added'} successfully`);
        setShowWorkModal(false);
        setEditingWork(null);
        fetchWorks();
      } else {
        toast.error('Failed to save project');
      }
    } catch (error) {
      toast.error('Error saving project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWork = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/works/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchWorks();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  // --- Gallery Management ---
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Prepare payload based on tagType
    const payload = { ...newGalleryItem };
    if (tagType === 'project') {
      // Keep project ID, maybe fetch project name for category or keep 'General'
      // Ideally, the backend populates category if we want, but for now let's keep user category or default
      if (!payload.project) {
        toast.error('Please select a project');
        setIsLoading(false);
        return;
      }
      // Set category to 'Project' or keep it as is if we want
      payload.category = 'Project'; 
    } else if (tagType === 'custom') {
      payload.project = ''; // Clear project
      if (!payload.category) {
        toast.error('Please enter a tag name');
        setIsLoading(false);
        return;
      }
    } else {
      // None
      payload.project = '';
      payload.category = 'General';
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Image added successfully');
        setShowGalleryModal(false);
        setNewGalleryItem({ title: '', description: '', imageUrl: '', category: 'General', project: '' });
        setTagType('none');
        fetchGallery();
      } else {
        toast.error('Failed to add image');
      }
    } catch (error) {
      toast.error('Error adding image');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!window.confirm('Delete this image?')) return;
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) fetchGallery();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  // --- Newsletter & Settings ---
  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/newsletter/send`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(newsletterForm)
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
        setNewsletterForm({ subject: '', message: '' });
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('Failed to send newsletter');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settingsForm)
      });

      if (response.ok) {
        toast.success('Settings saved successfully!');
      } else {
        toast.error('Failed to save settings');
      }
    } catch (error) {
      toast.error('Error saving settings');
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

  if (!user || user.role !== 'admin') return null;

  // --- Render Functions ---
  const renderDashboard = () => (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-lg font-semibold">Total Donations</h3>
          <p className="text-2xl font-bold">₹{adminData.stats?.totalAmount?.toLocaleString() || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
          <div className="text-3xl mb-2">📧</div>
          <h3 className="text-lg font-semibold">Contact Messages</h3>
          <p className="text-2xl font-bold">{adminData.stats?.totalContacts || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
          <div className="text-3xl mb-2">📬</div>
          <h3 className="text-lg font-semibold">Subscribers</h3>
          <p className="text-2xl font-bold">{adminData.stats?.totalNewsletters || 0}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-2xl font-bold">{adminData.stats?.totalUsers || 0}</p>
        </div>
      </div>

      {/* Recent Data Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Donations */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Donations</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {adminData.donations?.length > 0 ? (
              adminData.donations.map((donation) => (
                <div key={donation._id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{donation.donorName || 'Anonymous'}</p>
                      <p className="text-sm text-gray-600">{new Date(donation.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={`font-bold ${donation.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>
                      ₹{donation.amount?.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No donations found.</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Messages</h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {adminData.contacts?.length > 0 ? (
              adminData.contacts.map((message) => (
                <div key={message._id} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{message.name}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[150px]">{message.message}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No messages found.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <div>
      <h3 className="text-2xl font-bold mb-6 text-gray-800">User Management</h3>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 font-semibold text-gray-600">Name</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Email</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Role</th>
              <th className="px-6 py-4 font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => (
              <tr key={u._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-gray-800">{u.name}</td>
                <td className="px-6 py-4 text-gray-800">{u.email}</td>
                <td className="px-6 py-4"><span className="px-2 py-1 rounded bg-gray-100 text-xs font-semibold text-gray-700">{u.role}</span></td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => setEditingUser(u)} className="text-blue-500 font-semibold text-sm">Edit</button>
                  {u.role !== 'admin' && <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 font-semibold text-sm">Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Projects</h3>
        <button 
          onClick={() => { setEditingWork({}); setShowWorkModal(true); }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          + Add Project
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {works.map((work) => (
          <div key={work._id} className="bg-white p-4 rounded-xl border shadow-sm">
            <h4 className="font-bold text-lg text-gray-800">{work.title}</h4>
            <p className="text-sm text-gray-500 mb-2">{work.category} • {work.status}</p>
            <p className="text-gray-600 text-sm mb-4 truncate">{work.description}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => { setEditingWork(work); setShowWorkModal(true); }}
                className="text-blue-600 text-sm font-semibold"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeleteWork(work._id)}
                className="text-red-600 text-sm font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderGallery = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800">Gallery</h3>
        <button 
          onClick={() => setShowGalleryModal(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700"
        >
          + Add Image
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {galleryItems.map((item) => (
          <div key={item._id} className="relative group rounded-lg overflow-hidden bg-gray-100 aspect-square">
             {item.imageUrl?.startsWith('http') ? (
               <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
             ) : (
               <div className="flex items-center justify-center h-full text-4xl">{item.imageUrl}</div>
             )}
             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button 
                 onClick={() => handleDeleteGallery(item._id)}
                 className="bg-red-600 text-white px-3 py-1 rounded text-sm font-semibold"
               >
                 Delete
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewsletter = () => (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">Send Newsletter</h3>
      <form onSubmit={handleSendNewsletter} className="space-y-4">
        <input 
          type="text" placeholder="Subject" 
          value={newsletterForm.subject}
          onChange={(e) => setNewsletterForm({...newsletterForm, subject: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg text-gray-800" required
        />
        <textarea 
          rows={6} placeholder="Message" 
          value={newsletterForm.message}
          onChange={(e) => setNewsletterForm({...newsletterForm, message: e.target.value})}
          className="w-full px-4 py-2 border rounded-lg text-gray-800" required
        />
        <button type="submit" disabled={isLoading} className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold">
          {isLoading ? 'Sending...' : 'Send Campaign'}
        </button>
      </form>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-2xl mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">System Settings</h3>
      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Organization Name</label>
            <input type="text" value={settingsForm.siteName} onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Email</label>
            <input type="email" value={settingsForm.contactEmail} onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Contact Phone</label>
            <input type="tel" value={settingsForm.contactPhone} onChange={(e) => setSettingsForm({...settingsForm, contactPhone: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-gray-800" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <textarea rows={3} value={settingsForm.address} onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})} className="w-full px-4 py-2 border rounded-lg text-gray-800" />
          </div>
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-slate-800 hover:bg-slate-900 text-white py-3 rounded-lg font-semibold transition-colors">
          {isLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-semibold transition-colors"
        >
          Exit to Home
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r shadow-sm p-4 space-y-2 hidden md:block">
          {[
            { id: 'dashboard', icon: '📊', label: 'Overview' },
            { id: 'users', icon: '👥', label: 'Users' },
            { id: 'projects', icon: '🏗️', label: 'Projects' },
            { id: 'gallery', icon: '🖼️', label: 'Gallery' },
            { id: 'newsletter', icon: '📧', label: 'Newsletter' },
            { id: 'settings', icon: '⚙️', label: 'Settings' }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === item.id ? 'bg-gray-100 text-purple-700 font-bold border-l-4 border-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span className="text-xl">{item.icon}</span><span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'newsletter' && renderNewsletter()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* --- Modals (Keep existing modal code) --- */}
      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
              <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
              <input type="tel" value={editingUser.phone||''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" placeholder="Phone" />
              <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white text-gray-800">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work/Project Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-bold mb-4 text-gray-800">{editingWork._id ? 'Edit Project' : 'New Project'}</h3>
            <form onSubmit={handleWorkSubmit} className="space-y-4">
              <input type="text" placeholder="Title" value={editingWork.title||''} onChange={(e) => setEditingWork({...editingWork, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
              <textarea rows={3} placeholder="Description" value={editingWork.description||''} onChange={(e) => setEditingWork({...editingWork, description: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Category" value={editingWork.category||''} onChange={(e) => setEditingWork({...editingWork, category: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
                <select value={editingWork.status||'ongoing'} onChange={(e) => setEditingWork({...editingWork, status: e.target.value})} className="w-full px-3 py-2 border rounded-lg bg-white text-gray-800">
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
              <input type="number" placeholder="Beneficiaries Count" value={editingWork.beneficiaries||0} onChange={(e) => setEditingWork({...editingWork, beneficiaries: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" />
              
              {/* Multiple Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Images</label>
                
                {/* Image List */}
                {editingWork.images && editingWork.images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {editingWork.images.map((img, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden h-24 border">
                        {img.startsWith('http') ? (
                          <img src={img} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-50 text-2xl">{img}</div>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = editingWork.images.filter((_, i) => i !== index);
                            setEditingWork({ ...editingWork, images: newImages, icon: newImages[0] || '' });
                          }}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border rounded-lg p-2">
                  <ImageUpload 
                    onUpload={(url) => {
                      const currentImages = editingWork.images || [];
                      const newImages = [...currentImages, url];
                      setEditingWork({ 
                        ...editingWork, 
                        images: newImages, 
                        icon: newImages[0] // Set first image as icon/main image
                      });
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">Add another image</p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowWorkModal(false); setEditingWork(null); }} className="flex-1 px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Add Image</h3>
            <form onSubmit={handleGallerySubmit} className="space-y-4">
              <input type="text" placeholder="Title" value={newGalleryItem.title} onChange={(e) => setNewGalleryItem({...newGalleryItem, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
              
              {/* Tagging Options */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Tagging Option</label>
                <div className="flex gap-4 text-sm text-gray-700">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tagType" 
                      value="project" 
                      checked={tagType === 'project'} 
                      onChange={(e) => setTagType(e.target.value)} 
                    />
                    Link to Project
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tagType" 
                      value="custom" 
                      checked={tagType === 'custom'} 
                      onChange={(e) => setTagType(e.target.value)} 
                    />
                    Custom Tag
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      type="radio" 
                      name="tagType" 
                      value="none" 
                      checked={tagType === 'none'} 
                      onChange={(e) => setTagType(e.target.value)} 
                    />
                    No Tag
                  </label>
                </div>

                {/* Conditional Inputs */}
                {tagType === 'project' && (
                  <select 
                    value={newGalleryItem.project} 
                    onChange={(e) => setNewGalleryItem({...newGalleryItem, project: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg bg-white text-gray-800 mt-2"
                    required
                  >
                    <option value="">-- Select Project --</option>
                    {works.map(work => (
                      <option key={work._id} value={work._id}>{work.title}</option>
                    ))}
                  </select>
                )}

                {tagType === 'custom' && (
                  <input 
                    type="text" 
                    placeholder="Enter Custom Tag (e.g. Education)" 
                    value={newGalleryItem.category === 'General' ? '' : newGalleryItem.category} 
                    onChange={(e) => setNewGalleryItem({...newGalleryItem, category: e.target.value})} 
                    className="w-full px-3 py-2 border rounded-lg text-gray-800 mt-2" 
                    required 
                  />
                )}
              </div>

              <input type="text" placeholder="Image URL (http://...) or Emoji" value={newGalleryItem.imageUrl} onChange={(e) => setNewGalleryItem({...newGalleryItem, imageUrl: e.target.value})} className="w-full px-3 py-2 border rounded-lg text-gray-800" required />
              
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image</label>
                <ImageUpload 
                  currentImage={newGalleryItem.imageUrl}
                  onUpload={(url) => setNewGalleryItem({ ...newGalleryItem, imageUrl: url })}
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="flex-1 px-4 py-2 border rounded-lg text-gray-700">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg">Add Image</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;