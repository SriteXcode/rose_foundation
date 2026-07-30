import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { CLOUDINARY_LOGO_URL } from '../utils/constants';
import localLogo from '../assets/logo.webp';
import { Sun, Moon, Menu, X, Heart, User, LogOut, Shield } from 'lucide-react';

const Navigation = ({ 
  activeSection, 
  isMenuOpen, 
  setIsMenuOpen, 
  scrollToSection, 
  user, 
  setShowLogin, 
  setShowRegister, 
  setShowAdmin, 
  handleLogout 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isBlogActive = location.pathname.startsWith('/blog');
  const isHomePage = location.pathname === '/';

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'works', label: 'Our Work' },
    { id: 'team', label: 'Team' },
    { id: 'difference', label: 'Why Us' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  const logoSrc = getOptimizedImageUrl(CLOUDINARY_LOGO_URL, { width: 120 }) || localLogo;

  return (
    <nav className="fixed top-0 w-full bg-white/90 dark:bg-zinc-950/90 backdrop-blur-md z-50 transition-all duration-300 border-b border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-sm">
              <img 
                src={logoSrc} 
                alt="Blackrose Foundation Logo" 
                className="h-6 w-6 sm:h-7 sm:w-7 invert dark:invert-0" 
                onError={(e) => {
                  if (e.target.src !== localLogo) {
                    e.target.src = localLogo;
                  }
                }}
              />
            </div>
            <span className="text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              Blackrose
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const isSectionActive = isHomePage && activeSection === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-sm font-medium transition-colors cursor-pointer relative py-1 ${
                    isSectionActive 
                      ? 'text-zinc-900 dark:text-white font-semibold' 
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  }`}
                >
                  {item.label}
                  {isSectionActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-white rounded-full"></span>
                  )}
                </button>
              );
            })}
            <button
              onClick={() => {
                navigate('/campaigns');
                setIsMenuOpen(false);
              }}
              className={`text-sm font-medium transition-colors cursor-pointer relative py-1 ${
                location.pathname.startsWith('/campaigns')
                  ? 'text-zinc-900 dark:text-white font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Campaigns
              {location.pathname.startsWith('/campaigns') && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-white rounded-full"></span>
              )}
            </button>
            <button
              onClick={() => {
                navigate('/blog');
                setIsMenuOpen(false);
              }}
              className={`text-sm font-medium transition-colors cursor-pointer relative py-1 ${
                isBlogActive
                  ? 'text-zinc-900 dark:text-white font-semibold' 
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Blog
              {isBlogActive && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zinc-900 dark:bg-white rounded-full"></span>
              )}
            </button>
          </div>

          {/* Right Action Items */}
          <div className="hidden lg:flex items-center space-x-4">
            {/* Auth / Donate Button */}
            {user ? (
              <div className="flex items-center space-x-3">
                {user.role === 'admin' && (
                  <button
                    onClick={() => setShowAdmin(true)}
                    className="flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50 px-3.5 py-1.5 rounded-full text-xs font-semibold hover:bg-blue-100 transition-all cursor-pointer"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin
                  </button>
                )}
                <button 
                  onClick={handleProfileClick}
                  className="flex items-center gap-1.5 bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white px-4 py-2 rounded-full text-xs font-semibold hover:bg-gray-200 dark:hover:bg-zinc-700 transition-all cursor-pointer border border-gray-200 dark:border-zinc-700"
                >
                  <User className="w-3.5 h-3.5" />
                  {user.name.split(' ')[0]}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowLogin(true)}
                  className="text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => scrollToSection('donate')}
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white px-5 py-2 rounded-full text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Donate</span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center space-x-2">
            <button
              className="p-2 text-zinc-900 dark:text-white cursor-pointer"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-100 dark:border-zinc-800 animate-fadeIn">
            <div className="flex flex-col space-y-3 px-2">
              {navigationItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`text-left text-sm py-2 px-3 rounded-lg font-medium transition-colors ${
                    activeSection === item.id 
                      ? 'bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white font-semibold' 
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => {
                  navigate('/campaigns');
                  setIsMenuOpen(false);
                }}
                className="text-left text-sm py-2 px-3 rounded-lg font-medium text-zinc-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
              >
                Campaigns
              </button>
              <button
                onClick={() => {
                  navigate('/blog');
                  setIsMenuOpen(false);
                }}
                className="text-left text-sm py-2 px-3 rounded-lg font-medium text-zinc-600 dark:text-zinc-300 hover:bg-gray-50 dark:hover:bg-zinc-900"
              >
                Blog
              </button>
            </div>

            {/* Mobile Auth Buttons */}
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-zinc-800 px-2 space-y-2">
              {user ? (
                <>
                  <button
                    onClick={handleProfileClick}
                    className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white py-2.5 rounded-xl font-semibold text-sm"
                  >
                    <User className="w-4 h-4" />
                    My Profile ({user.name})
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        setShowAdmin(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-xl font-semibold text-sm"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </button>
                  )}
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowLogin(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-white py-2.5 rounded-xl font-semibold text-sm"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => {
                      setShowRegister(true);
                      setIsMenuOpen(false);
                    }}
                    className="w-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 py-2.5 rounded-xl font-semibold text-sm"
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
};

export default Navigation;