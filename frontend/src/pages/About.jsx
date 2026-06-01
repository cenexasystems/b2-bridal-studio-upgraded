import React, { useRef, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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
      <div className="font-cormorant italic text-base" style={{ color: 'rgba(248,245,240,0.92)' }}>{label}</div>
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

/* ─── Team Data — REMOVED per refinement ───────────────── */

const About = () => {
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const timelineRef = useRef(null);

  const heroInView = useInView(heroRef, { once: true, margin: '-10%' });
  const statsInView = useInView(statsRef, { once: true, margin: '-10%' });
  const timelineInView = useInView(timelineRef, { once: true, margin: '-5%' });

  return (
    <div style={{ background: '#000' }}>

      {/* ═══ SECTION 1 — INTRO HERO ═══ */}
      <section className="relative overflow-hidden" style={{ padding: '10rem 0 6rem' }} ref={heroRef}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.06), transparent 60%)' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate={heroInView ? 'visible' : 'hidden'} className="max-w-[1200px] mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Content — Left side */}
          <motion.div variants={slideLeft}>
            <div className="flex items-center gap-3 mb-4">
              <div className="gold-divider-left" />
              <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>About Our Studio</span>
            </div>
            <h1 className="font-cinzel font-bold uppercase leading-tight mb-6" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F8F5F0', letterSpacing: '0.03em' }}>
              About B2 Bridal Studio
            </h1>
            <p className="font-cormorant italic text-2xl mb-4 font-bold" style={{ color: '#FFD700' }}>
              A legacy of beauty, artistry, and transformation
            </p>
            <p className="font-cormorant text-xl leading-relaxed mb-4" style={{ color: 'rgba(248,245,240,0.92)' }}>
              Shanmugavadivu Sabarinathan is a professional makeup artist, creative entrepreneur, and certified trainer with 20+ certifications. She is recognized for expertise in bridal makeup artistry and skill-based education.
            </p>
            <p className="font-cormorant text-xl leading-relaxed mb-4 md:mb-0" style={{ color: 'rgba(248,245,240,0.92)' }}>
              As the founder of B2 Bridal Studio, she has built a legacy of empowering women through beauty and craftsmanship, training thousands of aspiring professionals across Tamil Nadu.
            </p>
          </motion.div>

          {/* Image — Right side */}
          <motion.div variants={slideRight} className="relative flex justify-center">
            <div className="img-zoom-container rounded-sm w-full max-w-[360px]" style={{ border: '1px solid rgba(255,195,0,0.15)' }}>
              <img
                src="/images/about3.jpg"
                alt="About B2 Bridal Studio"
                className="w-full object-cover"
                style={{ aspectRatio: '3/4', objectPosition: 'top center' }}
                loading="lazy"
              />
            </div>
            {/* Floating stat */}
            <div className="absolute -bottom-6 -right-4 lg:-right-8 glass-dark px-6 py-4 text-center" style={{ border: '1px solid rgba(255,195,0,0.2)' }}>
              <div className="font-cinzel font-bold text-lg" style={{ color: '#FFD700' }}>15+</div>
              <div className="font-cormorant italic text-xs" style={{ color: 'rgba(248,245,240,0.82)' }}>Years of Excellence</div>
            </div>
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
          <p className="font-cormorant text-xl leading-relaxed" style={{ color: 'rgba(248,245,240,0.92)' }}>
            B2 Bridal Studio was born from a belief that every woman deserves to feel extraordinary — and every aspiring professional deserves world-class training. We blend tradition with modern artistry to create experiences that transform lives.
          </p>
        </motion.div>
      </section>

      {/* ═══ SECTION 2.5 — STUDIO GALLERY ═══ */}
      <section className="relative" style={{ padding: '6rem 0' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="max-w-[1100px] mx-auto px-6 text-center mb-10"
        >
          <motion.span variants={fadeUp} className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Our Studio</motion.span>
          <motion.h2 variants={fadeUp} className="font-cinzel font-bold uppercase mt-3" style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', color: '#F8F5F0', letterSpacing: '0.04em' }}>
            A Glimpse Inside
          </motion.h2>
        </motion.div>
        <div className="max-w-[1100px] mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { src: '/images/about1.jpeg', alt: 'B2 Bridal Studio — Bridal Artistry' },
            { src: '/images/about4.jpeg', alt: 'B2 Bridal Studio — Academy Training' },
            { src: '/images/about2.JPG', alt: 'B2 Bridal Studio — Founder' },
          ].map((img, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.15 }}
              className="card-luxury rounded-sm group"
              style={{ overflow: 'hidden' }}
            >
              <div className="img-zoom-container" style={{ aspectRatio: '4/5' }}>
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            </motion.div>
          ))}
        </div>
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
                <p className="font-cormorant text-sm leading-relaxed" style={{ color: 'rgba(248,245,240,0.9)' }}>{item.desc}</p>
              </div>
              <div className="flex-1 hidden md:block" />
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
            { title: '10 Bridal Makeup Looks Dominating 2024 Weddings', image: '/images/blog/bridal_makeup_looks_2024.png', excerpt: 'From dewy skin finishes to bold jewel-toned eyes — discover which looks are defining the modern Indian bride.', slug: '10-bridal-makeup-looks-dominating-2024-weddings' },
            { title: 'How to Build a Luxury Bridal Makeup Career', image: '/images/blog/luxury_makeup_career.png', excerpt: 'Our master trainers share the exact roadmap — from certification to premium clientele.', slug: 'build-luxury-bridal-makeup-career' },
            { title: 'The Pre-Bridal Skin Care Ritual', image: '/images/blog/pre_bridal_skincare.png', excerpt: 'The complete countdown for flawless skin on your wedding day.', slug: 'pre-bridal-skincare-ritual' },
          ].map((post, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12 }}
              className="card-luxury rounded-sm group flex flex-col justify-between"
            >
              <Link to={`/blogs/${post.slug}`} className="block overflow-hidden">
                <div className="img-zoom-container" style={{ height: '180px' }}>
                  <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                </div>
              </Link>
              <div className="p-5 flex flex-col flex-1 justify-between">
                <div>
                  <Link to={`/blogs/${post.slug}`}>
                    <h3 className="font-playfair text-base mb-2 leading-tight transition-colors duration-300 group-hover:text-gold-500" style={{ color: '#F8F5F0' }}>{post.title}</h3>
                  </Link>
                  <div className="gold-divider-left mb-3" />
                  <p className="font-cormorant text-sm leading-relaxed mb-4" style={{ color: 'rgba(248,245,240,0.9)' }}>{post.excerpt}</p>
                </div>
                <Link to={`/blogs/${post.slug}`} className="flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase transition-all duration-300 group-hover:gap-3 mt-auto self-start animate-pulse-subtle" style={{ color: '#FFD700', textDecoration: 'none' }}>
                  Read More
                  <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round"><path d="M1 5h12M7 1l6 4-6 4"/></svg>
                </Link>
              </div>
            </motion.article>
          ))}
        </div>
      </section>


    </div>
  );
};

export default About;