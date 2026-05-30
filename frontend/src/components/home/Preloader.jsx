import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Preloader = ({ onComplete }) => {
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onComplete();
    }, 2800);
    return () => clearTimeout(timerRef.current);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        key="preloader"
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ background: '#000' }}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
      >
        {/* Gold shimmer lines */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute left-0 right-0 h-px"
              style={{
                top: `${30 + i * 20}%`,
                background: `linear-gradient(90deg, transparent, rgba(255,195,0,${0.1 + i * 0.05}), transparent)`,
              }}
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: [0.76, 0, 0.24, 1] }}
            />
          ))}
        </div>

        <div className="relative flex flex-col items-center gap-6">
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                border: '1px solid rgba(255,195,0,0.5)',
                boxShadow: '0 0 40px rgba(255,195,0,0.35), inset 0 0 20px rgba(255,195,0,0.12)',
                background: 'rgba(0,0,0,0.3)',
              }}
            >
              <img
                src="/b2-logo-transparent.svg"
                alt="B2 Bridal Studio"
                style={{ width: 60, height: 60, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(255,195,0,0.6))' }}
              />
            </div>
            {/* Rotating ring */}
            <motion.div
              className="absolute inset-[-6px] rounded-full"
              style={{ border: '1px solid rgba(255,195,0,0.3)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, ease: 'linear', repeat: Infinity }}
            />
          </motion.div>

          {/* Studio name */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            <div
              className="font-cinzel text-sm tracking-[0.4em] uppercase mb-2 font-bold"
              style={{ color: '#FFFFFF' }}
            >
              Est. 2018
            </div>
            <div
              className="font-cinzel text-lg tracking-[0.3em] uppercase"
              style={{
                background: 'linear-gradient(135deg, #FFE566, #FFD700, #FFD700)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              B2 Bridal Studio
            </div>
          </motion.div>

          {/* Loading bar */}
          <motion.div
            className="relative h-px overflow-hidden"
            style={{ width: '160px', background: 'rgba(255,195,0,0.1)' }}
          >
            <motion.div
              className="absolute inset-y-0 left-0"
              style={{
                background: 'linear-gradient(90deg, transparent, #FFD700, #FFE566)',
              }}
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 2.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            />
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Preloader;
