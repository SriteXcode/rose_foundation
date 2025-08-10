import React, { useState, useEffect } from 'react';

const BlackRoseFoundation = () => {
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [donationAmount, setDonationAmount] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Auth states
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  
  // Auth forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '',
    phone: ''
  });
  
  // Admin data
  const [adminData, setAdminData] = useState({
    donations: [],
    contacts: [],
    newsletters: [],
    stats: {
      totalDonations: 0,
      totalContacts: 0,
      totalNewsletters: 0,
      totalAmount: 0
    }
  });

  const API_BASE_URL = 'http://localhost:5000/api';

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connected:', data);
        return true;
      } else {
        console.log('❌ Backend connection failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Backend connection error:', error.message);
      return false;
    }
  };

  // Auth functions
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!loginForm.email || !loginForm.password) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginForm),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setShowLogin(false);
        setLoginForm({ email: '', password: '' });
        alert('Login successful!');
        
        // If admin, load admin data
        if (data.user.role === 'admin') {
          loadAdminData();
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };


  const handleRegister = async (e) => {
  e.preventDefault();

  // Basic validation
  if (!registerForm.name || !registerForm.email || !registerForm.password) {
    alert("Please fill in all required fields");
    return;
  }
  if (registerForm.password !== registerForm.confirmPassword) {
    alert("Passwords do not match");
    return;
  }
  if (registerForm.password.length < 6) {
    alert("Password must be at least 6 characters long");
    return;
  }

  setIsLoading(true);

  try {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: registerForm.name,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password // ✅ raw password
      })
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration successful! Please login.");
      setShowRegister(false);
      setShowLogin(true);
      setRegisterForm({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
    } else {
      throw new Error(data.error || "Registration failed");
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert(`Error: ${err.message}`);
  } finally {
    setIsLoading(false);
  }
};


  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowAdmin(false);
    alert('Logged out successfully');
  };

  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data);
      }
    } catch (error) {
      console.error('Admin data error:', error);
    }
  };

  // Contact form submission with auth
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers,
        body: JSON.stringify(contactForm),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Thank you for your message! We will get back to you soon.');
        setContactForm({ name: '', email: '', message: '' });
      } else {
        throw new Error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      alert(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    
    if (!newsletter) {
      alert('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletter)) {
      alert('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/newsletter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newsletter }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Successfully subscribed to our newsletter!');
        setNewsletter('');
      } else {
        throw new Error(data.error || 'Failed to subscribe');
      }
    } catch (error) {
      console.error('Newsletter error:', error);
      alert(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDonation = async () => {
    if (!donationAmount || donationAmount <= 0) {
      alert('Please enter a valid donation amount');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/donations`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          amount: parseFloat(donationAmount),
          currency: 'INR',
          donor: {
            anonymous: !user,
            userId: user?.id
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Thank you for your generous donation! You will receive a confirmation email shortly.');
        setDonationAmount('');
      } else {
        throw new Error(data.error || 'Failed to process donation');
      }
    } catch (error) {
      console.error('Donation error:', error);
      alert(`Error: ${error.message}. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      if (userData.role === 'admin') {
        loadAdminData();
      }
    }
    testBackendConnection();
  }, []);

  // Login Modal
  const LoginModal = () => (
    showLogin && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Login</h2>
            <button 
              onClick={() => setShowLogin(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={loginForm.email}
                onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Don't have an account?</p>
            <button
              onClick={() => {
                setShowLogin(false);
                setShowRegister(true);
              }}
              className="text-red-500 hover:text-red-600 font-semibold"
            >
              Register here
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Register Modal
  const RegisterModal = () => (
    showRegister && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Register</h2>
            <button 
              onClick={() => setShowRegister(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={registerForm.name}
                onChange={(e) => setRegisterForm({...registerForm, name: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={registerForm.email}
                onChange={(e) => setRegisterForm({...registerForm, email: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <div>
              <input
                type="tel"
                placeholder="Phone Number (Optional)"
                value={registerForm.phone}
                onChange={(e) => setRegisterForm({...registerForm, phone: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                value={registerForm.password}
                onChange={(e) => setRegisterForm({...registerForm, password: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
                minLength={6}
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Confirm Password"
                value={registerForm.confirmPassword}
                onChange={(e) => setRegisterForm({...registerForm, confirmPassword: e.target.value})}
                className="text-blue-600 w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="text-blue-600 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">Already have an account?</p>
            <button
              onClick={() => {
                setShowRegister(false);
                setShowLogin(true);
              }}
              className="text-red-500 hover:text-red-600 font-semibold"
            >
              Login here
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Admin Panel
  const AdminPanel = () => (
    showAdmin && user?.role === 'admin' && (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-6xl w-full max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Admin Dashboard</h2>
            <button 
              onClick={() => setShowAdmin(false)}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ✕
            </button>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-xl">
              <div className="text-3xl mb-2">💰</div>
              <h3 className="text-lg font-semibold">Total Donations</h3>
              <p className="text-2xl font-bold">₹{adminData.stats.totalAmount?.toLocaleString() || 0}</p>
              <p className="text-sm opacity-75">{adminData.stats.totalDonations || 0} donations</p>
            </div>
            
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl">
              <div className="text-3xl mb-2">📧</div>
              <h3 className="text-lg font-semibold">Contact Messages</h3>
              <p className="text-2xl font-bold">{adminData.stats.totalContacts || 0}</p>
              <p className="text-sm opacity-75">pending responses</p>
            </div>
            
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-xl">
              <div className="text-3xl mb-2">📬</div>
              <h3 className="text-lg font-semibold">Newsletter Subscribers</h3>
              <p className="text-2xl font-bold">{adminData.stats.totalNewsletters || 0}</p>
              <p className="text-sm opacity-75">active subscribers</p>
            </div>
            
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
              <div className="text-3xl mb-2">👥</div>
              <h3 className="text-lg font-semibold">Total Users</h3>
              <p className="text-2xl font-bold">150</p>
              <p className="text-sm opacity-75">registered users</p>
            </div>
          </div>
          
          {/* Recent Data Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Donations */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Donations</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  { id: 1, name: 'Anonymous', amount: 5000, date: '2024-08-09' },
                  { id: 2, name: 'John Doe', amount: 2500, date: '2024-08-08' },
                  { id: 3, name: 'Jane Smith', amount: 1000, date: '2024-08-07' }
                ].map((donation) => (
                  <div key={donation.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{donation.name}</p>
                        <p className="text-sm text-gray-600">{donation.date}</p>
                      </div>
                      <div className="text-green-600 font-bold">
                        ₹{donation.amount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Recent Messages */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Recent Messages</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {[
                  { id: 1, name: 'Alice Johnson', subject: 'Volunteer Inquiry', date: '2024-08-09' },
                  { id: 2, name: 'Bob Wilson', subject: 'Partnership Proposal', date: '2024-08-08' },
                  { id: 3, name: 'Carol Davis', subject: 'General Inquiry', date: '2024-08-07' }
                ].map((message) => (
                  <div key={message.id} className="bg-white p-4 rounded-lg border">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{message.name}</p>
                        <p className="text-sm text-gray-600">{message.subject}</p>
                      </div>
                      <div className="text-sm text-gray-500">
                        {message.date}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              📊 View Analytics
            </button>
            <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              📧 Send Newsletter
            </button>
            <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              👥 Manage Users
            </button>
            <button className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
    )
  );

  // Navigation component with auth
  const Navigation = () => (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🌹</span>
            <span className="text-xl font-bold text-red-500">Black Rose Foundation</span>
          </div>
          
          <div className="hidden md:flex space-x-8">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'works', label: 'Works' },
              { id: 'vision', label: 'Vision' },
              { id: 'difference', label: 'Why Us' },
              { id: 'donate', label: 'Donate' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'contact', label: 'Contact' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`text-white hover:text-red-400 transition-colors relative group ${
                  activeSection === item.id ? 'text-red-400' : ''
                }`}
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
              </button>
            ))}
          </div>
          
          {/* Auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAdmin(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Admin
                  </button>
                )}
                <span className="text-white">Welcome, {user.name}</span>
                
                <button
                  onClick={handleLogout}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setShowRegister(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                >
                  Register
                </button>
              </div>
            )}
          </div>
          
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>
        
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {[
              { id: 'home', label: 'Home' },
              { id: 'about', label: 'About' },
              { id: 'works', label: 'Works' },
              { id: 'vision', label: 'Vision' },
              { id: 'difference', label: 'Why Us' },
              { id: 'donate', label: 'Donate' },
              { id: 'gallery', label: 'Gallery' },
              { id: 'contact', label: 'Contact' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left text-white hover:text-red-400 py-2 transition-colors"
              >
                {item.label}
              </button>
            ))}
            
            {/* Mobile auth buttons */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              {user ? (
                <div className="space-y-2">
                  <p className="text-white">Welcome, {user.name}</p>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowAdmin(true);
                        setIsMenuOpen(false);
                      }}
                      className="block w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowRegister(true);
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );

  // Hero Section
  const HeroSection = () => (
    <section id="home" className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-red-600 flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-red-400 bg-clip-text text-transparent animate-pulse">
          Empowering Communities
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Together we can create a better tomorrow for everyone
        </p>
        <button
          onClick={() => scrollToSection('about')}
          className="bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl"
        >
          Learn More
        </button>
        
        {/* Connection status indicator */}
        <div className="mt-8">
          <button
            onClick={testBackendConnection}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full text-sm transition-all duration-300"
          >
            Test Backend Connection
          </button>
        </div>
      </div>
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <button onClick={() => scrollToSection('about')} className="text-white text-3xl">
          ⬇
        </button>
      </div>
    </section>
  );

  // About Section
  const AboutSection = () => (
    <section id="about" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
          About Black Rose Foundation
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Black Rose Foundation is a non-profit organization dedicated to empowering communities and transforming lives. Since our establishment, we have been working tirelessly to address social issues and create sustainable solutions for those in need.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Our foundation believes in the power of collective action and community participation. We work across various sectors including education, healthcare, women empowerment, environmental conservation, and rural development to create lasting positive impact.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              With a team of dedicated volunteers and professionals, we strive to bridge the gap between resources and needs, ensuring that help reaches those who need it most.
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-red-400 to-red-600 rounded-3xl p-8 text-white text-center shadow-2xl transform rotate-3 hover:rotate-0 transition-all duration-500">
              <div className="text-6xl mb-4">🤝</div>
              <h3 className="text-2xl font-bold mb-2">Community First</h3>
              <p className="text-lg">Empowering communities through sustainable development and social welfare initiatives.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Vision & Mission Section
  const VisionMissionSection = () => (
    <section id="vision" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
          Our Vision & Mission
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-3xl font-bold mb-4">Our Vision</h3>
              <p className="text-lg leading-relaxed">
                To create a world where every individual has equal opportunities to thrive, regardless of their background or circumstances. We envision communities that are self-sufficient, empowered, and united in their pursuit of progress and well-being.
              </p>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-teal-600 text-white p-8 rounded-3xl shadow-2xl transform hover:scale-105 transition-all duration-300">
            <div className="text-center">
              <div className="text-5xl mb-4">🚀</div>
              <h3 className="text-3xl font-bold mb-4">Our Mission</h3>
              <p className="text-lg leading-relaxed">
                To empower communities through sustainable development programs, education initiatives, healthcare support, and social welfare activities. We are committed to creating lasting positive change through innovative solutions and collaborative partnerships.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  // Works Section
  const WorksSection = () => {
    const works = [
      { icon: '📚', title: 'Education Programs', desc: 'Quality education, scholarships, and learning resources for underprivileged children.' },
      { icon: '🏥', title: 'Healthcare Initiatives', desc: 'Mobile health camps, free medical checkups, and health awareness programs.' },
      { icon: '👩‍💼', title: 'Women Empowerment', desc: 'Skills training, microfinance support, and leadership development programs.' },
      { icon: '🌱', title: 'Environmental Conservation', desc: 'Tree plantation drives, waste management, and environmental awareness campaigns.' },
      { icon: '🏘️', title: 'Community Development', desc: 'Infrastructure development, clean water projects, and sustainable livelihood programs.' },
      { icon: '🍽️', title: 'Food Security', desc: 'Mid-day meals, nutrition supplements, and emergency food distribution during crises.' }
    ];

    return (
      <section id="works" className="py-20 bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            Our Works
            <div className="w-20 h-1 bg-white mx-auto mt-4"></div>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {works.map((work, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl transform hover:scale-105 transition-all duration-300 hover:bg-white/20">
                <div className="text-4xl mb-4 text-center">{work.icon}</div>
                <h3 className="text-xl font-bold mb-3 text-center">{work.title}</h3>
                <p className="text-center opacity-90">{work.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Difference Section
  const DifferenceSection = () => {
    const differences = [
      { icon: '🎯', title: 'Targeted Approach', desc: 'We focus on specific communities and their unique needs rather than generic solutions.' },
      { icon: '🔍', title: 'Transparency', desc: 'Complete transparency in our operations and fund utilization with regular impact reports.' },
      { icon: '🤝', title: 'Community Participation', desc: 'We involve local communities in planning and execution to ensure sustainability.' },
      { icon: '📊', title: 'Data-Driven Impact', desc: 'We measure and track the impact of our programs using scientific methods and metrics.' },
      { icon: '🔄', title: 'Sustainable Solutions', desc: 'Focus on long-term sustainable solutions rather than temporary relief measures.' },
      { icon: '💡', title: 'Innovation', desc: 'We use innovative approaches and technology to maximize our impact and reach.' }
    ];

    return (
      <section id="difference" className="py-20 bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
            What Makes Us Different
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {differences.map((diff, index) => (
              <div key={index} className="bg-white/10 p-6 rounded-2xl text-center transform hover:scale-105 hover:bg-red-500/20 transition-all duration-300">
                <div className="text-4xl mb-4">{diff.icon}</div>
                <h3 className="text-xl font-bold mb-3">{diff.title}</h3>
                <p className="opacity-90">{diff.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Donation Section
  const DonationSection = () => (
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
                onClick={handleDonation}
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

  // Gallery Section
  const GallerySection = () => {
    const galleryItems = ['📚', '🏥', '👩‍🏫', '🌱', '🤝', '🎓', '💊', '🏘️', '🍽️', '👶', '🌍', '💪'];
    
    return (
      <section id="gallery" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-slate-800">
            Gallery
            <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {galleryItems.map((item, index) => (
              <div
                key={index}
                className="aspect-square bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center text-4xl md:text-6xl cursor-pointer transform hover:scale-105 hover:rotate-12 transition-all duration-300 shadow-lg hover:shadow-2xl"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Contact Section
  const ContactSection = () => (
    <section id="contact" className="py-20 bg-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Get In Touch
          <div className="w-20 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto mt-4"></div>
        </h2>
        
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-2xl font-bold mb-6">Contact Information</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center space-x-3">
                <span className="text-red-400">📧</span>
                <span>info@blackrosefoundation.org.in</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400">📞</span>
                <span>+91 9876543210</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400">📍</span>
                <span>123 Foundation Street, Lucknow, UP 226001</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400">🌐</span>
                <span>www.blackrosefoundation.org.in</span>
              </div>
            </div>
            
            <div className="bg-gray-700 rounded-xl p-6 text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-gray-300">Interactive Map</p>
              <p className="text-sm text-gray-400">Lucknow, Uttar Pradesh</p>
            </div>
          </div>
          
          <div>
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:from-red-600 hover:to-red-800 text-white py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );

  // Footer
  const Footer = () => (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🌹</span>
              <span className="text-xl font-bold text-red-500">Black Rose Foundation</span>
            </div>
            <p className="text-gray-400">Empowering communities and transforming lives through sustainable development and social welfare initiatives.</p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-red-400">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'About', 'Works', 'Vision', 'Gallery', 'Contact'].map((link) => (
                <li key={link}>
                  <button
                    onClick={() => scrollToSection(link.toLowerCase())}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-red-400">Follow Us</h4>
            <ul className="space-y-2">
              {['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube'].map((social) => (
                <li key={social}>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    {social}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4 text-red-400">Newsletter</h4>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Your email"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded font-semibold transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400">
            © 2024 Black Rose Foundation. All rights reserved. | Designed with ❤️ for the community
          </p>
        </div>
      </div>
    </footer>
  );

  // Intersection Observer for scroll detection
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3,
      rootMargin: '-100px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    }, observerOptions);

    const sections = document.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <AboutSection />
      <VisionMissionSection />
      <WorksSection />
      <DifferenceSection />
      <DonationSection />
      <GallerySection />
      <ContactSection />
      <Footer />
      
      {/* Modals */}
      <LoginModal />
      <RegisterModal />
      <AdminPanel />
    </div>
  );
};

export default BlackRoseFoundation;