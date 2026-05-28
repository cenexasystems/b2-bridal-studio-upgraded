import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router-dom';

const Hero = () => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start']
  });

  const yText = useTransform(scrollYProgress, [0, 1], [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouse = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouse);
    return () => window.removeEventListener('mousemove', handleMouse);
  }, []);

  const lines = ['Where Beauty', 'Becomes', 'Timeless.'];

  const sparkles = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 4 + 1.5,
    dur: Math.random() * 8 + 6,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.5 + 0.3,
  }));

  return (
    <section
      ref={ref}
      className="hero-section"
      style={{
        minHeight: '100vh',
        background: '#0B0B0D',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}
    >

      {/* Ambient Glow */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '50%',
        height: '70%',
        background: 'radial-gradient(ellipse, rgba(255,195,0,0.14) 0%, transparent 70%)'
      }} />

      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '-8%',
        width: '40%',
        height: '50%',
        background: 'radial-gradient(ellipse, rgba(255,220,80,0.09) 0%, transparent 70%)'
      }} />

      {/* Sparkles */}
      {sparkles.map(s => (
        <div key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`,
          top: `${s.y}%`,
          width: s.size,
          height: s.size,
          borderRadius: '50%',
          background: `rgba(255,195,0,${s.opacity})`,
          animation: `particle-float ${s.dur}s ease-in-out ${s.delay}s infinite`,
          boxShadow: `0 0 ${s.size * 4}px rgba(255,195,0,0.7)`
        }} />
      ))}

      {/* Content */}
      <div
        className="hero-inner-container"
        style={{
          maxWidth: 1360,
          margin: '0 auto',
          padding: '70px 40px 40px',
          width: '100%',
          position: 'relative',
          zIndex: 5
        }}>

        <motion.div
          className="hero-content-wrap"
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 60,
            alignItems: 'center',
            y: yText,
            opacity
          }}
        >

          {/* LEFT */}
          <div>

            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}
            >
              <div style={{ height: 1, width: 40, background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
              <span style={{
                fontFamily: "'Poppins'",
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.45em',
                textTransform: 'uppercase',
                color: '#FFD700'
              }}>
                Est. 2018 · Premium Bridal Studio
              </span>
            </motion.div>

            {/* TYPEWRITER HEADING */}
            {lines.map((line, i) => (
              <motion.h1
                key={i}
                className="typewriter"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{
                  duration: 1.6,
                  delay: 0.5 + i * 1.6,
                  ease: 'easeInOut'
                }}
                style={{
                  fontFamily: "'Great Vibes', cursive",
                  fontWeight: 400,
                  fontSize: 'clamp(3rem, 6vw, 5.5rem)',
                  lineHeight: 1.15,
                  letterSpacing: '0.03em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  borderRight: '2px solid rgba(255,195,0,0.8)',
                  marginBottom: 6,
                  color: i === 1 ? 'transparent' : '#F5EFE6',
                  background: i === 1
                    ? 'linear-gradient(135deg, #FFD700, #FFE566, #FFC300)'
                    : 'none',
                  WebkitBackgroundClip: i === 1 ? 'text' : 'unset',
                  backgroundClip: i === 1 ? 'text' : 'unset',
                }}
              >
                {line}
              </motion.h1>
            ))}

            {/* Tagline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.5 }}
              style={{
                fontFamily: "'Cormorant Garamond'",
                fontStyle: 'italic',
                fontSize: '1.2rem',
                color: 'rgba(245,239,230,0.85)',
                marginTop: 20,
                marginBottom: 40,
                maxWidth: 420
              }}
            >
              Chennai & Madurai's most trusted bridal makeup studio and professional beauty academy.
            </motion.p>

            {/* Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 5.8 }}
              className="hero-btn-group"
              style={{ display: 'flex', gap: 16 }}
            >
              <Link to="/services" className="btn-gold">Book Appointment</Link>
              <Link to="/courses" className="btn-outline-gold">Explore Courses</Link>
            </motion.div>

          </div>

          {/* RIGHT IMAGE */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1 }}
            style={{ position: 'relative' }}
          >

            <div
              style={{
                borderRadius: '32% 68% 26% 74%',
                overflow: 'hidden',
                position: 'relative',

                width: '100%',
                maxWidth: '420px',          // 👈 controls overall size
                aspectRatio: '4 / 5',       // 👈 keeps perfect proportion

                boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
                transition: 'transform 0.4s ease'
              }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  pointerEvents: 'none', // behaves like GIF (no controls interaction)
                  filter: 'brightness(0.9) contrast(1.08) saturate(1.05)'
                }}
              >
                <source src="/bridal.mp4" type="video/mp4" />
              </video>

              <div style={{
                position: 'absolute',
                inset: 0,
                background: `
                  linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.75)),
                  linear-gradient(180deg, rgba(255,195,0,0.05), rgba(255,195,0,0.15))
                `
              }} />
            </div>

          </motion.div>

        </motion.div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes blinkCursor {
          0%, 50%, 100% { border-color: rgba(255,195,0,0.8); }
          25%, 75% { border-color: transparent; }
        }

        .typewriter {
          animation: blinkCursor 1s infinite;
        }

        @media (max-width: 768px) {
          .hero-content-wrap {
            grid-template-columns: 1fr !important;
            gap: 40px !important;
          }
        }
      `}</style>

    </section>
  );
};

export default Hero;