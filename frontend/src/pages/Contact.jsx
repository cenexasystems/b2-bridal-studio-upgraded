import React, { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer, slideLeft, slideRight } from '../animations/variants';

const WHATSAPP_NUMBER = '919361527951';

const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = (e) => {
    e.preventDefault();
    const text = `Hello B2 Bridal Studio!%0A%0A*Name:* ${encodeURIComponent(form.name)}%0A*Email:* ${encodeURIComponent(form.email)}%0A*Phone:* ${encodeURIComponent(form.phone)}%0A*Message:* ${encodeURIComponent(form.message)}`;
    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    window.open(whatsappUrl, '_blank');
    setSent(true);
    setTimeout(() => setSent(false), 4000);
    setForm({ name: '', email: '', phone: '', message: '' });
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.7rem] tracking-[0.4em] uppercase font-semibold" style={{ color: '#FFD700' }}>Connect</span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Get in Touch
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-4" style={{ fontSize: '1.35rem', color: 'rgba(248,245,240,0.92)' }}>
            We'd love to hear from you. Reach out and we'll respond within 24 hours.
          </motion.p>
        </motion.div>
      </div>

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-16" ref={ref}>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Form — 3 cols */}
          <motion.div variants={slideLeft} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="lg:col-span-3 glass-dark p-8 lg:p-10 rounded-sm" style={{ border: '1px solid rgba(255,195,0,0.15)' }}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ border: '1px solid rgba(255,195,0,0.4)', background: 'rgba(255,195,0,0.08)' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="font-cinzel text-sm tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#F8F5F0' }}>Redirected to WhatsApp</h3>
                <p className="font-cormorant italic" style={{ color: 'rgba(248,245,240,0.88)' }}>Complete your message on WhatsApp.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-cinzel text-[0.75rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Full Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Your name" required className="input-luxury rounded-sm" />
                  </div>
                  <div>
                    <label className="block font-cinzel text-[0.75rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required className="input-luxury rounded-sm" />
                  </div>
                </div>
                <div>
                  <label className="block font-cinzel text-[0.75rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Phone</label>
                  <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="00000 00000" required className="input-luxury rounded-sm" />
                </div>
                <div>
                  <label className="block font-cinzel text-[0.75rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Message</label>
                  <textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us about your occasion..." required rows={5} className="input-luxury rounded-sm resize-none" />
                </div>
                <button type="submit" className="btn-gold w-full justify-center mt-2">
                  Send Message
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M1 7h12M7 1l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </button>
              </form>
            )}
          </motion.div>

          {/* Info — 2 cols */}
          <motion.div variants={slideRight} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="lg:col-span-2 flex flex-col gap-6">
            {/* Contact cards */}
            <div className="glass-dark p-6 rounded-sm" style={{ border: '1px solid rgba(255,195,0,0.12)' }}>
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Branch 1', value: 'No. 63, Madavaram Red Hills Rd, Moolakaadai, Chennai — 600060', href: 'https://www.google.com/maps/dir/?api=1&destination=13.1283,80.2410' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, label: 'Branch 2', value: 'C6, Santhi Sadan Enclave, Melakkal Main Road, Kochadai, Madurai – 625016', href: 'https://www.google.com/maps/dir/?api=1&destination=9.9252,78.0747' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, label: 'Phone', value: (
                  <span className="flex flex-col sm:flex-row sm:flex-wrap items-start sm:items-center gap-1 sm:gap-2" style={{ fontFamily: '"Times New Roman", Times, serif' }}>
                    <span>9361527951</span>
                    <span className="hidden sm:inline opacity-40">/</span>
                    <span>9962838303</span>
                    <span className="hidden sm:inline opacity-40">/</span>
                    <span>9790882561</span>
                  </span>
                ) },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, label: 'Email', value: 'b2bridalstudio02@gmail.com' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 py-4" style={{ borderBottom: i < 3 ? '1px solid rgba(255,195,0,0.08)' : 'none' }}>
                  <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <div className="font-cinzel text-[0.75rem] tracking-[0.2em] uppercase mb-1 font-bold" style={{ color: '#FFD700' }}>{item.label}</div>
                    {item.href ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-cormorant text-lg leading-snug transition-colors duration-200 hover:text-[#FFD700]"
                        style={{ color: 'rgba(248,245,240,0.9)', textDecoration: 'none' }}
                      >
                        {item.value}
                      </a>
                    ) : (
                      <div className="font-cormorant text-lg leading-snug" style={{ color: 'rgba(248,245,240,0.9)' }}>{item.value}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div className="glass-dark p-6 rounded-sm" style={{ border: '1px solid rgba(255,195,0,0.12)' }}>
              <h3 className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase mb-4 font-semibold" style={{ color: 'rgba(255,195,0,0.85)' }}>Follow Us</h3>
              <div className="flex gap-3">
                {[
                  { href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
                  { href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
                  { href: '#', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.43z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"/></svg> },
                ].map((social, i) => (
                  <a key={i} href={social.href} className="w-10 h-10 flex items-center justify-center rounded-full transition-all duration-300" style={{ border: '1px solid rgba(255,195,0,0.2)', color: 'rgba(248,245,240,0.75)' }} onMouseEnter={e => { e.currentTarget.style.borderColor = '#FFD700'; e.currentTarget.style.color = '#FFD700'; e.currentTarget.style.background = 'rgba(255,195,0,0.08)'; }} onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,195,0,0.2)'; e.currentTarget.style.color = 'rgba(248,245,240,0.75)'; e.currentTarget.style.background = 'transparent'; }}>
                    {social.icon}
                  </a>
                ))}
              </div>
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
            className="overflow-hidden rounded-sm"
            style={{ border: '1px solid rgba(255,195,0,0.12)' }}
          >
            <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(255,195,0,0.08)' }}>
              <h4 className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-semibold" style={{ color: '#FFD700' }}>Chennai Branch</h4>
            </div>
            <iframe title="B2 Bridal Studio Chennai" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=No+63+Madavaram+Red+Hills+Rd+Kodungaiyur+Chennai+600060&zoom=16" width="100%" height="250" style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.85)' }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            <div className="px-4 py-3" style={{ borderTop: '1px solid rgba(255,195,0,0.08)' }}>
              <a href="https://www.google.com/maps/dir/?api=1&destination=13.1283,80.2410&destination_place_id=" target="_blank" rel="noreferrer" className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase font-semibold flex items-center gap-2 transition-colors duration-200" style={{ color: '#FFD700' }} onMouseEnter={e => e.currentTarget.style.color = '#FFED8A'} onMouseLeave={e => e.currentTarget.style.color = '#FFD700'}>
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
            className="overflow-hidden rounded-sm"
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
    </div>
  );
};

export default Contact;
