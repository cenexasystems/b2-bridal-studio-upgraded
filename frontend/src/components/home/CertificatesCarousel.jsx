import React, { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/variants';

const certificates = [
  { id: 1, title: 'Aari Embroidery', issuer: 'Skill Certification', year: '2020', image: '/images/cert2.jpeg' },
  { id: 2, title: 'Bakery Training', issuer: 'Culinary Institute', year: '2021', image: '/images/cert5.jpeg' },
  { id: 3, title: 'Classic Haircut Seminar', issuer: 'Hair Academy', year: '2021', image: '/images/cert9.jpeg' },
  { id: 4, title: 'Advanced Beautician', issuer: 'Beauty Institute', year: '2022', image: '/images/cert1.jpeg' },
  { id: 5, title: 'Vaishnavi Jain Certification', issuer: 'Professional Training', year: '2022', image: '/images/cert3.jpeg' },
  { id: 6, title: 'Homemade Chocolate Making', issuer: 'Food Craft Academy', year: '2023', image: '/images/cert6.jpeg' },
  { id: 7, title: 'Palm Leaf Fancy Articles', issuer: 'Handicraft Board', year: '2023', image: '/images/cert10.jpeg' },
  { id: 8, title: 'Fruits & Vegetable Processing', issuer: 'Agro Institute', year: '2023', image: '/images/cert4.jpeg' },
  { id: 9, title: 'Imitation Jewelry', issuer: 'Design Institute', year: '2024', image: '/images/cert7.jpeg' },
  { id: 10, title: 'Digital Marketing', issuer: 'Online Academy', year: '2024', image: '/images/cert8.jpeg' },
];

const allCerts = [...certificates, ...certificates];

const CertCard = ({ cert, onClick }) => (
  <div
    onClick={() => onClick(cert)}
    className="flex-shrink-0 glass-gold flex flex-col justify-between group cursor-pointer transition-all duration-500"
    style={{
      width: '280px',
      height: '420px', // 🔥 increased height for vertical layout
      border: '1px solid rgba(255,195,0,0.18)',
      overflow: 'hidden',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(255,195,0,0.5)';
      e.currentTarget.style.transform = 'translateY(-6px)';
      e.currentTarget.style.boxShadow = '0 20px 60px rgba(255,195,0,0.15)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,195,0,0.18)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = 'none';
    }}
  >
    {/* 🔥 FULL IMAGE (TOP - BIG) */}
    <div style={{ width: '100%', height: '260px', overflow: 'hidden' }}>
      <img
        src={cert.image}
        alt={cert.title}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
        }}
      />
    </div>

    {/* EXISTING TEXT (UNCHANGED STYLE) */}
    <div className="p-6 flex flex-col justify-between flex-1">
      <div>
        <div
          className="font-cormorant font-semibold leading-snug mb-2"
          style={{ fontSize: '1rem', color: '#F8F5F0' }}
        >
          {cert.title}
        </div>

        <div
          className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase font-bold"
          style={{ color: '#FFD700' }}
        >
          {cert.issuer}
        </div>
      </div>

      <div className="mt-3 flex justify-between items-end">
        <div className="gold-divider-left" style={{ width: '30px' }} />
        <div
          className="font-cinzel text-[0.75rem] tracking-[0.2em] font-bold"
          style={{ color: '#FFD700' }}
        >
          {cert.year}
        </div>
      </div>
    </div>
  </div>
);

const CertificatesCarousel = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [selectedCert, setSelectedCert] = useState(null);

  return (
    <section
      id="certificates"
      className="relative overflow-hidden"
      style={{
        padding: '5.5rem 0',
        background: 'linear-gradient(180deg, #000 0%, #0a0800 50%, #000 100%)',
      }}
    >
      {/* Header */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 mb-14" ref={ref}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
              02 — Recognition
            </span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-cinzel font-bold uppercase mb-4"
            style={{
              fontSize: 'clamp(1.8rem, 4vw, 3rem)',
              color: '#F8F5F0',
            }}
          >
            Awards & Certifications
          </motion.h2>
        </motion.div>
      </div>

      {/* Carousel */}
      <div className="overflow-hidden">
        <div className="infinite-scroll-track flex gap-6" style={{ width: 'max-content' }}>
          {allCerts.map((cert, i) => (
            <CertCard key={`${cert.id}-${i}`} cert={cert} onClick={setSelectedCert} />
          ))}
        </div>
      </div>

      {/* 🔥 MODAL */}
      <AnimatePresence>
        {selectedCert && (
          <motion.div
            onClick={() => setSelectedCert(null)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.9)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 999,
            }}
          >
            <motion.img
              src={selectedCert.image}
              alt={selectedCert.title}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              transition={{ duration: 0.4 }}
              style={{
                maxHeight: '90vh',
                maxWidth: '90vw',
                objectFit: 'contain',
                border: '2px solid rgba(255,195,0,0.5)',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default CertificatesCarousel;