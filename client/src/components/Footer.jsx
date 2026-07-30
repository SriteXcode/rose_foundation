import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/imageUtils';
import { CLOUDINARY_LOGO_URL } from '../utils/constants';
import localLogo from '../assets/logo.webp';
import { handleNewsletterSubmit } from '../utils/apiHandlers';
import { ArrowRight } from 'lucide-react';

const socialLinks = [
  { 
    name: 'Facebook', 
    url: 'https://www.facebook.com/share/1A3FWfGZU5',
    svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  },
  { 
    name: 'Twitter', 
    url: 'https://x.com/blackrosefound',
    svg: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  },
  { 
    name: 'Instagram', 
    url: 'https://www.instagram.com/blackrosefoundation_?igsh=anNpZzZrNWZubjBt',
    svg: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></g>
  },
  { 
    name: 'LinkedIn', 
    url: 'https://www.linkedin.com/company/blackrose-foundation',
    svg: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></g>
  }
];

const Footer = ({ scrollToSection, newsletter, setNewsletter, isLoading, setIsLoading }) => {
  const onNewsletterSubmit = (e) => handleNewsletterSubmit(e, newsletter, setNewsletter, setIsLoading);

  const logoSrc = getOptimizedImageUrl(CLOUDINARY_LOGO_URL, { width: 120 }) || localLogo;

  return (
    <footer className="bg-white dark:bg-zinc-950 border-t-2 border-b-2 border-gray-100 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 pt-16 pb-4 sm:py-20 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 pb-4 border-b border-gray-100 dark:border-zinc-800">
          
          {/* Col 1: Brand Info */}
          <div className="lg:col-span-4 flex flex-col items-start text-left">
            <div className="flex items-center space-x-3 mb-4 cursor-pointer" onClick={() => scrollToSection('home')}>
              <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center">
                <img 
                  src={logoSrc} 
                  alt="Blackrose Logo" 
                  className="h-5 w-5 invert dark:invert-0" 
                  onError={(e) => {
                    if (e.target.src !== localLogo) e.target.src = localLogo;
                  }}
                />
              </div>
              <span className="text-base font-bold text-zinc-900 dark:text-white">
                Blackrose
              </span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-6 max-w-sm">
              Empowering communities to create a better tomorrow for everyone through education, relief and sustainable support programs.
            </p>
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    {social.svg}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Foundation Links */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              Foundation
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => scrollToSection('about')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  About Us
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('team')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Our Team
                </button>
              </li>
              <li>
                <Link to="/blog" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Blog & Stories
                </Link>
              </li>
              <li>
                <Link to="/legal" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Reports & Legal Docs
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Get Involved Links */}
          <div className="lg:col-span-2 text-left">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              Get Involved
            </h4>
            <ul className="space-y-2.5 text-xs font-medium">
              <li>
                <button onClick={() => scrollToSection('donate')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Donate
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('contact')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Volunteer
                </button>
              </li>
              <li>
                <button onClick={() => scrollToSection('works')} className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Partnerships
                </button>
              </li>
              <li>
                <Link to="/newsletter-history" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
                  Newsletter Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Newsletter */}
          <div className="lg:col-span-4 text-left">
            <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-2">
              Newsletter
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Stay updated on our latest impact and stories.
            </p>
            <form onSubmit={onNewsletterSubmit} className="relative flex items-center bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-full p-1 pl-4">
              <input
                type="email"
                placeholder="Your email"
                value={newsletter}
                onChange={(e) => setNewsletter(e.target.value)}
                className="w-full bg-transparent text-xs font-medium text-zinc-900 dark:text-white focus:outline-none placeholder-zinc-400 pr-2"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                aria-label="Subscribe"
                className="w-8 h-8 rounded-full bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Bar matching Screen 1 */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} Blackrose Foundation. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/legal" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Privacy Policy</Link>
            <Link to="/legal" className="hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
