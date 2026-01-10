import React from 'react';
import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import VisionMissionSection from '../components/VisionMissionSection';
import WorksSection from '../components/WorksSection';
import DifferenceSection from '../components/DifferenceSection';
import DonationSection from '../components/DonationSection';
import GallerySection from '../components/GallerySection';
import ContactSection from '../components/ContactSection';
import Footer from '../components/Footer';

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
      <WorksSection limit={6} />
      <DifferenceSection />
      
      <DonationSection 
        donationAmount={donationAmount}
        setDonationAmount={setDonationAmount}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        user={user}
      />
      
      <GallerySection limit={8} />
      
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