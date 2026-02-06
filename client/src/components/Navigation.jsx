import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from "../assets/logo.png";

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
  const navigationItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'works', label: 'Works' },
    { id: 'vision', label: 'Vision' },
    { id: 'difference', label: 'Why Us' },
    { id: 'donate', label: 'Donate' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleProfileClick = () => {
    navigate('/profile');
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/')}>
            <img src={logo} alt="Blackrose Foundation Logo" className="h-15 w-15 invert" />
            <span className="text-xl font-bold text-red-500">Blackrose Foundation</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
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
            <button
                onClick={() => navigate('/blog')}
                className="text-white hover:text-red-400 transition-colors relative group"
              >
                Blog
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-500 group-hover:w-full transition-all duration-300"></span>
            </button>
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
                <button 
                  onClick={handleProfileClick}
                  className="text-white hover:text-red-400 transition-colors font-semibold"
                >
                  Welcome, {user.name.split(' ')[0]}
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

          {/* Mobile menu button */}
          <button
            className="md:hidden text-white text-2xl"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="block w-full text-left text-white hover:text-red-400 py-2 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button
                onClick={() => {
                  navigate('/blog');
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left text-white hover:text-red-400 py-2 transition-colors"
              >
                Blog
            </button>

            {/* Mobile auth buttons */}
            <div className="mt-4 pt-4 border-t border-gray-700">
              {user ? (
                <div className="space-y-2">
                  <button
                    onClick={handleProfileClick}
                    className="block w-full text-left text-white hover:text-red-400 py-2 transition-colors font-semibold"
                  >
                    My Profile ({user.name})
                  </button>
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
};

export default Navigation;