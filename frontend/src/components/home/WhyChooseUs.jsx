import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/variants';

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="14" cy="14" r="12"/>
        <path d="M9 14l3.5 3.5L19 10"/>
      </svg>
    ),
    title: 'Certified Excellence',
    description: 'Internationally certified artists trained under world-class masters with a decade of proven expertise.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3l2.5 8h8.5l-7 5 2.5 8L14 19l-6.5 5 2.5-8-7-5h8.5z"/>
      </svg>
    ),
    title: 'Luxury Experience',
    description: 'Every session is a curated, personalised ritual — premium products, bespoke looks, and flawless results.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 4C8.5 4 4 8.5 4 14s4.5 10 10 10 10-4.5 10-10S19.5 4 14 4z"/>
        <path d="M14 10v5l3 3"/>
      </svg>
    ),
    title: 'Timeless Artistry',
    description: 'Classic techniques blended with modern innovation — your beauty stands the test of time, photographs, and memory.',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3H5a2 2 0 00-2 2v16a2 2 0 002 2h18a2 2 0 002-2V11l-7-8z"/>
        <path d="M12 3v8h9"/>
      </svg>
    ),
    title: 'Certified Training',
    description: 'Government-recognised certification for every student — launching careers in luxury beauty and bridal artistry.',
  },
];

const WhyChooseUs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      id="why-us"
      className="relative overflow-hidden"
      style={{
        padding: '6rem 0',
        background: 'linear-gradient(180deg, #000 0%, #080600 50%, #000 100%)',
      }}
    >
      {/* Horizontal lines */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />

      {/* Gold ambient center glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60%',
          height: '60%',
          background: 'radial-gradient(ellipse, rgba(255,195,0,0.04) 0%, transparent 65%)',
        }}
      />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12" ref={ref}>
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-20"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
              04 — Excellence
            </span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>

          <motion.h2
            variants={fadeUp}
            className="font-cinzel font-bold uppercase mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.05em', color: '#F8F5F0' }}
          >
            Why Choose B2
          </motion.h2>

          <motion.p
            variants={fadeUp}
            className="font-cormorant italic mx-auto"
            style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.92)', maxWidth: '500px' }}
          >
            Beyond beauty — a commitment to craft, care, and transformation.
          </motion.p>
        </motion.div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col text-center items-center group"
              style={{ padding: '2.5rem 2rem' }}
            >
              {/* Icon ring */}
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                style={{
                  border: '1px solid rgba(255,195,0,0.25)',
                  background: 'rgba(255,195,0,0.04)',
                  boxShadow: '0 0 0 0 rgba(255,195,0,0)',
                  transition: 'all 0.4s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.boxShadow = '0 0 25px rgba(255,195,0,0.3)';
                  e.currentTarget.style.borderColor = 'rgba(255,195,0,0.5)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = '0 0 0 0 rgba(255,195,0,0)';
                  e.currentTarget.style.borderColor = 'rgba(255,195,0,0.25)';
                }}
              >
                {feature.icon}
              </div>

              {/* Title */}
              <h3
                className="font-cinzel text-sm font-semibold uppercase tracking-[0.1em] mb-4"
                style={{ color: '#F8F5F0', letterSpacing: '0.12em' }}
              >
                {feature.title}
              </h3>

              {/* Animated gold underline */}
              <div className="w-0 group-hover:w-8 transition-all duration-500 h-px mb-4" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />

              {/* Description */}
              <p
                className="font-cormorant leading-relaxed"
                style={{ fontSize: '1.05rem', color: 'rgba(248,245,240,0.92)' }}
              >
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
