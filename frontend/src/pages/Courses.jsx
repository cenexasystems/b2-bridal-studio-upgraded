import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer, slideUp } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

const COURSE_IMAGES = {
  beautician: '/images/bridal4.jpeg',
  fashion: '/images/fashion.jpeg',
  embroidery: '/images/embroidary.jpeg',
  jewellery: '/images/jewelry.png',
  bags: '/images/bags.png',
  kids: '/images/kids.png',
  special: '/images/specialcourses.png',
};

const COURSE_DATA = {
  beautician: {
    title: 'Beautician Courses',
    courses: [
      { id: 'b1', title: 'Beautician Salon Course', duration: '15 Days', learn: ['Facials & skincare', 'Threading & waxing', 'Manicure & pedicure'] },
      { id: 'b2', title: 'Makeup Artist Course', duration: '15 Days', learn: ['Contouring & highlighting', 'Bridal & party makeup', 'Product & brush knowledge'] },
      { id: 'b3', title: 'Nail Artist Course', duration: '3 or 5 Days', learn: ['Gel & acrylic nails', 'Nail art designs', 'French manicure'] },
      { id: 'b4', title: 'Mehandi Artist Course', duration: '3 or 5 Days', learn: ['Arabic & Indian designs', 'Cone making', 'Speed practice'] },
      { id: 'b5', title: 'Hair Extension Course', duration: '3 Days', learn: ['Clip-in & keratin extensions', 'Color blending', 'Hair care & removal'] },
      { id: 'b6', title: 'Hairstyle Course', duration: '1 or 2 Days', learn: ['Buns, curls & braids', 'Tool-based styling', 'Accessory placement'] },
    ]
  },
  fashion: {
    title: 'Fashion & Design',
    courses: [
      { id: 'f1', title: 'Fashion Designing Course', duration: 'Weekly Ongoing', learn: ['Blouse Design', 'Kurtis & Frocks', 'Western Wear', 'Kids Dress'] },
      { id: 'f2', title: 'Saree Draping & Pre-Pleating', duration: '1 or 2 Days', learn: ['Bridal Draping', 'Party Draping', 'Pre-Pleating Techniques'] },
    ]
  },
  embroidery: {
    title: 'Embroidery & Crafts',
    courses: [
      { id: 'e1', title: 'Aari Embroidery Course', duration: '5, 10 or 25 Days', learn: ['Basic stitches', 'Zari & stone work', 'Advanced designer motifs'] },
      { id: 'e2', title: 'Aari Brooches Work', duration: '3 Days', learn: ['Patch & motif brooch', 'Zardosi brooch', 'Jewellery-style brooch'] },
      { id: 'e3', title: 'Machine Embroidery', duration: '5 Days', learn: ['Thread tension control', 'Motif embroidery', 'Border & neckline designs'] },
      { id: 'e4', title: 'Hand Embroidery', duration: '3 Days', learn: ['French knot & satin stitch', 'Mirror work', 'Simple motif making'] },
      { id: 'e5', title: 'Fabric Painting', duration: '3 Days', learn: ['Fabric color mixing', 'Floral & motif painting', 'Block & stencil design'] },
      { id: 'e6', title: 'Simple Chemical Work', duration: '5 Days', learn: ['Chemical lace technique', 'Oxidation effect', 'Fabric texture designs'] },
    ]
  },
  jewellery: {
    title: 'Jewellery Making',
    courses: [
      { id: 'j1', title: 'Silk Thread Jewellery', duration: '3 Days', learn: ['Matte finishing', 'Jhumka making', 'Silk chokers & chains'] },
      { id: 'j2', title: 'Kundan Jewellery', duration: '3 Days', learn: ['Stone setting', 'Kundan rings & chokers', 'Color combination patterns'] },
      { id: 'j3', title: 'Crystal Jewellery', duration: '3 Days', learn: ['Bead weaving', 'Wire looping technique', 'Party & casual wear sets'] },
      { id: 'j4', title: 'Terracotta Jewellery', duration: '3 Days', learn: ['Clay molding', 'Color baking', 'Necklace & studs creation'] },
    ]
  },
  bags: {
    title: 'Bags & Accessories',
    courses: [
      { id: 'ba1', title: 'Jute Bag Making', duration: '5 Days', learn: ['Basic & designer jute bags', 'Lining & finishing', 'Handle and zip attachment'] },
      { id: 'ba2', title: 'Cloth Bag Making', duration: '5 Days', learn: ['Cutting & stitching', 'Pattern-based bags', 'Reversible & foldable designs'] },
      { id: 'ba3', title: 'Wire Bags', duration: '5 Days', learn: ['Wire frame basics', 'Bead fixing & pattern design', 'Handle & closure techniques'] },
      { id: 'ba4', title: 'Macramé Bags', duration: '3 Days', learn: ['Basic macramé knots', 'Bag structure & shaping', 'Fringe & decorative finishing'] },
    ]
  },
  kids: {
    title: 'Kids Learning Programs',
    courses: [
      { id: 'k1', title: 'Abacus Training', duration: '3 / 6 Months', learn: ['Visual calculation', 'Brain development', 'Confidence building'] },
      { id: 'k2', title: 'Kids Tuition', duration: 'Monthly', learn: ['All subjects', 'Homework assistance', 'Exam preparation'] },
      { id: 'k3', title: 'Hindi Language Course', duration: '1 – 3 Months', learn: ['Basic grammar', 'Conversation skills', 'Writing practice'] },
      { id: 'k4', title: 'Phonics Training', duration: '2 Months', learn: ['Sound recognition', 'Word building', 'Reading fluency'] },
    ]
  },
  special: {
    title: 'Special Skill Courses',
    courses: [
      { id: 's1', title: 'Soft Toys Making', duration: '3 Days', learn: ['Doll & teddy making', 'Pattern cutting', 'Stuffing & finishing'] },
      { id: 's3', title: 'Bakery Products Course', duration: '5 Days', learn: ['Cake & cupcake baking', 'Bread & bun making', 'Decorating basics'] },
      { id: 's4', title: 'Palm Leaf Craft Course', duration: '5 Days', learn: ['Basket & box weaving', 'Decorative crafts', 'Natural dye finishing'] },
    ]
  },
};

const Courses = () => {
  const { category } = useParams();
  const [selectedBranch, setSelectedBranch] = useState('branch1');
  const [dbCourses, setDbCourses] = useState([]);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-5%' });

  useEffect(() => {
    axios.get(`${API}/api/courses`).then(res => setDbCourses(res.data)).catch(() => { });
  }, []);

  const categoryData = category ? {
    title: COURSE_DATA[category]?.title || category,
    courses: [
      ...dbCourses.filter(c => c.category?.toLowerCase() === category?.toLowerCase()).map(c => ({ id: c._id, title: c.title, duration: c.duration, learn: c.learnings || [] })),
      ...(COURSE_DATA[category]?.courses || [])
    ]
  } : null;

  const handleEnroll = (course) => {
    const userData = localStorage.getItem('user');
    if (!userData) { alert('Please login first'); window.location.href = '/login'; return; }
    const user = JSON.parse(userData);
    const message = `*Course Enrollment*%0A%0A*Customer:* ${user.name}%0APhone: ${user.phone}%0AEmail: ${user.email}%0A%0A*Category:* ${categoryData.title}%0A*Course:* ${course.title}%0A*Duration:* ${course.duration}%0A*Branch:* ${selectedBranch === 'branch1' ? 'Chennai' : 'Madurai'}%0A%0APlease send QR code for fee payment.`;
    window.open(`https://wa.me/919840551365?text=${message}`, '_blank');
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
            <motion.p variants={fadeUp} className="font-cormorant italic mt-4" style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.7)' }}>
              Master the art of beauty and craftsmanship with our professionally curated programs.
            </motion.p>
          </motion.div>
        </div>

        {/* Category Grid */}
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(COURSE_DATA).map(([key, data], i) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <Link to={`/courses/${key}`} className="block card-luxury rounded-sm group" style={{ textDecoration: 'none' }}>
                  <div className="img-zoom-container relative" style={{ height: '220px' }}>
                    <img src={COURSE_IMAGES[key]} alt={data.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-4 left-5 right-5">
                      <span className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: '#FFD700' }}>
                        {data.courses.length} Courses
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
            ))}
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
        <div className="absolute inset-0" style={{ backgroundImage: `url(${COURSE_IMAGES[category]})`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.15 }} />
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
            <Link to="/courses" className="font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-2" style={{ color: 'rgba(255,195,0,0.6)' }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="currentColor" strokeWidth="1"><path d="M9 4H1M4 7L1 4l3-3" strokeLinecap="round" /></svg>
              All Categories
            </Link>
          </motion.div>
        </motion.div>
      </div>

      {/* Branch Selector */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 pt-10 pb-4">
        <div className="glass-dark p-4 flex flex-wrap items-center justify-end gap-4" style={{ border: '1px solid rgba(255,195,0,0.1)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></svg>
          <span className="font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.6)' }}>Select Branch:</span>
          <select
            value={selectedBranch}
            onChange={e => setSelectedBranch(e.target.value)}
            className="px-3 py-2 text-sm font-cormorant rounded-sm outline-none"
            style={{ background: 'rgba(255,195,0,0.08)', border: '1px solid rgba(255,195,0,0.2)', color: '#F8F5F0' }}
          >
            <option value="branch1" style={{ background: '#111' }}>Chennai — Kodungaiyur</option>
            <option value="branch2" style={{ background: '#111' }}>Madurai Branch</option>
          </select>
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
                <img src={COURSE_IMAGES[category]} alt={course.title} className="w-full h-full object-cover" loading="lazy" style={{ opacity: 0.6 }} />
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
                  <h4 className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2 flex items-center gap-2" style={{ color: 'rgba(255,195,0,0.7)' }}>
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
    </div>
  );
};

export default Courses;
