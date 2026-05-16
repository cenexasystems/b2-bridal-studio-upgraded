import React, { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer, slideLeft, slideRight, blurIn } from '../animations/variants';

/* ─── Counter Hook ──────────────────────────────────────── */
const useCountUp = (target, isInView, duration = 2000) => {
  const [count, setCount] = useState(0);
  const started = useRef(false);
  useEffect(() => {
    if (!isInView || started.current) return;
    started.current = true;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, target, duration]);
  return count;
};

/* ─── Stat Counter Card ─────────────────────────────────── */
const StatCard = ({ value, suffix, label, isInView }) => {
  const count = useCountUp(value, isInView);
  return (
    <div className="text-center p-6">
      <div className="font-cinzel font-bold text-gold-gradient" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)' }}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="gold-divider mx-auto my-3" style={{ width: '30px' }} />
      <div className="font-cormorant italic text-sm" style={{ color: 'rgba(248,245,240,0.7)' }}>{label}</div>
    </div>
  );
};

/* ─── Timeline Data ─────────────────────────────────────── */
const TIMELINE = [
  { year: '2018', title: 'The Beginning', desc: 'B2 Bridal Studio was founded with a vision to empower women through beauty and artistry.' },
  { year: '2019', title: 'Academy Launch', desc: 'Launched professional certification programs in makeup artistry and fashion design.' },
  { year: '2021', title: 'Expansion', desc: 'Expanded to a second branch in Madurai, reaching more aspiring beauty professionals.' },
  { year: '2023', title: 'National Recognition', desc: 'Received national-level recognition with 20+ professional certifications and awards.' },
  { year: '2024', title: 'Today', desc: 'A community of 100K+ alumni, 50+ courses, and a leading name in South Indian bridal artistry.' },
];

/* ─── Team Data ─────────────────────────────────────────── */
const TEAM = [
  { name: 'Shammugapriya', role: 'Founder & Master Beautician', image: 'https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?auto=format&fit=crop&w=400&q=80' },
  { name: 'Priya Devi', role: 'Lead Fashion Designer', image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kavitha R', role: 'Embroidery Expert', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80' },
];

const About = () => {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);
  const teamRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-10%' });
  const statsInView = useInView(statsRef, { once: true, margin: '-10%' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-5%' });
  const teamInView = useInView(teamRef, { once: true, margin: '-10%' });

  return (
    <div style={{ background: '#000' }}>

      {/* ═══ SECTION 1 — INTRO HERO ═══ */}
      <section className="relative overflow-hidden" style={{ padding: '10rem 0 6rem' }} ref={heroRef}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.06), transparent 60%)' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate={heroInView ? 'visible' : 'hidden'} className="max-w-[1200px] mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Image */}
          <motion.div variants={slideLeft} className="relative">
            <div className="img-zoom-container rounded-sm" style={{ border: '1px solid rgba(255,195,0,0.15)' }}>
              <img
                src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=700&q=80"
                alt="About B2 Bridal Studio"
                className="w-full aspect-[4/5] object-cover"
                loading="lazy"
              />
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-6 -right-4 lg:-right-8 glass-dark px-6 py-4 text-center" style={{ border: '1px solid rgba(255,195,0,0.2)' }}>
              <div className="font-cinzel font-bold text-lg" style={{ color: '#FFD700' }}>15+</div>
              <div className="font-cormorant italic text-xs" style={{ color: 'rgba(248,245,240,0.5)' }}>Years of Excellence</div>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div variants={slideRight}>
            <div className="flex items-center gap-3 mb-4">
              <div className="gold-divider-left" />
              <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>About Our Studio</span>
            </div>
            <h1 className="font-cinzel font-bold uppercase leading-tight mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F8F5F0', letterSpacing: '0.03em' }}>
              About B2 Bridal Studio
            </h1>
            <p className="font-cormorant italic text-lg mb-4" style={{ color: 'rgba(255,195,0,0.7)' }}>
              A legacy of beauty, artistry, and transformation
            </p>
            <p className="font-inter text-sm leading-relaxed mb-4" style={{ color: 'rgba(248,245,240,0.75)' }}>
              Shanmugavadivu Sabarinathan is a professional makeup artist, creative entrepreneur, and certified trainer with 20+ certifications. She is recognized for expertise in bridal makeup artistry and skill-based education.
            </p>
            <p className="font-inter text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.65)' }}>
              As the founder of B2 Bridal Studio, she has built a legacy of empowering women through beauty and craftsmanship, training thousands of aspiring professionals across Tamil Nadu.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ═══ SECTION 2 — VISION ═══ */}
      <section className="relative" style={{ padding: '6rem 0' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9 }} className="max-w-3xl mx-auto px-6 text-center">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Our Vision</span>
          <h2 className="font-playfair italic text-2xl md:text-3xl mt-4 leading-relaxed" style={{ color: '#F8F5F0' }}>
            "Crafting Beauty One Story at a Time"
          </h2>
          <div className="gold-divider my-6" />
          <p className="font-cormorant text-lg leading-relaxed" style={{ color: 'rgba(248,245,240,0.72)' }}>
            B2 Bridal Studio was born from a belief that every woman deserves to feel extraordinary — and every aspiring professional deserves world-class training. We blend tradition with modern artistry to create experiences that transform lives.
          </p>
        </motion.div>
      </section>

      {/* ═══ SECTION 3 — HIGHLIGHTS / STATS ═══ */}
      <section className="relative" style={{ padding: '5rem 0' }} ref={statsRef}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <div className="max-w-[1100px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: 100, suffix: 'K+', label: 'Alumni Community' },
              { value: 50, suffix: '+', label: 'Courses Offered' },
              { value: 20, suffix: '+', label: 'Certifications' },
              { value: 15, suffix: '+', label: 'Years Experience' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.12, duration: 0.6 }}
                className="card-luxury rounded-sm"
              >
                <StatCard {...stat} isInView={statsInView} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — JOURNEY TIMELINE ═══ */}
      <section className="relative" style={{ padding: '6rem 0' }} ref={timelineRef}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <motion.div initial="hidden" animate={timelineInView ? 'visible' : 'hidden'} variants={staggerContainer} className="max-w-3xl mx-auto px-6 text-center mb-12">
          <motion.span variants={fadeUp} className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Our Journey</motion.span>
          <motion.h2 variants={fadeUp} className="font-cinzel font-bold uppercase mt-3" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#F8F5F0', letterSpacing: '0.04em' }}>
            The Story So Far
          </motion.h2>
        </motion.div>

        <div className="relative max-w-4xl mx-auto px-6">
          <div className="timeline-line" />
          {TIMELINE.map((item, i) => (
            <motion.div
              key={item.year}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-5%' }}
              transition={{ duration: 0.7, delay: i * 0.1 }}
              className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
            >
              {/* Dot */}
              <div className="absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full z-10 hidden md:block" style={{ background: '#FFD700', boxShadow: '0 0 12px rgba(255,195,0,0.5)', top: '8px' }} />
              <div className="md:hidden absolute left-6 w-3 h-3 rounded-full z-10" style={{ background: '#FFD700', boxShadow: '0 0 12px rgba(255,195,0,0.5)', top: '8px' }} />

              {/* Content */}
              <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'} pl-12 md:pl-0`}>
                <span className="font-cinzel text-xs tracking-[0.2em]" style={{ color: '#FFD700' }}>{item.year}</span>
                <h3 className="font-playfair text-lg mt-1 mb-2" style={{ color: '#F8F5F0' }}>{item.title}</h3>
                <p className="font-cormorant text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.68)' }}>{item.desc}</p>
              </div>
              <div className="flex-1 hidden md:block" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 5 — TEAM ═══ */}
      <section className="relative" style={{ padding: '6rem 0' }} ref={teamRef}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate={teamInView ? 'visible' : 'hidden'} className="text-center mb-12">
          <motion.span variants={fadeUp} className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Our Experts</motion.span>
          <motion.h2 variants={fadeUp} className="font-cinzel font-bold uppercase mt-3" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#F8F5F0', letterSpacing: '0.04em' }}>
            Meet the Team
          </motion.h2>
        </motion.div>

        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-luxury rounded-sm group text-center"
            >
              <div className="img-zoom-container" style={{ height: '300px' }}>
                <img src={member.image} alt={member.name} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-5">
                <h3 className="font-playfair text-lg mb-1 group-hover:text-gold-500 transition-colors" style={{ color: '#F8F5F0' }}>{member.name}</h3>
                <p className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,195,0,0.6)' }}>{member.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 5.5 — FEATURED INSIGHTS (BLOG) ═══ */}
      <section className="relative" style={{ padding: '6rem 0' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <div className="text-center mb-12">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>From the Studio</span>
          <h2 className="font-cinzel font-bold uppercase mt-3" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#F8F5F0', letterSpacing: '0.04em' }}>
            Featured Insights
          </h2>
        </div>
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: '10 Bridal Makeup Looks Dominating 2024 Weddings', date: 'April 2024', image: 'https://images.unsplash.com/photo-1457972729786-0411a3b2b626?auto=format&fit=crop&w=600&q=80', excerpt: 'From dewy skin finishes to bold jewel-toned eyes — discover which looks are defining the modern Indian bride.' },
            { title: 'How to Build a Luxury Bridal Makeup Career', date: 'March 2024', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80', excerpt: 'Our master trainers share the exact roadmap — from certification to premium clientele.' },
            { title: 'The Pre-Bridal Skin Care Ritual', date: 'February 2024', image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=600&q=80', excerpt: 'The complete countdown for flawless skin on your wedding day.' },
          ].map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-luxury rounded-sm group"
            >
              <div className="img-zoom-container" style={{ height: '180px' }}>
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
              </div>
              <div className="p-5">
                <span className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,195,0,0.65)' }}>{post.date}</span>
                <h3 className="font-playfair text-base mt-2 mb-2 leading-tight" style={{ color: '#F8F5F0' }}>{post.title}</h3>
                <div className="gold-divider-left mb-3" />
                <p className="font-cormorant text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.68)' }}>{post.excerpt}</p>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6 — BRANCHES ═══ */}
      <section className="relative" style={{ padding: '6rem 0 8rem' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <div className="text-center mb-12">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Locations</span>
          <h2 className="font-cinzel font-bold uppercase mt-3" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#F8F5F0', letterSpacing: '0.04em' }}>
            Our Branches
          </h2>
        </div>

        <div className="max-w-[1000px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { name: 'Chennai Branch', address: 'No: 63, Madavaram Red Hills Rd, Kodungaiyur, Chennai — 600060', phone: '+91 98405 51365', mapUrl: 'https://maps.google.com/?q=Kodungaiyur+Chennai' },
            { name: 'Madurai Branch', address: 'Madurai, Tamil Nadu', phone: '+91 97908 82561', mapUrl: 'https://maps.google.com/?q=Madurai+Tamil+Nadu' },
          ].map((branch, i) => (
            <motion.div
              key={branch.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-dark p-8 rounded-sm"
              style={{ border: '1px solid rgba(255,195,0,0.15)' }}
            >
              <h3 className="font-cinzel text-sm tracking-[0.15em] uppercase mb-4" style={{ color: '#FFD700' }}>{branch.name}</h3>
              <div className="flex flex-col gap-3 mb-6">
                <div className="flex items-start gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5" className="mt-0.5 flex-shrink-0"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="font-cormorant text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.6)' }}>{branch.address}</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5" className="flex-shrink-0"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.11 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                  <span className="font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.6)' }}>{branch.phone}</span>
                </div>
              </div>
              <a
                href={branch.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-outline-gold text-[0.6rem] py-2 px-4 inline-flex items-center gap-2"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Get Directions
              </a>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;