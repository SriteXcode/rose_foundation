import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../utils/constants';
import toast from 'react-hot-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [adminData, setAdminData] = useState({
    donations: [],
    contacts: [],
    newsletters: [],
    stats: {
      totalDonations: 0,
      totalContacts: 0,
      totalNewsletters: 0,
      totalAmount: 0
    },
    isLoaded: false
  });
  const [authLoading, setAuthLoading] = useState(true);

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

  // Handle login
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }

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
        toast.success('Login successful!');

        // If admin, load admin data
        if (data.user.role === 'admin') {
          loadAdminData();
        }
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(`Error: ${error.message}`);
    }
  };

  // Handle registration
  const handleRegister = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!registerForm.name || !registerForm.email || !registerForm.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerForm.name,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Registration successful! Please login.");
        setShowRegister(false);
        setShowLogin(true);
        setRegisterForm({ name: "", email: "", password: "", confirmPassword: "", phone: "" });
      } else {
        throw new Error(data.error || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      toast.error(`Error: ${err.message}`);
    }
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setShowAdmin(false);
    toast.success('Logged out successfully');
  };

  // Load admin data
  const loadAdminData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData({ ...data, isLoaded: true });
      }
    } catch (error) {
      console.error('Admin data error:', error);
    }
  };

  // Load user on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    testBackendConnection();
    setAuthLoading(false);
  }, []);

  return {
    user,
    authLoading,
    showLogin,
    setShowLogin,
    showRegister,
    setShowRegister,
    showAdmin,
    setShowAdmin,
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    adminData,
    handleLogin,
    handleRegister,
    handleLogout,
    loadAdminData,
    setUser
  };
};