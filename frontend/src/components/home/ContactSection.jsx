import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, slideLeft, slideRight, staggerContainer } from '../../animations/variants';

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', phone: '', message: '' });
  };

  return (
    <section
      id="contact"
      className="relative overflow-hidden"
      style={{ padding: '5.5rem 0', background: '#000' }}
    >
      {/* Gold ambient glow top-center */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '70%',
          height: '50%',
          background: 'radial-gradient(ellipse, rgba(255,195,0,0.05) 0%, transparent 65%)',
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.3), transparent)' }} />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12" ref={ref}>
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
              08 — Connect
            </span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cinzel font-bold uppercase mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.05em', color: '#F8F5F0' }}
          >
            Begin Your Journey
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-cormorant italic mx-auto"
            style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.7)', maxWidth: '480px' }}
          >
            Let's create something extraordinary together. Reach out and we'll respond within 24 hours.
          </motion.p>
        </motion.div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

          {/* Form — 3 cols */}
          <motion.div
            variants={slideLeft}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="lg:col-span-3 glass-dark p-8 lg:p-10"
            style={{ border: '1px solid rgba(255,195,0,0.15)' }}
          >
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 text-center"
              >
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ border: '1px solid rgba(255,195,0,0.4)', background: 'rgba(255,195,0,0.08)' }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5">
                    <path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase mb-2" style={{ color: '#F8F5F0' }}>
                  Message Sent
                </h3>
                <p className="font-cormorant italic text-base" style={{ color: 'rgba(248,245,240,0.5)' }}>
                  We'll be in touch shortly.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block font-cinzel text-[0.6rem] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.75)' }}>
                    Full Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    required
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block font-cinzel text-[0.6rem] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.75)' }}>
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+91 00000 00000"
                    required
                    className="input-luxury"
                  />
                </div>
                <div>
                  <label className="block font-cinzel text-[0.6rem] tracking-[0.3em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.75)' }}>
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    placeholder="Tell us about your occasion..."
                    required
                    rows={5}
                    className="input-luxury resize-none"
                  />
                </div>
                <button type="submit" className="btn-gold w-full justify-center mt-2">
                  Send Message
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M1 7h12M7 1l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </form>
            )}
          </motion.div>

          {/* Info + Map — 2 cols */}
          <motion.div
            variants={slideRight}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            className="lg:col-span-2 flex flex-col gap-6"
          >
            {/* Contact info card */}
            <div
              className="glass-dark p-6"
              style={{ border: '1px solid rgba(255,195,0,0.12)' }}
            >
              {[
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: 'Branch 1',
                  value: 'No. 63, Madavaram Red Hills Rd, Kodungaiyur, Chennai — 600060',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: 'Branch 2',
                  value: 'Madurai, Tamil Nadu',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                  label: 'Phone',
                  value: '+91 98405 51365 / +91 97908 82561',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  label: 'Email',
                  value: 'b2shammu@gmail.com',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 py-4"
                  style={{ borderBottom: i < 3 ? '1px solid rgba(255,195,0,0.08)' : 'none' }}
                >
                  <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-cinzel text-[0.6rem] tracking-[0.25em] uppercase mb-1" style={{ color: 'rgba(255,195,0,0.7)' }}>
                      {item.label}
                    </div>
                    <div className="font-cormorant text-base leading-snug" style={{ color: 'rgba(248,245,240,0.85)' }}>
                      {item.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Map embed */}
            <div
              className="overflow-hidden"
              style={{ border: '1px solid rgba(255,195,0,0.12)', aspectRatio: '4/3' }}
            >
              <iframe
                title="B2 Bridal Studio Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.088!2d80.2419!3d13.1283!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5265d5b5e4d5e3%3A0x5a5e!2sKodungaiyur%2C%20Chennai!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85)' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
