import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import ProjectsPage from './pages/ProjectsPage';
import GalleryPage from './pages/GalleryPage';
import NewsletterHistoryPage from './pages/NewsletterHistoryPage';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import { useAuth } from './hooks/useAuth';
import { useScrollDetection } from './hooks/useScrollDetection';
import { Toaster } from 'react-hot-toast';
import { LoaderProvider } from './context/LoaderContext';
import Loader from './components/Loader';

const AppContent = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [donationAmount, setDonationAmount] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Auth states and functions
  const {
    user,
    authLoading,
    showLogin,
    setShowLogin,
    showRegister,
    setShowRegister,
    // showAdmin, // No longer needed as state
    // setShowAdmin, // No longer needed as state
    loginForm,
    setLoginForm,
    registerForm,
    setRegisterForm,
    adminData,
    handleLogin,
    handleRegister,
    handleLogout,
    loadAdminData,
    setUser // Make sure setUser is returned from useAuth
  } = useAuth();

  // Scroll detection
  useScrollDetection(setActiveSection);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);
    
    // If we are not on home page, go there first
    if (window.location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleShowAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-white">
      <Loader />
      {/* Navigation is visible on all pages, but we might want to hide it on Admin page or customize it */}
      <Routes>
        <Route path="/admin" element={null} /> {/* Hide main Nav on Admin page */}
        <Route path="*" element={
          <Navigation 
            activeSection={activeSection}
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            scrollToSection={scrollToSection}
            user={user}
            setShowLogin={setShowLogin}
            setShowRegister={setShowRegister}
            setShowAdmin={handleShowAdmin}
            handleLogout={handleLogout}
          />
        } />
      </Routes>

      <Routes>
        <Route path="/" element={
          <HomePage 
            scrollToSection={scrollToSection}
            donationAmount={donationAmount}
            setDonationAmount={setDonationAmount}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            user={user}
            contactForm={contactForm}
            setContactForm={setContactForm}
            newsletter={newsletter}
            setNewsletter={setNewsletter}
          />
        } />
        
        <Route path="/admin" element={
          <AdminPage 
            user={user} 
            adminData={adminData} 
            loadAdminData={loadAdminData}
            authLoading={authLoading}
          />
        } />
        
        <Route path="/profile" element={
          <ProfilePage user={user} setUser={setUser} authLoading={authLoading} />
        } />
        
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/newsletter-history" element={<NewsletterHistoryPage />} />
      </Routes>

      {/* Modals are available globally (except maybe admin page depending on design, but keeping them here is safe) */}
      <LoginModal 
        showLogin={showLogin}
        setShowLogin={setShowLogin}
        setShowRegister={setShowRegister}
        loginForm={loginForm}
        setLoginForm={setLoginForm}
        handleLogin={handleLogin}
        isLoading={isLoading}
      />
      
      <RegisterModal 
        showRegister={showRegister}
        setShowRegister={setShowRegister}
        setShowLogin={setShowLogin}
        registerForm={registerForm}
        setRegisterForm={setRegisterForm}
        handleRegister={handleRegister}
        isLoading={isLoading}
      />
      <Toaster position="top-center" />
    </div>
  );
};

const BlackRoseFoundation = () => {
  return (
    <Router>
      <LoaderProvider>
        <AppContent />
      </LoaderProvider>
    </Router>
  );
};

export default BlackRoseFoundation;