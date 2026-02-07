import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import LoginModal from './components/modals/LoginModal';
import RegisterModal from './components/modals/RegisterModal';
import { useAuth } from './hooks/useAuth';
import { useScrollDetection } from './hooks/useScrollDetection';
import { Toaster } from 'react-hot-toast';
import { LoaderProvider } from './context/LoaderContext';
import Loader from './components/Loader';
import WhatsAppButton from './components/WhatsAppButton';
import DonateStickyButton from './components/DonateStickyButton';

// Lazy loading pages
const HomePage = lazy(() => import('./pages/HomePage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProjectsPage = lazy(() => import('./pages/ProjectsPage'));
const GalleryPage = lazy(() => import('./pages/GalleryPage'));
const NewsletterHistoryPage = lazy(() => import('./pages/NewsletterHistoryPage'));
const CertificatePage = lazy(() => import('./pages/CertificatePage'));
const LegalDocumentsPage = lazy(() => import('./pages/LegalDocumentsPage')); // Legal Docs Page
const BlogPage = lazy(() => import('./pages/BlogPage'));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));

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

      <Suspense fallback={<Loader forceShow={true} text="Loading Page..." type="spinner" />}>
        <Routes>
          <Route path="/" element={
            <HomePage 
              scrollToSection={scrollToSection}
              donationAmount={donationAmount}
              setDonationAmount={setDonationAmount}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
              user={user}
              setShowLogin={setShowLogin}
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
            <ProfilePage user={user} setUser={setUser} authLoading={authLoading} handleLogout={handleLogout} />
          } />
          
          <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/gallery" element={<GalleryPage />} />
                  <Route path="/newsletter-history" element={<NewsletterHistoryPage />} />
                  <Route path="/certificate/:id" element={<CertificatePage />} />
                  <Route path="/invoice/:id" element={<InvoicePage />} />
                  <Route path="/legal" element={<LegalDocumentsPage />} />
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                </Routes>      </Suspense>

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
      <WhatsAppButton />
      <DonateStickyButton scrollToSection={scrollToSection} />
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