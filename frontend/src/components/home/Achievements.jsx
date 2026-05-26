import React, { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { staggerContainer, fadeUp } from '../../animations/variants';

const stats = [
  { value: 1200, suffix: '+', label: 'Students Trained', prefix: '' },
  { value: 3500, suffix: '+', label: 'Classes Completed', prefix: '' },
  { value: 92, suffix: '%', label: 'Satisfaction Score', prefix: '' },
  { value: 100200, suffix: '+', label: 'Student Community', prefix: '' },
];

const formatNumber = (num) => {
  if (num >= 1000) {
    const thousands = num / 1000;
    return thousands % 1 === 0 ? `${thousands}K` : `${thousands.toFixed(1)}K`;
  }
  return num.toString();
};

const CountUp = ({ target, suffix, isActive }) => {
  const [count, setCount] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!isActive) return;
    const duration = 2000;
    const start = performance.now();

    const step = (timestamp) => {
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafRef.current);
  }, [isActive, target]);

  return (
    <span>
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

const Achievements = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-15%' });

  return (
    <section
      id="achievements"
      className="relative overflow-hidden"
      style={{ padding: '5.5rem 0' }}
    >
      {/* Gold radiant background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #000 0%, #0d0a00 40%, #0a0800 60%, #000 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(255,195,0,0.07) 0%, transparent 60%)',
        }}
      />

      {/* Top border */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.35), transparent)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.35), transparent)' }} />

      <div className="relative max-w-[1300px] mx-auto px-6 lg:px-12" ref={ref}>
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
              05 — Legacy
            </span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cinzel font-bold uppercase"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.05em', color: '#F8F5F0' }}
          >
            Our Achievements
          </motion.h2>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-px" style={{ border: '1px solid rgba(255,195,0,0.1)' }}>
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center justify-center text-center group"
              style={{
                padding: '3.5rem 2rem',
                background: 'rgba(0,0,0,0.6)',
                borderRight: i < 3 ? '1px solid rgba(255,195,0,0.1)' : 'none',
                transition: 'background 0.4s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,195,0,0.04)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.6)'; }}
            >
              {/* Counter number */}
              <div
                className="font-cinzel font-bold mb-2 leading-none"
                style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                  background: 'linear-gradient(135deg, #FFE566 0%, #FFD700 50%, #e6a800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  textShadow: 'none',
                  filter: isInView ? 'drop-shadow(0 0 20px rgba(255,195,0,0.4))' : 'none',
                  transition: 'filter 0.3s ease',
                }}
              >
                <CountUp target={stat.value} suffix={stat.suffix} isActive={isInView} />
              </div>

              {/* Divider */}
              <div className="w-8 h-px my-3 group-hover:w-12 transition-all duration-500" style={{ background: 'rgba(255,195,0,0.4)' }} />

              {/* Label */}
              <div
                className="font-cormorant italic"
                style={{ fontSize: '1.05rem', color: 'rgba(248,245,240,0.92)', letterSpacing: '0.03em' }}
              >
                {stat.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Achievements;
