import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, slideLeft, slideRight, staggerContainer } from '../../animations/variants';

const WHATSAPP_NUMBER = '919361527951';

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [form, setForm] = useState({ name: '', phone: '', message: '' });
  const [phoneError, setPhoneError] = useState('');
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, ''); // digits only
    setForm({ ...form, phone: val });
    setPhoneError('');
  };

  const validatePhone = () => {
    const digits = form.phone.replace(/\D/g, '');
    if (digits.length < 10) {
      setPhoneError('Phone number must be at least 10 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validatePhone()) return;
    const text = `Hello B2 Bridal Studio!%0A%0A*Name:* ${encodeURIComponent(form.name)}%0A*Phone:* ${encodeURIComponent(form.phone)}%0A*Message:* ${encodeURIComponent(form.message)}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(whatsappUrl, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', phone: '', message: '' });
    setPhoneError('');
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
            <span className="font-cinzel text-[0.7rem] tracking-[0.4em] uppercase font-semibold" style={{ color: '#FFD700' }}>
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
            style={{ fontSize: '1.2rem', color: 'rgba(248,245,240,0.92)', maxWidth: '480px' }}
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
                <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#F8F5F0' }}>
                  Redirected to WhatsApp
                </h3>
                <p className="font-cormorant italic text-base" style={{ color: 'rgba(248,245,240,0.88)' }}>
                  Complete your message on WhatsApp.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div>
                  <label className="block font-cinzel text-[0.75rem] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>
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
                  <label className="block font-cinzel text-[0.75rem] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>
                    Phone Number
                  </label>
                  <input
                    id="contact-phone"
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handlePhoneChange}
                    placeholder="Mobile number"
                    required
                    className="input-luxury w-full"
                    maxLength={15}
                  />
                  {phoneError && (
                    <p className="mt-1.5 font-cormorant text-xs" style={{ color: '#f87171' }}>{phoneError}</p>
                  )}
                </div>
                <div>
                  <label className="block font-cinzel text-[0.75rem] tracking-[0.3em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>
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

          {/* Info — 2 cols */}
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
                  value: 'Navins White berry appartment, 63, Madavaram Red Hills Rd, opp. Chennai, Moolakadai, Kodungaiyur, Chennai — 600060',
                  href: 'https://maps.app.goo.gl/DqUT6wPtsamb7LQW8',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                  label: 'Branch 2',
                  value: 'C6, Santhi Sadan Enclave, Melakkal Main Road, Kochadai, Madurai – 625016',
                  href: 'https://www.google.com/maps/dir/?api=1&destination=9.9252,78.0747',
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>,
                  label: 'Phone',
                  value: (
                    <span className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1 sm:gap-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                      <span>9361527951</span>
                      <span className="hidden sm:inline opacity-40">/</span>
                      <span>9962838303</span>
                      <span className="hidden sm:inline opacity-40">/</span>
                      <span>9790882561</span>
                    </span>
                  ),
                },
                {
                  icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                  label: 'Email',
                  value: 'b2bridalstudio02@gmail.com',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex gap-4 py-4"
                  style={{ borderBottom: i < 3 ? '1px solid rgba(255,195,0,0.08)' : 'none' }}
                >
                  <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-cinzel text-[0.75rem] tracking-[0.25em] uppercase mb-1 font-bold" style={{ color: '#FFD700' }}>
                      {item.label}
                    </div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="leading-snug transition-colors duration-200 hover:text-[#FFD700]"
                        style={{
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          color: 'rgba(248,245,240,0.9)',
                          textDecoration: 'none'
                        }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div
                        className="leading-snug"
                        style={{
                          fontFamily: '"Times New Roman", Times, serif',
                          fontSize: '17px',
                          color: 'rgba(248,245,240,0.9)'
                        }}
                      >
                        {item.value}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Dual Branch Maps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
          {/* Chennai Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="overflow-hidden relative"
            style={{ border: '1px solid rgba(255,195,0,0.12)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,195,0,0.08)' }}>
              <h4 className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-semibold" style={{ color: '#FFD700' }}>Chennai Branch</h4>
            </div>
            <iframe title="B2 Bridal Studio Chennai" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.3444053495447!2d80.23771557579483!3d13.13143528719875!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a52656707b1662b%3A0xa18e1f23d8b79682!2sB2%20Bridal%20Studio!5e0!3m2!1sen!2sin!4v1717283624890!5m2!1sen!2sin" width="100%" height="250" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85)' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,195,0,0.08)' }}>
              <a href="https://maps.app.goo.gl/DqUT6wPtsamb7LQW8" target="_blank" rel="noreferrer" className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-semibold flex items-center gap-2 transition-colors duration-200" style={{ color: '#FFD700' }} onMouseEnter={e => e.currentTarget.style.color = '#FFED8A'} onMouseLeave={e => e.currentTarget.style.color = '#FFD700'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Get Directions
              </a>
            </div>
          </motion.div>

          {/* Madurai Map */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="overflow-hidden"
            style={{ border: '1px solid rgba(255,195,0,0.12)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,195,0,0.08)' }}>
              <h4 className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-semibold" style={{ color: '#FFD700' }}>Madurai Branch</h4>
            </div>
            <iframe title="B2 Bridal Studio Madurai" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=C6+Santhi+Sadan+Enclave+Melakkal+Main+Road+Kochadai+Madurai+625016&zoom=16" width="100%" height="250" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85)' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,195,0,0.08)' }}>
              <a href="https://www.google.com/maps/dir/?api=1&destination=9.9252,78.0747" target="_blank" rel="noreferrer" className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-semibold flex items-center gap-2 transition-colors duration-200" style={{ color: '#FFD700' }} onMouseEnter={e => e.currentTarget.style.color = '#FFED8A'} onMouseLeave={e => e.currentTarget.style.color = '#FFD700'}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Get Directions
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
