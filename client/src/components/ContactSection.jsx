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
                <span>blackrosefoundation111@gmail.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400">📞</span>
                <span>+91 6394107475, +91 93052 71187</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400">📍</span>
                <a 
                  href="https://maps.google.com/maps/place//data=!4m2!3m1!1s0x399c4195602a6f0d:0x92304ffba0a77df7?entry=s&sa=X&ved=2ahUKEwjf7cLXuoaSAxVDslYBHUVAEEEQ4kB6BAgWEAA&hl=en" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-red-400 transition-colors"
                >
                  Lal Bangla Jk puri Kanpur 208010
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-red-400">🌐</span>
                <span>www.blackrosefoundation.org.in</span>
              </div>
            </div>

            <div className="bg-gray-700 rounded-xl overflow-hidden h-[300px] shadow-lg border border-gray-600">
              <iframe
                title="Blackrose Foundation Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3572.170192345062!2d80.40228727453472!3d26.450493079815415!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399c4195602a6f0d%3A0x92304ffba0a77df7!2sBlack%20Rose%20Foundation!5e0!3m2!1sen!2sin!4v1736952000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="opacity-80 hover:opacity-100 transition-all duration-500"
              ></iframe>
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