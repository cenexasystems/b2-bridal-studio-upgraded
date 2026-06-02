import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer, slideUp } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

const CATEGORIES = {
  beautician: {
    title: 'Beautician Courses',
    image: '/images/Beautician.png',
  },
  fashion: {
    title: 'Fashion & Design',
    image: '/images/Fashion.png',
  },
  embroidery: {
    title: 'Embroidery & Crafts',
    image: '/images/Embroidary.png',
  },
  jewellery: {
    title: 'Jewellery Making',
    image: '/images/jewelry.png',
  },
  bags: {
    title: 'Bags & Accessories',
    image: '/images/bags.png',
  },
  kids: {
    title: 'Kids Learning Programs',
    image: '/images/kids.png',
  },
  special: {
    title: 'Special Skill Courses',
    image: '/images/specialcourses.png',
  },
};

/* Per-course image mapping — assigns a relevant real image to each individual course based on its title */
const COURSE_IMAGES_BY_TITLE = {
  'beautician salon course': '/images/courses/beautician.png',
  'makeup artist course': '/images/courses/makeup.png',
  'nail artist course': '/images/courses/nail-art.png',
  'mehandi artist course': '/images/courses/mehandi.png',
  'hair extension course': '/images/courses/hair-extension.png',
  'hairstyle course': '/images/courses/hairstyling.png',
  'fashion designing course': '/images/courses/fashion.png',
  'saree draping & pre-pleating course': '/images/courses/sareedraping.png',
  'saree draping & pre-pleating': '/images/courses/saree-draping.jpeg',
  'aari embroidery course': '/images/courses/aari.png',
  'aari brooches work': '/images/courses/aaribrooches.png',
  'machine embroidery': '/images/courses/machine.png',
  'hand embroidery': '/images/courses/hand.png',
  'fabric painting': '/images/courses/fabricpainting.png',
  'simple chemical work': '/images/courses/chemical.png',
  'silk thread jewellery': '/images/courses/silk-thread-jewellery.png',
  'kundan jewellery': '/images/courses/kundan-jewellery.png',
  'crystal jewellery': '/images/courses/crystal-jewellery.png',
  'terracotta jewellery': '/images/courses/terracotta-jewellery.png',
  'jute bag making': '/images/courses/jute-bag.png',
  'cloth bag making': '/images/courses/cloth-bag.png',
  'wire bags': '/images/courses/wire-bag.png',
  'macramé bags': '/images/courses/macrame-bag.png',
  'tatting': '/images/courses/tatting.png',
  'knitting': '/images/courses/knitting.png',
  'crochet': '/images/courses/crochet.png',
  'brooches making': '/images/courses/brooches.png',
  'abacus training': '/images/courses/abacus.png',
  'kids tuition': '/images/courses/kids-tuition.png',
  'hindi language course': '/images/courses/hindi-language.png',
  'phonics training': '/images/courses/kids-tuition.png',
  'silambam training': '/images/courses/silambam.png',
  'karate training': '/images/courses/karate.png',
  'soft toys making': '/images/courses/soft-toys.png',
  'bakery products course': '/images/courses/bakery.png',
  'palm leaf craft course': '/images/courses/palm-leaf-craft.png',
};

const Courses = () => {
  const { category } = useParams();
  const [selectedBranch, setSelectedBranch] = useState('branch1');
  const [dbCourses, setDbCourses] = useState([]);
  const [toast, setToast] = useState({ show: false, message: '' });
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });

  const triggerAuthToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      window.location.href = '/auth';
    }, 2500);
  };

  useEffect(() => {
    axios.get(`${API}/api/courses`).then(res => setDbCourses(res.data)).catch(() => { });
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast(prev => ({ ...prev, show: false }));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const categoryData = category ? {
    title: CATEGORIES[category]?.title || category,
    courses: dbCourses
      .filter(c => c.category?.toLowerCase() === category?.toLowerCase())
      .map(c => ({ id: c._id, title: c.title, duration: c.duration, learn: c.learnings || [] }))
  } : null;

  const handleEnroll = (course) => {
    const stored = localStorage.getItem('user');
    let user = null;
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && (parsed.email || parsed.phone)) {
          user = parsed;
        }
      } catch (e) {}
    }

    if (!user) {
      triggerAuthToast('Please login to enroll.');
      return;
    }

    const message = `*Course Enrollment*%0A%0A*Customer:* ${user.name}%0APhone: ${user.phone}%0AEmail: ${user.email}%0A%0A*Category:* ${categoryData.title}%0A*Course:* ${course.title}%0A*Duration:* ${course.duration}%0A*Branch:* ${selectedBranch === 'branch1' ? 'Chennai' : 'Madurai'}%0A%0APlease send QR code for fee payment.`;
    window.open(`https://wa.me/919361527951?text=${message}`, '_blank');
  };

  /* ─── Main category grid (no category selected) ─── */
  if (!category) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }}>
        {/* Hero Banner */}
        <div className="page-hero">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
              <div className="gold-divider" style={{ width: '40px' }} />
              <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Academy</span>
              <div className="gold-divider" style={{ width: '40px' }} />
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
              Our Courses
            </motion.h1>
            <motion.p variants={fadeUp} className="font-cormorant italic mt-4" style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.92)' }}>
              Master the art of beauty and craftsmanship with our professionally curated programs.
            </motion.p>
          </motion.div>
        </div>

        {/* Category Grid */}
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CATEGORIES).map(([key, data], i) => {
              const count = dbCourses.filter(c => c.category?.toLowerCase() === key.toLowerCase()).length;
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <Link to={`/courses/${key}`} className="block card-luxury rounded-sm group" style={{ textDecoration: 'none' }}>
                    <div className="img-zoom-container relative" style={{ height: '220px' }}>
                      <img src={data.image} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
                      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
                      <div className="absolute bottom-4 left-5 right-5">
                        <span className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: '#FFD700' }}>
                          {count} Courses
                        </span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-playfair text-lg mb-2" style={{ color: '#F8F5F0' }}>{data.title}</h3>
                      <span className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase flex items-center gap-2 group-hover:gap-3 transition-all" style={{ color: '#FFD700' }}>
                        Explore Courses
                        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" stroke="#FFD700" strokeWidth="1.2"><path d="M1 4h10M7 1l4 3-4 3" strokeLinecap="round" /></svg>
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ─── Category detail page ─── */
  return (
    <div style={{ background: '#000', minHeight: '100vh' }} ref={ref}>
      {/* Hero */}
      <div className="page-hero relative">
        <div className="absolute inset-0" style={{ backgroundImage: `url(${CATEGORIES[category]?.image})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="relative max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Academy</span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            {categoryData?.title}
          </motion.h1>
          <motion.div variants={fadeUp} className="mt-4">
            <Link to="/courses" className="font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2" style={{ color: 'rgba(255,195,0,0.85)' }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 4H1M4 7L1 4l3-3" strokeLinecap="round" /></svg>
              All Categories
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Branch Selector */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 pt-10 pb-4">
        <div 
          className="glass-dark p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-300" 
          style={{ 
            border: '1px solid rgba(255,195,0,0.15)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
          }}
        >
          {/* Label + Icon */}
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.15)' }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.8">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="font-cinzel text-[0.65rem] tracking-[0.25em] uppercase font-bold" style={{ color: '#FFD700' }}>
                Select Studio Branch
              </span>
              <span className="font-cormorant text-[0.8rem] italic mt-0.5" style={{ color: 'rgba(248,245,240,0.6)' }}>
                Choose a location to view custom offerings
              </span>
            </div>
          </div>

          {/* Select Element */}
          <div className="w-full sm:w-auto relative">
            <select
              value={selectedBranch}
              onChange={e => setSelectedBranch(e.target.value)}
              className="w-full sm:w-64 px-4 py-3 font-cormorant rounded-sm outline-none cursor-pointer transition-all duration-300 text-base appearance-none"
              style={{ 
                background: 'rgba(255,195,0,0.06)', 
                border: '1px solid rgba(255,195,0,0.25)', 
                color: '#F8F5F0', 
                paddingRight: '2.5rem',
                fontSize: '1rem',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(255,195,0,0.5)';
                e.currentTarget.style.background = 'rgba(255,195,0,0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,195,0,0.25)';
                e.currentTarget.style.background = 'rgba(255,195,0,0.06)';
              }}
            >
              <option value="branch1" style={{ background: '#0e0e0f', color: '#F8F5F0' }}>Chennai — Moolakaadai</option>
              <option value="branch2" style={{ background: '#0e0e0f', color: '#F8F5F0' }}>Madurai — Kochadai</option>
            </select>
            {/* Custom Arrow Accent */}
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center">
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="#FFD700" strokeWidth="1.5">
                <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Course Cards */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoryData?.courses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="card-luxury rounded-sm flex flex-col"
            >
              {/* Course image */}
              <div className="img-zoom-container relative" style={{ height: '180px' }}>
                <img src={COURSE_IMAGES_BY_TITLE[course.title?.toLowerCase().trim()] || CATEGORIES[category]?.image} alt={course.title} className="w-full h-full object-cover" loading="lazy" style={{ opacity: 0.6 }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.95), rgba(0,0,0,0.2))' }} />
                <div className="absolute bottom-3 left-4 flex items-center gap-2">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                  <span className="font-cinzel text-[0.6rem] tracking-[0.15em]" style={{ color: '#FFD700' }}>{course.duration}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-playfair text-base mb-3 leading-tight" style={{ color: '#F8F5F0' }}>{course.title}</h3>
                <div className="mb-4 flex-1">
                  <h4 className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2 flex items-center gap-2" style={{ color: 'rgba(255,195,0,0.88)' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" /><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" /></svg>
                    You'll Learn
                  </h4>
                  <ul className="flex flex-col gap-1.5">
                    {course.learn.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.9)' }}>
                        <svg width="8" height="8" viewBox="0 0 8 8" fill="#FFD700" className="mt-1.5 flex-shrink-0"><circle cx="4" cy="4" r="2" /></svg>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleEnroll(course)}
                  className="w-full py-3 font-cinzel text-[0.65rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2 transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #FFED8A, #FFD700, #FFCA28, #E5A100)', border: 'none', color: '#000', fontWeight: 700, boxShadow: '0 2px 10px rgba(255,195,0,0.25)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(255,215,0,0.5), 0 4px 16px rgba(255,195,0,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(255,195,0,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Enroll via WhatsApp
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      <AnimatePresence>
        {toast.show && (
          <>
            {/* Mobile Toast */}
            <motion.div
              key="mobile-toast"
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed bottom-6 left-1/2 z-[9999] lg:hidden w-[90%] max-w-md"
            >
              <div className="glass-dark border-gold-glow px-4 py-3 rounded-md flex items-center justify-between shadow-2xl relative overflow-hidden" style={{ background: 'rgba(10, 10, 10, 0.95)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
                    <span style={{ color: '#f87171', fontSize: '16px' }}>⚠</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-playfair text-[0.85rem] font-semibold leading-snug" style={{ color: '#F8F5F0' }}>
                      {toast.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className="ml-3 transition-colors text-xs font-sans px-2 py-1 rounded"
                  style={{ color: 'rgba(248, 245, 240, 0.5)' }}
                >
                  ✕
                </button>
              </div>
            </motion.div>

            {/* Desktop Toast */}
            <motion.div
              key="desktop-toast"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="fixed top-24 right-6 z-[9999] hidden lg:block w-full max-w-sm"
            >
              <div className="glass-dark border-gold-glow px-4 py-3 rounded-md flex items-center justify-between shadow-2xl relative overflow-hidden" style={{ background: 'rgba(10, 10, 10, 0.95)' }}>
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}>
                    <span style={{ color: '#f87171', fontSize: '16px' }}>⚠</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-playfair text-[0.85rem] font-semibold leading-snug" style={{ color: '#F8F5F0' }}>
                      {toast.message}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setToast(prev => ({ ...prev, show: false }))}
                  className="ml-3 transition-colors text-xs font-sans px-2 py-1 rounded"
                  style={{ color: 'rgba(248, 245, 240, 0.5)' }}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Courses;
