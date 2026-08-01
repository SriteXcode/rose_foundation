import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/api';
import { API_BASE_URL } from '../utils/constants';
import ImageUpload from '../components/ImageUpload';
import NewsletterProgress from '../components/NewsletterProgress';
import toast from 'react-hot-toast';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  FolderKanban, 
  Image as ImageIcon, 
  Mail, 
  Settings, 
  UserCheck, 
  LogOut, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  DollarSign,
  MessageSquare,
  Sparkles,
  ChevronRight,
  X,
  Menu,
  Heart
} from 'lucide-react';

const AdminPage = ({ user, adminData, loadAdminData, authLoading }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [works, setWorks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [blogPosts, setBlogPosts] = useState([]);
  
  // Newsletter Progress State
  const [newsletterProgress, setNewsletterProgress] = useState({ isSending: false, total: 0, current: 0 });

  // Edit/Add States
  const [editingUser, setEditingUser] = useState(null);
  const [editingWork, setEditingWork] = useState(null); 
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [volunteerSubTab, setVolunteerSubTab] = useState('approved');
  const [showWorkModal, setShowWorkModal] = useState(false);
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [newGalleryItem, setNewGalleryItem] = useState({ title: '', description: '', imageUrl: '', category: 'General', project: '' });
  const [tagType, setTagType] = useState('none'); 
  const [showSidebar, setShowSidebar] = useState(false);
  const [userSearchTerm, setUserSearchTerm] = useState('');

  const [campaignsList, setCampaignsList] = useState([]);
  const [editingCampaignItem, setEditingCampaignItem] = useState(null);
  const [showCampaignModal, setShowCampaignModal] = useState(false);

  const [donationsList, setDonationsList] = useState([]);
  const [donationSearchTerm, setDonationSearchTerm] = useState('');

  const [newsletterForm, setNewsletterForm] = useState({ subject: '', message: '' });
  const [settingsForm, setSettingsForm] = useState({
    siteName: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
    heroImagesDesktop: [],
    heroImagesMobile: []
  });
  const [isLoading, setIsLoading] = useState(false);

  // Check auth and load initial data
  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    if (!adminData?.isLoaded) {
      loadAdminData();
    }
  }, [user, navigate, adminData, loadAdminData, authLoading]);

  // Fetch data based on active tab
  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') return;
    
    if (activeTab === 'dashboard') {
      loadAdminData();
    }
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'projects') fetchWorks();
    if (activeTab === 'volunteers') {
      fetchVolunteers();
      fetchApplications();
    }
    if (activeTab === 'gallery') fetchGallery();
    if (activeTab === 'blog') fetchBlogPosts();
    if (activeTab === 'campaigns') {
      fetchCampaignsList();
      fetchBlogPosts();
    }
    if (activeTab === 'settings') fetchSettings();
  }, [activeTab, user, authLoading]);

  const fetchDonationsList = async () => {
    try {
      const response = await axiosInstance.get('/admin/donations');
      setDonationsList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch donations list', error);
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation record?')) return;
    try {
      await axiosInstance.delete(`/admin/donations/${id}`);
      toast.success('Donation record deleted');
      fetchDonationsList();
      if (loadAdminData) loadAdminData();
    } catch (error) {
      toast.error('Failed to delete donation record');
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setShowSidebar(false);
  };

  // --- API Fetch Functions ---
  const fetchVolunteers = async () => {
    try {
      const response = await axiosInstance.get('/volunteers?limit=1000&status=approved');
      const data = response.data.volunteers || response.data;
      setVolunteers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch volunteers', error);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axiosInstance.get('/volunteers?limit=1000&status=pending');
      const data = response.data.volunteers || response.data;
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch applications', error);
    }
  };

  const fetchBlogPosts = async () => {
    try {
      const response = await axiosInstance.get('/blog?limit=1000');
      setBlogPosts(response.data.posts || []);
    } catch (error) {
      console.error('Failed to fetch blog posts', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await axiosInstance.get('/settings');
      const data = response.data;
      setSettingsForm({
        siteName: data.siteName || '',
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        heroImagesDesktop: data.heroImagesDesktop || [],
        heroImagesMobile: data.heroImagesMobile || []
      });
      if (data.activeCampaign) {
        setCampaignForm({
          title: data.activeCampaign.title || '',
          subtitle: data.activeCampaign.subtitle || '',
          description: data.activeCampaign.description || '',
          imageUrl: data.activeCampaign.imageUrl || '',
          targetAmount: data.activeCampaign.targetAmount || 100000,
          currentAmount: data.activeCampaign.currentAmount || 0,
          buttonText: data.activeCampaign.buttonText || 'Donate Now',
          isActive: data.activeCampaign.isActive ?? true
        });
      }
    } catch (error) {
      console.error('Failed to fetch settings', error);
    }
  };

  const fetchCampaignsList = async () => {
    try {
      const response = await axiosInstance.get('/campaigns');
      setCampaignsList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch campaigns list', error);
    }
  };

  const handleCampaignSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const payload = { ...editingCampaignItem };
      if (!payload.startDate || payload.startDate === '') delete payload.startDate;
      if (!payload.endDate || payload.endDate === '') delete payload.endDate;
      if (!payload.relatedBlogPost || payload.relatedBlogPost === '') payload.relatedBlogPost = null;

      const url = editingCampaignItem?._id 
        ? `/campaigns/${editingCampaignItem._id}`
        : '/campaigns';
      const method = editingCampaignItem?._id ? 'put' : 'post';
      await axiosInstance[method](url, payload);

      toast.success(`Campaign ${editingCampaignItem?._id ? 'updated' : 'created'} successfully`);
      setShowCampaignModal(false);
      setEditingCampaignItem(null);
      fetchCampaignsList();
    } catch (error) {
      console.error('Campaign save error:', error);
      toast.error(error.response?.data?.error || 'Unable to save campaign.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCampaignItem = async (id) => {
    if (!window.confirm('Delete this campaign?')) return;
    try {
      await axiosInstance.delete(`/campaigns/${id}`);
      toast.success('Campaign deleted successfully');
      fetchCampaignsList();
    } catch (error) {
      toast.error('Unable to delete campaign.');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users', error);
    }
  };

  const fetchWorks = async () => {
    try {
      const response = await axiosInstance.get('/works?limit=1000');
      const data = response.data.works || response.data;
      setWorks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch works', error);
    }
  };

  const fetchGallery = async () => {
    try {
      const response = await axiosInstance.get('/gallery?limit=1000');
      const data = response.data.items || response.data;
      setGalleryItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch gallery', error);
    }
  };

  // --- User Management ---
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/admin/users/${userId}`);
      toast.success('User deleted');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.put(`/admin/users/${editingUser._id}`, {
        name: editingUser.name,
        email: editingUser.email,
        phone: editingUser.phone,
        role: editingUser.role
      });

      toast.success('User details updated successfully');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user details.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Work/Project Management ---
  const handleWorkSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingWork?._id 
        ? `/works/${editingWork._id}`
        : '/works';
      
      const payload = editingWork || {};
      
      if (editingWork?._id) {
        await axiosInstance.put(url, payload);
      } else {
        await axiosInstance.post(url, payload);
      }

      toast.success(`Project ${editingWork?._id ? 'updated' : 'added'} successfully`);
      setShowWorkModal(false);
      setEditingWork(null);
      fetchWorks();
    } catch (error) {
      toast.error('Unable to save project details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWork = async (id) => {
    if (!window.confirm('Delete this project?')) return;
    try {
      await axiosInstance.delete(`/works/${id}`);
      toast.success('Project deleted successfully');
      setWorks(prev => prev.filter(w => w._id !== id));
      fetchWorks();
    } catch (error) {
      toast.error('Unable to delete project.');
    }
  };

  // --- Volunteer Management ---
  const handleVolunteerSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingVolunteer?._id 
        ? `/volunteers/${editingVolunteer._id}`
        : '/volunteers';
      
      const payload = editingVolunteer || {};

      if (editingVolunteer?._id) {
        await axiosInstance.put(url, payload);
      } else {
        await axiosInstance.post(url, payload);
      }

      toast.success(`Volunteer ${editingVolunteer?._id ? 'updated' : 'added'} successfully`);
      setShowVolunteerModal(false);
      setEditingVolunteer(null);
      fetchVolunteers();
      fetchApplications();
      window.dispatchEvent(new Event('team-updated'));
    } catch (error) {
       toast.error('Unable to save volunteer details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteVolunteer = async (id) => {
    if (!window.confirm('Delete this volunteer?')) return;
    try {
      await axiosInstance.delete(`/volunteers/${id}`);
      toast.success('Volunteer deleted successfully');
      setVolunteers(prev => prev.filter(v => v._id !== id));
      fetchVolunteers();
      window.dispatchEvent(new Event('team-updated'));
    } catch (error) {
      toast.error('Unable to delete volunteer.');
    }
  };

  // --- Application Management ---
  const handleApproveApplication = async (application) => {
      try {
          await axiosInstance.put(`/volunteers/${application._id}`, { status: 'approved' });
          toast.success(`${application.name} approved as ${application.role}`);
          fetchApplications();
          window.dispatchEvent(new Event('team-updated'));
      } catch (error) {
          toast.error("Failed to approve application");
      }
  };

  const handleDeleteApplication = async (id) => {
    if (!window.confirm('Reject and delete this application?')) return;
    try {
      await axiosInstance.delete(`/volunteers/${id}`);
      toast.success('Application rejected');
      setApplications(prev => prev.filter(app => app._id !== id));
      fetchApplications();
      window.dispatchEvent(new Event('team-updated'));
    } catch (error) {
      toast.error('Unable to reject application.');
    }
  };

  // --- Blog Management ---
  const handleBlogSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const url = editingPost?._id 
        ? `/blog/${editingPost._id}`
        : '/blog';
      
      const method = editingPost?._id ? 'put' : 'post';
      await axiosInstance[method](url, editingPost);

      toast.success(`Post ${editingPost?._id ? 'updated' : 'published'} successfully`);
      setShowBlogModal(false);
      setEditingPost(null);
      fetchBlogPosts();
    } catch (error) {
      console.error("Blog Error", error);
      toast.error('Unable to save post.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post? This action cannot be undone.')) return;
    try {
      await axiosInstance.delete(`/blog/${id}`);
      toast.success('Post deleted');
      setBlogPosts(prev => prev.filter(p => p._id !== id));
      fetchBlogPosts();
    } catch (error) {
      toast.error('Unable to delete post.');
    }
  };

  // --- Gallery Management ---
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const payload = { ...newGalleryItem };
    if (tagType === 'project') {
      if (!payload.project) {
        toast.error('Please select a project');
        setIsLoading(false);
        return;
      }
      payload.category = 'Project'; 
    } else if (tagType === 'custom') {
      payload.project = '';
      if (!payload.category) {
        toast.error('Please enter a tag name');
        setIsLoading(false);
        return;
      }
    } else {
      payload.project = '';
      payload.category = 'General';
    }

    try {
      await axiosInstance.post('/gallery', payload);
      toast.success('Image added successfully');
      setShowGalleryModal(false);
      setNewGalleryItem({ title: '', description: '', imageUrl: '', category: 'General', project: '' });
      setTagType('none');
      fetchGallery();
    } catch (error) {
      toast.error('Unable to add image.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGallery = async (id) => {
    if (!id) {
      toast.error('Invalid image ID');
      return;
    }
    if (!window.confirm('Delete this image?')) return;
    try {
      await axiosInstance.delete(`/gallery/${id}`);
      toast.success('Gallery image deleted successfully');
      setGalleryItems(prev => prev.filter(item => (item._id || item.id) !== id));
      fetchGallery();
    } catch (error) {
      console.error('Delete gallery error:', error);
      toast.error('Unable to delete image.');
    }
  };

  // --- Newsletter & Settings ---
  const handleSendNewsletter = async (e) => {
    e.preventDefault();
    
    const totalSubscribers = adminData.stats?.totalNewsletters || 100;
    setNewsletterProgress({ isSending: true, total: totalSubscribers, current: 0 });
    
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 5) + 1;
      if (progress > totalSubscribers) progress = totalSubscribers;
      setNewsletterProgress(prev => ({ ...prev, current: progress }));
    }, 200);

    try {
      const response = await axiosInstance.post('/newsletter/send', newsletterForm);
      clearInterval(interval);
      setNewsletterProgress({ isSending: true, total: totalSubscribers, current: totalSubscribers });
      
      toast.success(response.data.message);
      setNewsletterForm({ subject: '', message: '' });
      
      setTimeout(() => {
        setNewsletterProgress({ isSending: false, total: 0, current: 0 });
      }, 3000);

    } catch (error) {
      clearInterval(interval);
      setNewsletterProgress({ isSending: false, total: 0, current: 0 });
      toast.error('Unable to send newsletter.');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await axiosInstance.put('/settings', settingsForm);
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Error saving settings');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-sm font-semibold text-zinc-500 animate-pulse">Verifying administrative access...</div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const renderCampaigns = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Active & Past Campaigns</h3>
          <p className="text-xs text-zinc-500">Manage multiple campaign drives, popups, and linked blog stories</p>
        </div>

        <button 
          onClick={() => { 
            setEditingCampaignItem({ 
              title: '', 
              subtitle: 'Featured Initiative', 
              description: '', 
              imageUrl: '', 
              targetAmount: 100000, 
              currentAmount: 0, 
              status: 'active', 
              relatedBlogPost: '', 
              buttonText: 'Donate Now', 
              isPopup: true 
            }); 
            setShowCampaignModal(true); 
          }}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Campaign
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaignsList.map((camp) => (
          <div key={camp._id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 mr-2">
                    {camp.subtitle || 'Drive'}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${camp.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    {camp.status}
                  </span>
                </div>
                {camp.isPopup && (
                  <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950 px-2 py-0.5 rounded-full">
                    Auto-Popup Active
                  </span>
                )}
              </div>

              <h4 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5">{camp.title}</h4>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed mb-3">{camp.description}</p>
              
              <div className="text-xs text-zinc-500 font-medium mb-3">
                Raised: <span className="font-bold text-zinc-900 dark:text-white">₹{camp.currentAmount?.toLocaleString()}</span> of ₹{camp.targetAmount?.toLocaleString()}
              </div>

              {camp.relatedBlogPost && (
                <div className="text-[11px] bg-blue-50/50 dark:bg-blue-950/30 p-2 rounded-lg text-blue-600 dark:text-blue-400 font-medium truncate mb-3">
                  🔗 Linked Blog: {typeof camp.relatedBlogPost === 'object' ? camp.relatedBlogPost.title : 'Selected Post'}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button 
                onClick={() => { setEditingCampaignItem(camp); setShowCampaignModal(true); }}
                className="text-xs font-semibold text-zinc-900 dark:text-white hover:underline cursor-pointer flex items-center gap-1"
              >
                <Edit3 className="w-3 h-3" /> Edit
              </button>
              <button 
                onClick={() => handleDeleteCampaignItem(camp._id)}
                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          </div>
        ))}
        {campaignsList.length === 0 && (
          <div className="col-span-full py-12 text-center text-xs text-zinc-400">
            No custom campaigns created yet. Click "+ New Campaign" above to launch one!
          </div>
        )}
      </div>
    </div>
  );

  // Nav Items Definition
  const sidebarItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
    { id: 'campaigns', icon: Sparkles, label: 'Campaign Popup' },
    { id: 'blog', icon: FileText, label: 'Blog Posts' },
    { id: 'volunteers', icon: UserCheck, label: 'Volunteers' },
    { id: 'users', icon: Users, label: 'Users' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'gallery', icon: ImageIcon, label: 'Gallery' },
    { id: 'newsletter', icon: Mail, label: 'Newsletter' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  // --- Render Functions ---
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Quick KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Total Raised</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">₹{adminData.stats?.totalAmount?.toLocaleString() || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Contact Messages</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{adminData.stats?.totalContacts || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Subscribers</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{adminData.stats?.totalNewsletters || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/50 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Mail className="w-5 h-5" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Registered Users</p>
              <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{adminData.stats?.totalUsers || 0}</h3>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Users className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 2-Column Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Donations */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Donations</h3>
            <span className="text-xs text-zinc-400 font-medium">Live Activity</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {adminData.donations?.length > 0 ? (
              adminData.donations.map((donation) => (
                <div key={donation._id} className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white">{donation.donorName || 'Anonymous Donor'}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{new Date(donation.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white">₹{donation.amount?.toLocaleString()}</span>
                    <span className={`block text-[10px] font-semibold uppercase ${donation.status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                      {donation.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-xs text-center py-6">No recent donations recorded.</p>
            )}
          </div>
        </div>

        {/* Recent Messages */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white">Recent Messages</h3>
            <span className="text-xs text-zinc-400 font-medium">Inquiries</span>
          </div>
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {adminData.contacts?.length > 0 ? (
              adminData.contacts.map((message) => (
                <div key={message._id} className="bg-gray-50 dark:bg-zinc-800/60 p-3.5 rounded-xl border border-gray-100 dark:border-zinc-800 flex justify-between items-center">
                  <div className="flex-1 pr-3">
                    <p className="font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white">{message.name}</p>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate max-w-xs">{message.message}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-zinc-400">{new Date(message.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-400 text-xs text-center py-6">No contact messages received yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => {
    const filteredUsersList = users.filter(u => 
      !userSearchTerm.trim() || 
      u.name?.toLowerCase().includes(userSearchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(userSearchTerm.toLowerCase())
    );

    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">User Accounts</h3>
            <p className="text-xs text-zinc-500">Manage registered user credentials and permission roles</p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={userSearchTerm}
              onChange={(e) => setUserSearchTerm(e.target.value)}
              className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-full pl-9 pr-3 py-2 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap text-xs sm:text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200/80 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400">
                <tr>
                  <th className="px-6 py-3.5 font-semibold">User</th>
                  <th className="px-6 py-3.5 font-semibold">Email</th>
                  <th className="px-6 py-3.5 font-semibold">Role</th>
                  <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/80">
                {filteredUsersList.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-zinc-900 dark:text-white">{u.name}</td>
                    <td className="px-6 py-3.5 text-zinc-600 dark:text-zinc-400">{u.email}</td>
                    <td className="px-6 py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' : 'bg-gray-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right space-x-2">
                      <button onClick={() => setEditingUser(u)} className="text-zinc-900 dark:text-white font-semibold text-xs hover:underline cursor-pointer">Edit</button>
                      {u.role !== 'admin' && (
                        <button onClick={() => handleDeleteUser(u._id)} className="text-red-500 font-semibold text-xs hover:underline cursor-pointer">Delete</button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredUsersList.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-zinc-400 text-xs">No users found matching query.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderDonations = () => {
    const filteredDonations = donationsList.filter(d => 
      (d.donorName && d.donorName.toLowerCase().includes(donationSearchTerm.toLowerCase())) ||
      (d.donorEmail && d.donorEmail.toLowerCase().includes(donationSearchTerm.toLowerCase())) ||
      (d.transactionId && d.transactionId.toLowerCase().includes(donationSearchTerm.toLowerCase()))
    );

    const totalDonationSum = donationsList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    return (
      <div className="space-y-6 text-left">
        {/* Header Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Total Collected</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">₹{totalDonationSum.toLocaleString()}</h3>
          </div>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs">
            <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">Total Donation Records</p>
            <h3 className="text-2xl font-extrabold text-zinc-900 dark:text-white mt-1">{donationsList.length}</h3>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search donor, email or TXN ID..." 
              value={donationSearchTerm} 
              onChange={(e) => setDonationSearchTerm(e.target.value)} 
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white"
            />
          </div>
          <button 
            onClick={() => { fetchDonationsList(); loadAdminData(); }} 
            className="text-xs font-semibold px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl hover:opacity-90 transition-opacity"
          >
            Refresh List
          </button>
        </div>

        {/* Donations Table */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-600 dark:text-zinc-400">
              <thead className="bg-gray-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 font-semibold border-b border-gray-200/80 dark:border-zinc-800">
                <tr>
                  <th className="py-3 px-4">Donor Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Payment Method / TXN</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {filteredDonations.length > 0 ? (
                  filteredDonations.map((don) => (
                    <tr key={don._id} className="hover:bg-gray-50/50 dark:hover:bg-zinc-800/40">
                      <td className="py-3 px-4 font-bold text-zinc-900 dark:text-white">{don.donorName || 'Anonymous'}</td>
                      <td className="py-3 px-4">{don.donorEmail || '-'}</td>
                      <td className="py-3 px-4 font-bold text-emerald-600 dark:text-emerald-400">₹{Number(don.amount)?.toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono text-[11px]">{don.paymentMethod || 'Online'}<br/><span className="text-zinc-400 text-[10px]">{don.transactionId || '-'}</span></td>
                      <td className="py-3 px-4">{don.createdAt ? new Date(don.createdAt).toLocaleDateString() : '-'}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${don.status === 'completed' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'}`}>
                          {don.status || 'completed'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button 
                          onClick={() => handleDeleteDonation(don._id)} 
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-zinc-400">No donations found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderProjects = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Social Projects</h3>
          <p className="text-xs text-zinc-500">Manage impact initiatives and community programs</p>
        </div>
        <button 
          onClick={() => { 
            setEditingWork({ title: '', description: '', category: 'General', status: 'ongoing', beneficiaries: 0, images: [] }); 
            setShowWorkModal(true); 
          }}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {works.map((work) => (
          <div key={work._id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-base text-zinc-900 dark:text-white">{work.title}</h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-gray-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  {work.status}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2 font-medium">{work.category} • {work.beneficiaries || 0} Beneficiaries</p>
              <p className="text-xs text-zinc-600 dark:text-zinc-300 line-clamp-2 mb-4 leading-relaxed">{work.description}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
              <div className="flex items-center gap-1.5">
                {work.images?.slice(0, 3).map((img, i) => (
                  <img key={i} src={img} alt="" className="w-6 h-6 rounded-full object-cover border border-gray-200 dark:border-zinc-700" />
                ))}
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => { setEditingWork(work); setShowWorkModal(true); }}
                  className="text-xs font-semibold text-zinc-900 dark:text-white hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Edit3 className="w-3 h-3" /> Edit
                </button>
                <button 
                  onClick={() => handleDeleteWork(work._id)}
                  className="text-xs font-semibold text-red-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderVolunteers = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Volunteer & Intern Management</h3>
          <p className="text-xs text-zinc-500">Review applications and manage active foundation scholars</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 dark:bg-zinc-900 p-1 rounded-full border border-gray-200/80 dark:border-zinc-800">
            <button 
              onClick={() => setVolunteerSubTab('approved')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${volunteerSubTab === 'approved' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              Approved ({volunteers.length})
            </button>
            <button 
              onClick={() => setVolunteerSubTab('pending')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${volunteerSubTab === 'pending' ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs' : 'text-zinc-600 dark:text-zinc-400'}`}
            >
              Pending ({applications.length})
            </button>
          </div>

          <button 
            onClick={() => { setEditingVolunteer({ role: 'Volunteer' }); setShowVolunteerModal(true); }}
            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" /> Add Volunteer
          </button>
        </div>
      </div>

      {volunteerSubTab === 'approved' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {volunteers.map((volunteer) => (
            <div key={volunteer._id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800 text-center relative group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-3 rounded-full overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                {volunteer.image?.startsWith('http') ? (
                  <img src={volunteer.image} alt={volunteer.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xl">👤</div>
                )}
              </div>
              <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-white truncate">{volunteer.name}</h4>
              
              {/* Quick Role Change Selector */}
              <div className="my-2">
                <select
                  value={volunteer.role || 'Volunteer'}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    const isGeneric = !volunteer.designation || ['Volunteer', 'Intern', 'Team Leader'].includes(volunteer.designation);
                    const newDesignation = isGeneric ? newRole : volunteer.designation;
                    try {
                      await axiosInstance.put(`/volunteers/${volunteer._id}`, {
                        ...volunteer,
                        role: newRole,
                        designation: newDesignation
                      });
                      toast.success(`Updated ${volunteer.name}'s role to ${newRole}`);
                      fetchVolunteers();
                      window.dispatchEvent(new Event('team-updated'));
                    } catch (err) {
                      toast.error('Failed to update volunteer role');
                    }
                  }}
                  className="w-full text-[11px] font-semibold bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-lg px-2 py-1 text-zinc-900 dark:text-white cursor-pointer"
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Intern">Intern</option>
                  <option value="Team Leader">⭐ Team Leader</option>
                </select>
              </div>
              
              <div className="flex justify-center gap-2 pt-2 border-t border-gray-100 dark:border-zinc-800">
                <button 
                  onClick={() => { setEditingVolunteer(volunteer); setShowVolunteerModal(true); }}
                  className="p-1.5 text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
                  title="Edit"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button 
                  onClick={() => handleDeleteVolunteer(volunteer._id)}
                  className="p-1.5 text-red-500 hover:text-red-600 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        renderApplications()
      )}
    </div>
  );

  const renderApplications = () => (
    <div>
      {applications.length === 0 ? (
          <p className="text-zinc-400 text-xs text-center py-10">No pending volunteer applications.</p>
      ) : (
          <div className="space-y-3">
              {applications.map((app) => (
                  <div key={app._id} className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 shrink-0 border border-gray-200 dark:border-zinc-700">
                              {app.image ? (
                                  <img 
                                    src={app.image.startsWith('http') ? app.image : `${API_BASE_URL}${app.image}`} 
                                    alt={app.name} 
                                    className="w-full h-full object-cover" 
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center text-lg">👤</div>
                              )}
                          </div>
                          <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{app.name}</h4>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                                    {app.role}
                                </span>
                              </div>
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{app.email} • Phone: {app.phone || 'N/A'}</p>
                          </div>
                      </div>

                      <div className="flex items-center gap-2 self-end md:self-auto">
                          <button 
                              onClick={() => handleApproveApplication(app)}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button 
                              onClick={() => handleDeleteApplication(app._id)}
                              className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/50 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1"
                          >
                              <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      )}
    </div>
  );

  const renderBlog = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Blog Articles</h3>
          <p className="text-xs text-zinc-500">Publish stories and ground updates</p>
        </div>
        <button 
          onClick={() => { 
            setEditingPost({ title: '', summary: '', content: '', coverImage: '', tags: '' }); 
            setShowBlogModal(true); 
          }}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> New Article
        </button>
      </div>

      <div className="space-y-3">
        {blogPosts.map((post) => (
          <div key={post._id} className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-12 shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700">
                 {post.coverImage ? (
                   <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center text-base">📝</div>
                 )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{post.title}</h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString()} • {post.summary?.substring(0, 70)}...</p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <button 
                onClick={() => { setEditingPost(post); setShowBlogModal(true); }}
                className="text-xs font-semibold text-zinc-900 dark:text-white hover:underline cursor-pointer px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-800"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDeletePost(post._id)}
                className="text-xs font-semibold text-red-500 hover:underline cursor-pointer px-3 py-1.5 rounded-full border border-red-100 dark:border-red-950 bg-red-50 dark:bg-red-950/30"
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Media Gallery</h3>
          <p className="text-xs text-zinc-500">Manage photo gallery moments</p>
        </div>
        <button 
          onClick={() => setShowGalleryModal(true)}
          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-4 py-2 rounded-full text-xs font-semibold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Upload Image
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {galleryItems.map((item, index) => (
          <div key={item._id || item.id || index} className="relative group rounded-2xl overflow-hidden bg-gray-100 dark:bg-zinc-900 aspect-square border border-gray-200/80 dark:border-zinc-800">
             {item.imageUrl?.startsWith('http') ? (
               <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
             ) : (
               <div className="flex items-center justify-center h-full text-3xl">{item.imageUrl}</div>
             )}
             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
               <button 
                 onClick={() => handleDeleteGallery(item._id || item.id)}
                 className="bg-red-600 text-white p-2 rounded-full shadow-lg cursor-pointer"
                 title="Delete Image"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderNewsletter = () => (
    <div className="max-w-2xl mx-auto space-y-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Broadcast Campaign</h3>
        <p className="text-xs text-zinc-500">Compose and send newsletters to active email subscribers</p>
      </div>

      <form onSubmit={handleSendNewsletter} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
          <input 
            type="text" placeholder="Campaign Subject Line..." 
            value={newsletterForm.subject}
            onChange={(e) => setNewsletterForm({...newsletterForm, subject: e.target.value})}
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white" 
            required
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Message</label>
          <textarea 
            rows={6} placeholder="Write your newsletter announcement..." 
            value={newsletterForm.message}
            onChange={(e) => setNewsletterForm({...newsletterForm, message: e.target.value})}
            className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white" 
            required
          />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer">
          {isLoading ? 'Sending Campaign...' : 'Send Campaign'}
        </button>
      </form>
    </div>
  );

  const renderSettings = () => (
    <div className="max-w-3xl mx-auto space-y-4">
      <div>
        <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Organization Settings</h3>
        <p className="text-xs text-zinc-500">Configure global foundation metadata & hero carousel images</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-gray-100 dark:border-zinc-800 pb-2">General Details</h4>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Organization Name</label>
            <input type="text" value={settingsForm.siteName} onChange={(e) => setSettingsForm({...settingsForm, siteName: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Contact Email</label>
              <input type="email" value={settingsForm.contactEmail} onChange={(e) => setSettingsForm({...settingsForm, contactEmail: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Contact Phone</label>
              <input type="tel" value={settingsForm.contactPhone} onChange={(e) => setSettingsForm({...settingsForm, contactPhone: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Address</label>
            <textarea rows={3} value={settingsForm.address} onChange={(e) => setSettingsForm({...settingsForm, address: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-zinc-900 dark:text-white" />
          </div>
        </div>

        {/* Hero Image Management */}
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-200/80 dark:border-zinc-800 shadow-xs space-y-6">
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-gray-100 dark:border-zinc-800 pb-2">Hero Carousel Images</h4>
          
          {/* Desktop Images */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Desktop Images (Landscape)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {settingsForm.heroImagesDesktop.map((img, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden h-24 border border-gray-200 dark:border-zinc-800 bg-gray-50">
                  <img src={img} alt={`Desktop Hero ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = settingsForm.heroImagesDesktop.filter((_, i) => i !== index);
                      setSettingsForm({ ...settingsForm, heroImagesDesktop: newImages });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="border border-gray-200/80 dark:border-zinc-800 rounded-xl p-2 bg-gray-50 dark:bg-zinc-800/50">
              <ImageUpload 
                onUpload={(url) => setSettingsForm(prev => ({
                  ...prev,
                  heroImagesDesktop: [...prev.heroImagesDesktop, url]
                }))}
              />
            </div>
          </div>

          {/* Mobile Images */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Mobile Images (Portrait)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {settingsForm.heroImagesMobile.map((img, index) => (
                <div key={index} className="relative group rounded-xl overflow-hidden h-32 border border-gray-200 dark:border-zinc-800 bg-gray-50">
                  <img src={img} alt={`Mobile Hero ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      const newImages = settingsForm.heroImagesMobile.filter((_, i) => i !== index);
                      setSettingsForm({ ...settingsForm, heroImagesMobile: newImages });
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className="border border-gray-200/80 dark:border-zinc-800 rounded-xl p-2 bg-gray-50 dark:bg-zinc-800/50">
              <ImageUpload 
                onUpload={(url) => setSettingsForm(prev => ({
                  ...prev,
                  heroImagesMobile: [...prev.heroImagesMobile, url]
                }))}
              />
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading} className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3 rounded-full text-xs font-semibold transition-all shadow-xs cursor-pointer">
          {isLoading ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col transition-colors">
      {/* Top Glassmorphic Navbar */}
      <div className="bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md border-b border-gray-200/80 dark:border-zinc-800 px-4 sm:px-8 py-3 flex justify-between items-center sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button 
            className="md:hidden text-zinc-700 dark:text-zinc-300 focus:outline-none p-1"
            onClick={() => setShowSidebar(!showSidebar)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900 dark:text-white">Admin Console</h1>
          </div>
        </div>

        <button 
          onClick={() => navigate('/')} 
          className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs rounded-full font-semibold transition-all cursor-pointer border border-gray-200 dark:border-zinc-700"
        >
          Exit to Home
        </button>
      </div>

      <div className="flex flex-1 relative max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Mobile Sidebar Overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs"
            onClick={() => setShowSidebar(false)}
          ></div>
        )}

        {/* Sidebar */}
        <div className={`
          fixed md:sticky top-20 left-0 h-auto w-60 bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-3 space-y-1 z-40
          transition-transform duration-300 ease-in-out shadow-sm
          ${showSidebar ? 'translate-x-4' : '-translate-x-full md:translate-x-0'}
          overflow-y-auto shrink-0 self-start
        `}>
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs' 
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-w-0">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'campaigns' && renderCampaigns()}
          {activeTab === 'users' && renderUsers()}
          {activeTab === 'volunteers' && renderVolunteers()}
          {activeTab === 'projects' && renderProjects()}
          {activeTab === 'gallery' && renderGallery()}
          {activeTab === 'blog' && renderBlog()} 
          {activeTab === 'newsletter' && renderNewsletter()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Blog Modal */}
      {showBlogModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-4xl shadow-2xl h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold mb-4 text-zinc-900 dark:text-white">{editingPost?._id ? 'Edit Article' : 'New Article'}</h3>
            <form onSubmit={handleBlogSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Title</label>
                  <input 
                    type="text" 
                    value={editingPost?.title || ''} 
                    onChange={(e) => setEditingPost({...editingPost, title: e.target.value})} 
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tags (comma separated)</label>
                  <input 
                    type="text" 
                    value={Array.isArray(editingPost?.tags) ? editingPost.tags.join(', ') : (editingPost?.tags || '')} 
                    onChange={(e) => setEditingPost({...editingPost, tags: e.target.value})} 
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" 
                    placeholder="Education, Health" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Cover Image</label>
                <ImageUpload 
                  currentImage={editingPost?.coverImage}
                  onUpload={(url) => setEditingPost({ ...editingPost, coverImage: url })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Summary Excerpt</label>
                <textarea 
                  rows={2} 
                  value={editingPost?.summary || ''} 
                  onChange={(e) => setEditingPost({...editingPost, summary: e.target.value})} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" 
                  required 
                />
              </div>

              <div className="h-64 mb-12">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Article Body</label>
                <ReactQuill 
                  theme="snow" 
                  value={editingPost?.content || ''} 
                  onChange={(content) => setEditingPost({...editingPost, content})}
                  className="h-48 bg-white dark:bg-zinc-800 rounded-xl text-zinc-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
                <button type="button" onClick={() => setShowBlogModal(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-semibold cursor-pointer">Publish Article</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4 text-zinc-900 dark:text-white">Edit User Credentials</h3>
            <form onSubmit={handleUpdateUser} className="space-y-3">
              <input type="text" value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              <input type="email" value={editingUser.email} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              <input type="tel" value={editingUser.phone||''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" placeholder="Phone" />
              <select value={editingUser.role} onChange={(e) => setEditingUser({...editingUser, role: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setEditingUser(null)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-semibold cursor-pointer">Save User</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Volunteer Modal */}
      {showVolunteerModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold mb-4 text-zinc-900 dark:text-white">{editingVolunteer?._id ? 'Edit Volunteer' : 'Add Volunteer'}</h3>
            <form onSubmit={handleVolunteerSubmit} className="space-y-3">
              <input type="text" placeholder="Full Name" value={editingVolunteer?.name||''} onChange={(e) => setEditingVolunteer({...editingVolunteer, name: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              <input type="text" placeholder="Designation / Role Title" value={editingVolunteer?.designation||''} onChange={(e) => setEditingVolunteer({...editingVolunteer, designation: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              
              <div className="grid grid-cols-2 gap-3">
                <input type="email" placeholder="Email" value={editingVolunteer?.email||''} onChange={(e) => setEditingVolunteer({...editingVolunteer, email: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
                <input type="tel" placeholder="Phone" value={editingVolunteer?.phone||''} onChange={(e) => setEditingVolunteer({...editingVolunteer, phone: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Aadhar" value={editingVolunteer?.aadhar||''} onChange={(e) => setEditingVolunteer({...editingVolunteer, aadhar: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
                <select 
                  value={editingVolunteer?.role || 'Volunteer'} 
                  onChange={(e) => {
                    const newRole = e.target.value;
                    const isGeneric = !editingVolunteer?.designation || ['Volunteer', 'Intern', 'Team Leader'].includes(editingVolunteer?.designation);
                    const newDesignation = isGeneric ? newRole : editingVolunteer?.designation;
                    setEditingVolunteer({
                      ...editingVolunteer, 
                      role: newRole,
                      designation: newDesignation
                    });
                  }} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white"
                >
                  <option value="Volunteer">Volunteer</option>
                  <option value="Intern">Intern</option>
                  <option value="Team Leader">⭐ Team Leader</option>
                </select>
              </div>

              <input type="text" placeholder="Qualification (e.g. B.Tech CS, MSW)" value={editingVolunteer?.qualification||''} onChange={(e) => setEditingVolunteer({...editingVolunteer, qualification: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Short Bio</label>
                  <span className="text-[10px] text-zinc-400 font-medium">
                    {editingVolunteer?.bio?.trim() ? editingVolunteer.bio.trim().split(/\s+/).length : 0} / 20 words
                  </span>
                </div>
                <textarea 
                  placeholder="Short Bio (Max 20 words)" 
                  rows="2" 
                  value={editingVolunteer?.bio||''} 
                  onChange={(e) => {
                    const val = e.target.value;
                    const words = val.trim() ? val.trim().split(/\s+/) : [];
                    const truncated = words.length > 20 ? words.slice(0, 20).join(' ') : val;
                    setEditingVolunteer({...editingVolunteer, bio: truncated});
                  }} 
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" 
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="url" placeholder="LinkedIn URL" value={editingVolunteer?.socialMedia?.linkedin || editingVolunteer?.linkedin || ''} onChange={(e) => setEditingVolunteer({...editingVolunteer, socialMedia: { ...(editingVolunteer?.socialMedia || {}), linkedin: e.target.value }})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
                <input type="url" placeholder="Instagram URL" value={editingVolunteer?.socialMedia?.instagram || editingVolunteer?.instagram || ''} onChange={(e) => setEditingVolunteer({...editingVolunteer, socialMedia: { ...(editingVolunteer?.socialMedia || {}), instagram: e.target.value }})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Avatar Photo</label>
                <ImageUpload 
                  currentImage={editingVolunteer?.image}
                  onUpload={(url) => setEditingVolunteer({ ...editingVolunteer, image: url })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowVolunteerModal(false); setEditingVolunteer(null); }} className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-semibold cursor-pointer">Save Volunteer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work/Project Modal */}
      {showWorkModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold mb-4 text-zinc-900 dark:text-white">{editingWork?._id ? 'Edit Project' : 'New Project'}</h3>
            <form onSubmit={handleWorkSubmit} className="space-y-3">
              <input type="text" placeholder="Title" value={editingWork?.title||''} onChange={(e) => setEditingWork({...editingWork, title: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              <textarea rows={3} placeholder="Description" value={editingWork?.description||''} onChange={(e) => setEditingWork({...editingWork, description: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Category" value={editingWork?.category||''} onChange={(e) => setEditingWork({...editingWork, category: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
                <select value={editingWork?.status||'ongoing'} onChange={(e) => setEditingWork({...editingWork, status: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white">
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="planned">Planned</option>
                </select>
              </div>
              
              <input type="number" placeholder="Beneficiaries Count" value={editingWork?.beneficiaries||0} onChange={(e) => setEditingWork({...editingWork, beneficiaries: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
              
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Project Images</label>
                <div className="border border-gray-200/80 dark:border-zinc-800 rounded-xl p-2">
                  <ImageUpload 
                    onUpload={(url) => {
                      const currentImages = editingWork?.images || [];
                      const newImages = [...currentImages, url];
                      setEditingWork({ 
                        ...editingWork, 
                        images: newImages, 
                        icon: newImages[0]
                      });
                    }}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowWorkModal(false); setEditingWork(null); }} className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-semibold cursor-pointer">Save Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGalleryModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-base font-bold mb-4 text-zinc-900 dark:text-white">Add Gallery Image</h3>
            <form onSubmit={handleGallerySubmit} className="space-y-3">
              <input type="text" placeholder="Title" value={newGalleryItem.title} onChange={(e) => setNewGalleryItem({...newGalleryItem, title: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Tagging Option</label>
                <div className="flex gap-3 text-xs text-zinc-700 dark:text-zinc-300">
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="tagType" value="project" checked={tagType === 'project'} onChange={(e) => setTagType(e.target.value)} /> Project Link
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="tagType" value="custom" checked={tagType === 'custom'} onChange={(e) => setTagType(e.target.value)} /> Custom Tag
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input type="radio" name="tagType" value="none" checked={tagType === 'none'} onChange={(e) => setTagType(e.target.value)} /> No Tag
                  </label>
                </div>

                {tagType === 'project' && (
                  <select 
                    value={newGalleryItem.project} 
                    onChange={(e) => setNewGalleryItem({...newGalleryItem, project: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white mt-1"
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
                    placeholder="Custom Tag Name (e.g. Workshop)" 
                    value={newGalleryItem.category === 'General' ? '' : newGalleryItem.category} 
                    onChange={(e) => setNewGalleryItem({...newGalleryItem, category: e.target.value})} 
                    className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white mt-1" 
                    required 
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Image Upload</label>
                <ImageUpload 
                  currentImage={newGalleryItem.imageUrl}
                  onUpload={(url) => setNewGalleryItem({ ...newGalleryItem, imageUrl: url })}
                />
              </div>
              
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowGalleryModal(false)} className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-semibold cursor-pointer">Add Image</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Campaign Manager Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-base font-bold mb-4 text-zinc-900 dark:text-white">{editingCampaignItem?._id ? 'Edit Campaign' : 'New Campaign'}</h3>
            <form onSubmit={handleCampaignSubmit} className="space-y-3">
              <input type="text" placeholder="Campaign Title" value={editingCampaignItem?.title || ''} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, title: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
              
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Subtitle / Badge (e.g. Urgent)" value={editingCampaignItem?.subtitle || ''} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, subtitle: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
                <select value={editingCampaignItem?.status || 'active'} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, status: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white">
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <textarea rows={3} placeholder="Description Excerpt & Details..." value={editingCampaignItem?.description || ''} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, description: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target (₹)</label>
                  <input type="number" value={editingCampaignItem?.targetAmount || 100000} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, targetAmount: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Current (₹)</label>
                  <input type="number" value={editingCampaignItem?.currentAmount || 0} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, currentAmount: Number(e.target.value)})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" required />
                </div>
              </div>

              {/* Optional Start & End Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Start Date (Optional)</label>
                  <input type="date" value={editingCampaignItem?.startDate ? new Date(editingCampaignItem.startDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, startDate: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">End Date (Optional)</label>
                  <input type="date" value={editingCampaignItem?.endDate ? new Date(editingCampaignItem.endDate).toISOString().split('T')[0] : ''} onChange={(e) => setEditingCampaignItem({...editingCampaignItem, endDate: e.target.value})} className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white" />
                </div>
              </div>

              {/* Related Blog Post Link Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Link Related Blog Post (Optional)</label>
                <select 
                  value={editingCampaignItem?.relatedBlogPost?._id || editingCampaignItem?.relatedBlogPost || ''} 
                  onChange={(e) => setEditingCampaignItem({...editingCampaignItem, relatedBlogPost: e.target.value || null})}
                  className="w-full bg-gray-50 dark:bg-zinc-800 border border-gray-200/80 dark:border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-900 dark:text-white"
                >
                  <option value="">-- No Related Blog Post --</option>
                  {blogPosts.map(post => (
                    <option key={post._id} value={post._id}>{post.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Campaign Image</label>
                <ImageUpload 
                  currentImage={editingCampaignItem?.imageUrl}
                  onUpload={(url) => setEditingCampaignItem({ ...editingCampaignItem, imageUrl: url })}
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => { setShowCampaignModal(false); setEditingCampaignItem(null); }} className="flex-1 px-4 py-2 border border-gray-200 dark:border-zinc-700 rounded-full text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">Cancel</button>
                <button type="submit" disabled={isLoading} className="flex-1 px-4 py-2 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-full text-xs font-semibold cursor-pointer">Save Campaign</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Newsletter Progress Widget */}
      <NewsletterProgress 
        isSending={newsletterProgress.isSending}
        total={newsletterProgress.total}
        current={newsletterProgress.current}
        onClose={() => setNewsletterProgress({ ...newsletterProgress, isSending: false })}
      />
    </div>
  );
};

export default AdminPage;