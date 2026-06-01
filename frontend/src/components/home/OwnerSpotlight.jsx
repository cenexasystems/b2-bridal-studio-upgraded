import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { fadeUp, slideLeft, slideRight, staggerContainer } from '../../animations/variants';

const OwnerSpotlight = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section
      id="owner"
      className="relative overflow-hidden"
      style={{
        background: '#000',
        padding: '4rem 0',
      }}
    >
      {/* Background ambient */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          right: '-10%',
          width: '50%',
          height: '80%',
          background: 'radial-gradient(ellipse, rgba(255,195,0,0.04) 0%, transparent 70%)',
        }}
      />

      {/* Editorial side number */}
      <div
        className="absolute left-6 top-1/2 -translate-y-1/2 -rotate-90 font-cinzel text-[0.6rem] tracking-[0.4em] uppercase hidden xl:block"
        style={{ color: 'rgba(255,195,0,0.2)' }}
      >
        Artist
      </div>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Left — Image */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="relative"
          >
            {/* Gold frame */}
            <div
              className="absolute pointer-events-none"
              style={{
                inset: '-1px',
                background: 'linear-gradient(135deg, rgba(255,195,0,0.4) 0%, transparent 50%, rgba(255,195,0,0.2) 100%)',
                zIndex: 0,
              }}
            />

            <div className="relative overflow-hidden w-full max-w-[360px] mx-auto" style={{ aspectRatio: '3/4', zIndex: 1 }}>
              <motion.img
                src="/images/about3.jpg"
                alt="Studio Owner — Bridal Makeup Artist"
                className="w-full h-full object-cover"
                style={{ filter: 'brightness(0.9) contrast(1.05)' }}
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              />
              {/* Overlay */}
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                }}
              />
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="absolute -bottom-6 -right-6 glass-gold px-6 py-4 owner-floating-badge"
              style={{ border: '1px solid rgba(255,195,0,0.3)' }}
            >
              <div className="font-cinzel text-[0.6rem] tracking-[0.3em] uppercase" style={{ color: '#FFD700' }}>
                Experience
              </div>
              <div className="font-playfair text-3xl font-bold text-white mt-1">8+</div>
              <div className="font-cormorant text-sm italic" style={{ color: 'rgba(248,245,240,0.88)' }}>
                Years of Artistry
              </div>
            </motion.div>

            {/* Gold corner accents */}
            {[
              { top: 0, left: 0 },
              { top: 0, right: 0 },
              { bottom: 0, left: 0 },
              { bottom: 0, right: 0 },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-6 h-6 pointer-events-none"
                style={{
                  ...pos,
                  borderTop: (pos.top === 0) ? '1px solid #FFD700' : 'none',
                  borderBottom: (pos.bottom === 0) ? '1px solid #FFD700' : 'none',
                  borderLeft: (pos.left === 0) ? '1px solid #FFD700' : 'none',
                  borderRight: (pos.right === 0) ? '1px solid #FFD700' : 'none',
                }}
              />
            ))}
          </motion.div>

          {/* Right — Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="flex flex-col"
          >
            {/* Pre-label */}
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
              <div className="gold-divider-left" />
              <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
                Meet the Artist
              </span>
            </motion.div>

            {/* Name */}
            <motion.h2
              variants={fadeUp}
              className="font-signature mb-3 leading-tight"
              style={{
                fontSize: 'clamp(3rem, 5vw, 4.5rem)',
                background: 'linear-gradient(135deg, #FFE566, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Shanmugavadivu Sabarinathan
            </motion.h2>

            {/* Title */}
            <motion.div variants={fadeUp} className="font-cinzel text-xs tracking-[0.3em] uppercase mb-8" style={{ color: 'rgba(248,245,240,0.92)' }}>
              Founder & Master Bridal Artist
            </motion.div>

            {/* Gold divider */}
            <motion.div variants={fadeUp} className="gold-divider-left mb-8" />

            {/* Bio */}
            <motion.p
              variants={fadeUp}
              className="font-cormorant leading-relaxed tracking-[0.01em] text-[1.1rem] lg:text-[1.2rem] text-ivory/95 lg:text-ivory/95 mb-6 lg:mb-6"
            >
              With over 8 years of transformative artistry, Shanmugavadivu Sabarinathan has redefined bridal beauty across Chennai and Madurai. Her work blends classical Indian traditions with contemporary luxury — creating looks that live in memory long after the last guest leaves.
            </motion.p>

            <motion.p
              variants={fadeUp}
              className="font-cormorant leading-relaxed tracking-[0.01em] text-[1.1rem] lg:text-[1.2rem] text-ivory/95 lg:text-ivory/95 mb-6 lg:mb-10"
            >
              Trained under award-winning masters and certified across international beauty academies, she brings world-class expertise to every bride she serves.
            </motion.p>

            {/* Credentials row */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 mb-10">
              {[
                { label: 'Brides Served', value: '500+' },
                { label: 'Certifications', value: '12+' },
                { label: 'Students Trained', value: '1.2K+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div
                    className="font-cinzel text-xl font-bold"
                    style={{
                      background: 'linear-gradient(135deg, #FFE566, #FFD700)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {stat.value}
                  </div>
                  <div className="font-cormorant text-xs tracking-wider italic mt-1" style={{ color: 'rgba(248,245,240,0.88)' }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Link to="/about" className="btn-outline-gold inline-flex">
                Read Full Story
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="ml-2">
                  <path d="M1 7h12M7 1l6 6-6 6" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default OwnerSpotlight;
