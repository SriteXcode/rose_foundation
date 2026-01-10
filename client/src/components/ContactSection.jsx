import React from 'react';
import { handleContactSubmit } from '../utils/apiHandlers';

const ContactSection = ({ contactForm, setContactForm, isLoading, setIsLoading }) => {
  const onSubmit = (e) => handleContactSubmit(e, contactForm, setContactForm, setIsLoading);

  return (
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
            <form onSubmit={onSubmit} className="space-y-6">
              <div>
                <input
                  type="text"
                  placeholder="Your Name"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <input
                  type="email"
                  placeholder="Your Email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required
                />
              </div>
              <div>
                <textarea
                  placeholder="Your Message"
                  rows={5}
                  value={contactForm.message}
                  onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
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
};

export default ContactSection;