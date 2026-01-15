import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import { handleNewsletterSubmit } from '../utils/apiHandlers';

const Footer = ({ scrollToSection, newsletter, setNewsletter, isLoading, setIsLoading }) => {
  const onNewsletterSubmit = (e) => handleNewsletterSubmit(e, newsletter, setNewsletter, setIsLoading);

  const quickLinks = ['Home', 'About', 'Works', 'Vision', 'Gallery', 'Contact'];
  const socialLinks = ['Facebook', 'Twitter', 'Instagram', 'LinkedIn', 'YouTube'];

  return (
    <footer className="bg-black text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img src={logo} alt="Black Rose Foundation Logo" className="h-20 w-20 invert" />
              <span className="text-xl font-bold text-red-500">BlackRose Foundation</span>
            </div>
            <p className="text-gray-400">
              Empowering communities and transforming lives through sustainable development and social welfare initiatives.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 col-span-1 md:col-span-2">
            <div>
              <h4 className="text-lg font-semibold mb-4 text-red-400">Quick Links</h4>
              <ul className="space-y-2">
                {quickLinks.map((link) => (
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
                {socialLinks.map((social) => (
                  <li key={social}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors">
                      {social}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4 text-red-400">Newsletter</h4>
            <form onSubmit={onNewsletterSubmit} className="space-y-3">
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
            <div className="mt-3 text-sm">
               <Link to="/newsletter-history" className="text-gray-400 hover:text-red-400 underline decoration-dotted transition-colors">
                 View Past Issues
               </Link>
            </div>
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
};

export default Footer;