import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Preloader from '../components/home/Preloader';
import Hero from '../components/home/Hero';
import OwnerSpotlight from '../components/home/OwnerSpotlight';
import CertificatesCarousel from '../components/home/CertificatesCarousel';
import CoursesGrid from '../components/home/CoursesGrid';
import WhyChooseUs from '../components/home/WhyChooseUs';
import Achievements from '../components/home/Achievements';
import GalleryShowcase from '../components/home/GalleryShowcase';
import Testimonials from '../components/home/Testimonials';
import VideoWallSection from '../components/home/VideoWallSection';

import ContactSection from '../components/home/ContactSection';

const Home = () => {
  const [loading, setLoading] = useState(true);

  // Prevent scroll during preloader
  useEffect(() => {
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [loading]);

  return (
    <>
      {/* Preloader */}
      <AnimatePresence>
        {loading && (
          <Preloader onComplete={() => setLoading(false)} />
        )}
      </AnimatePresence>

      {/* Main content — hidden until preloader done */}
      <main
        style={{
          opacity: loading ? 0 : 1,
          transition: 'opacity 0.5s ease',
          background: '#000',
        }}
      >
        <Hero />
        <OwnerSpotlight />
        <CertificatesCarousel />
        <CoursesGrid />
        <WhyChooseUs />
        <Achievements />
        <GalleryShowcase />
        <Testimonials />
        <VideoWallSection />

        <ContactSection />
      </main>
    </>
  );
};

export default Home;
