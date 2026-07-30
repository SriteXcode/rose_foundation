import React, { useState, Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import Navigation from './components/Navigation';
import { useAuth } from './hooks/useAuth';
import { useScrollDetection } from './hooks/useScrollDetection';
import { Toaster } from 'react-hot-toast';
import { LoaderProvider } from './context/LoaderContext';
import Loader from './components/Loader';
import WhatsAppButton from './components/WhatsAppButton';
import DonateStickyButton from './components/DonateStickyButton';

// Initialize GA4 with your Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
if (GA_MEASUREMENT_ID) {
  // Defer initialization to after the initial page render
  setTimeout(() => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }, 3000);
}

// Analytics tracking component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [location]);

  return null;
};

// Lazy loading components
const LoginModal = lazy(() => import('./components/modals/LoginModal'));
const RegisterModal = lazy(() => import('./components/modals/RegisterModal'));
const CampaignModal = lazy(() => import('./components/modals/CampaignModal'));

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
const CampaignsPage = lazy(() => import('./pages/CampaignsPage'));
const InvoicePage = lazy(() => import('./pages/InvoicePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const AppContent = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
  const [donationAmount, setDonationAmount] = useState('');
  const [newsletter, setNewsletter] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Auth states and functions
  const {
    user,
    authLoading,
    showLogin,
    setShowLogin,
    showRegister,
    setShowRegister,
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
  } = useAuth();

  // Scroll detection
  useScrollDetection(setActiveSection);

  const location = useLocation();

  const performScroll = (sectionId) => {
    let attempts = 0;
    const maxAttempts = 20;
    const interval = setInterval(() => {
      attempts++;
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        clearInterval(interval);
      } else if (attempts >= maxAttempts) {
        clearInterval(interval);
      }
    }, 100);
  };

  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      performScroll(targetId);
    }
  }, [location]);

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    setIsMenuOpen(false);

    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      performScroll(sectionId);
    }
  };

  const handleShowAdmin = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-white">
      <Loader />
      <Suspense fallback={null}>
        <CampaignModal scrollToSection={scrollToSection} />
      </Suspense>
      <Routes>
        <Route path="/admin" element={null} />
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
          <Route path="/campaigns" element={<CampaignsPage scrollToSection={scrollToSection} />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:slug" element={<BlogPostPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>

      <Suspense fallback={null}>
        {showLogin && (
          <LoginModal
            showLogin={showLogin}
            setShowLogin={setShowLogin}
            setShowRegister={setShowRegister}
            loginForm={loginForm}
            setLoginForm={setLoginForm}
            handleLogin={handleLogin}
            isLoading={isLoading}
          />
        )}

        {showRegister && (
          <RegisterModal
            showRegister={showRegister}
            setShowRegister={setShowRegister}
            setShowLogin={setShowLogin}
            registerForm={registerForm}
            setRegisterForm={setRegisterForm}
            handleRegister={handleRegister}
            isLoading={isLoading}
          />
        )}
      </Suspense>

      {/* <WhatsAppButton />
      <DonateStickyButton scrollToSection={scrollToSection} />
      <Toaster position="top-center" /> */}


      <div className="fixed bottom-6 right-22 z-50 flex flex-col items-end gap-3">
        {isOpen && (
          <>
            <WhatsAppButton />
            <CampaignModal scrollToSection={scrollToSection} />
            <DonateStickyButton scrollToSection={scrollToSection} />
          </>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 w-12 rounded-full bg-rose-600 text-white shadow-lg flex items-center justify-center z-200"
        >
          {isOpen ? "x" : "+"}
        </button>
      </div>
    </div>
  );
};

const BlackRoseFoundation = () => {
  return (
    <Router>
      <AnalyticsTracker />
      <LoaderProvider>
        <AppContent />
      </LoaderProvider>
    </Router>
  );
};

export default BlackRoseFoundation;
