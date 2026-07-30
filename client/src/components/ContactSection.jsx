import React from 'react';
import { handleContactSubmit } from '../utils/apiHandlers';
import { MapPin, Mail, Phone, Send } from 'lucide-react';

const ContactSection = ({ contactForm, setContactForm, isLoading, setIsLoading }) => {
  const onSubmit = (e) => handleContactSubmit(e, contactForm, setContactForm, setIsLoading);

  return (
    <section id="contact" className="py-4 md:py-6 bg-white dark:bg-zinc-900/50 transition-colors border-t border-gray-100 dark:border-zinc-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column Contact Details matching Screen 1 */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5 block">
              Contact
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white mb-3 tracking-tight">
              Get in touch
            </h2>
            <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base leading-relaxed mb-6 max-w-md">
              Have a question or want to collaborate? We'd love to hear from you. Reach out and our team will respond shortly.
            </p>

            {/* Info Items */}
            <div className="space-y-5 mb-6">
              
              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Visit us
                  </h3>
                  <a 
                    href="https://maps.google.com/maps/place//data=!4m2!3m1!1s0x399c4195602a6f0d:0x92304ffba0a77df7?entry=s&sa=X&ved=2ahUKEwjf7cLXuoaSAxVDslYBHUVAEEEQ4kB6BAgWEAA&hl=en"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:underline mt-0.5 block"
                  >
                    Lal Bangla Jk puri Kanpur 208010, India
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Email us
                  </h3>
                  <a 
                    href="mailto:blackrosefoundation111@gmail.com"
                    className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:underline mt-0.5 block"
                  >
                    blackrosefoundation111@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Call us
                  </h3>
                  <a 
                    href="tel:+916394107475"
                    className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-white hover:underline mt-0.5 block"
                  >
                    +91 63941 07475 / +91 93052 71187
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column Form Card matching Screen 1 */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-2xl p-6 sm:p-7 shadow-md text-left">
              <form onSubmit={onSubmit} className="space-y-4">
                
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Your name
                  </label>
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Email address
                  </label>
                  <input
                    type="email"
                    placeholder="jane@email.com"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 block">
                    Message
                  </label>
                  <textarea
                    placeholder="How can we help?"
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-xs font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white placeholder-zinc-400 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 text-white py-3.5 rounded-full font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
                >
                  <span>{isLoading ? 'Sending...' : 'Send Message'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>

              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactSection;