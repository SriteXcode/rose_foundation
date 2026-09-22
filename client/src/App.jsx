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
import { Sparkles } from 'lucide-react';

// Initialize GA4 with your Measurement ID
const GA_MEASUREMENT_ID = import.meta.env.VITE_GOOGLE_ANALYTICS_ID;
if (GA_MEASUREMENT_ID) {
  // Defer initialization to after the initial page render
  setTimeout(() => {
    ReactGA.initialize(GA_MEASUREMENT_ID);
  }, 3000);
}

// Initialize Meta (Facebook) Pixel with your Pixel ID
const META_PIXEL_ID = import.meta.env.VITE_META_PIXEL_ID;
if (META_PIXEL_ID && META_PIXEL_ID !== 'your_pixel_id_here') {
  (function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () {
      n.callMethod
        ? n.callMethod.apply(n, arguments)
        : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n;
    n.push = n;
    n.loaded = !0;
    n.version = '2.0';
    n.queue = [];
    t = b.createElement(e);
    t.async = !0;
    t.src = v;
    s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  })(
    window,
    document,
    'script',
    'https://connect.facebook.net/en_US/fbevents.js'
  );
  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');

  // Inject dynamic noscript fallback element if not present
  if (typeof document !== 'undefined' && !document.getElementById('meta-pixel-noscript')) {
    const noscript = document.createElement('noscript');
    noscript.id = 'meta-pixel-noscript';
    const img = document.createElement('img');
    img.height = '1';
    img.width = '1';
    img.style.display = 'none';
    img.src = `https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`;
    noscript.appendChild(img);
    document.body.appendChild(noscript);
  }
}

// Analytics tracking component
const AnalyticsTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (GA_MEASUREMENT_ID) {
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
    if (META_PIXEL_ID && META_PIXEL_ID !== 'your_pixel_id_here' && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [location]);

  return null;
};

import { PageSkeleton } from './components/SkeletonLoader';

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
const VolunteerDashboardPage = lazy(() => import('./pages/VolunteerDashboardPage'));
const VolunteerDonationPage = lazy(() => import('./pages/VolunteerDonationPage'));
const WriteFieldStoryPage = lazy(() => import('./pages/WriteFieldStoryPage'));
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
    const params = new URLSearchParams(window.location.search);
    const redirectPath = params.get('redirect');
    if (redirectPath) {
      navigate(redirectPath, { replace: true });
    } else if (location.pathname === '/' && location.state?.scrollTo) {
      const targetId = location.state.scrollTo;
      performScroll(targetId);
    }
  }, [location, navigate]);

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

      <Suspense fallback={<PageSkeleton text="Loading Page..." />}>
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
          <Route path="/volunteer/dashboard" element={<VolunteerDashboardPage />} />
          <Route path="/volunteer/dashboard/:code" element={<VolunteerDashboardPage />} />
          <Route path="/volunteer/story/new" element={<WriteFieldStoryPage />} />
          <Route path="/volunteer/story/edit/:id" element={<WriteFieldStoryPage />} />
          <Route path="/v/:volunteerCode" element={<VolunteerDonationPage />} />
          <Route path="/donate" element={<VolunteerDonationPage />} />
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

      {/* Global Modals & Toast Notifications */}
      <Suspense fallback={null}>
        <CampaignModal scrollToSection={scrollToSection} />
      </Suspense>

      <Toaster position="top-center" />

      {/* Quick Action Floating Menu Toggle */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {isOpen && (
          <div className="flex flex-col items-end gap-2.5 mb-2 animate-fadeIn">
            {/* Active Campaigns Modal Trigger */}
            <button
              onClick={() => {
                setIsOpen(false);
                window.dispatchEvent(new CustomEvent('openCampaignModal'));
              }}
              className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-4 py-2.5 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center gap-2.5 text-xs font-bold tracking-wide border border-zinc-700/50 dark:border-zinc-300/50 cursor-pointer"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                <Sparkles className="w-3 h-3 fill-amber-500 text-amber-500 animate-pulse" />
              </div>
              <span>Active Campaigns</span>
            </button>
            <DonateStickyButton scrollToSection={scrollToSection} />
            <WhatsAppButton />
          </div>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle Quick Actions"
          className="w-11 h-11 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-xl border border-zinc-700/50 dark:border-zinc-300/50 flex items-center justify-center font-bold text-lg hover:scale-105 transition-all cursor-pointer z-50"
        >
          {isOpen ? '✕' : '💬'}
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
