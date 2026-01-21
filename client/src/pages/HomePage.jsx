import React, { Suspense } from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import VisionMissionSection from '../components/VisionMissionSection';
import DifferenceSection from '../components/DifferenceSection';
import DonationSection from '../components/DonationSection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

// Lazy loaded components
const TeamSection = React.lazy(() => import('../components/TeamSection'));
const WorksSection = React.lazy(() => import('../components/WorksSection'));
const GallerySection = React.lazy(() => import('../components/GallerySection'));

const SectionLoader = () => (
  <div className="py-20 flex items-center justify-center bg-gray-50">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-8 w-64 bg-gray-200 rounded mb-4"></div>
      <div className="h-64 w-full max-w-4xl bg-gray-200 rounded"></div>
    </div>
  </div>
);

const HomePage = ({
  scrollToSection,
  donationAmount,
  setDonationAmount,
  isLoading,
  setIsLoading,
  user,
  contactForm,
  setContactForm,
  newsletter,
  setNewsletter
}) => {
  return (
    <>
      <HeroSection scrollToSection={scrollToSection} />
      <AboutSection />
      <VisionMissionSection />
      
      <Suspense fallback={<SectionLoader />}>
        <TeamSection limit={10} />
      </Suspense>

      <Suspense fallback={<SectionLoader />}>
        <WorksSection limit={6} />
      </Suspense>

      <DifferenceSection />
      
      <DonationSection 
        donationAmount={donationAmount}
        setDonationAmount={setDonationAmount}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        user={user}
      />
      
      <Suspense fallback={<SectionLoader />}>
        <GallerySection limit={8} />
      </Suspense>
      
      <ContactSection 
        contactForm={contactForm}
        setContactForm={setContactForm}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
      
      <Footer 
        scrollToSection={scrollToSection}
        newsletter={newsletter}
        setNewsletter={setNewsletter}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
      />
    </>
  );
};

export default HomePage;