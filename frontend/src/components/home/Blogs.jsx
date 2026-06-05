import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { Link } from 'react-router-dom';

const blogs = [
  {
    id: 1,
    category: 'Bridal Trends',
    title: '10 Bridal Makeup Looks Dominating 2024 Weddings',
    preview: 'From dewy skin finishes to bold jewel-toned eyes — discover which looks are defining the modern Indian bride.',
    image: '/images/blog/bridal_makeup_looks_2024.jpg',
    readTime: '5 min read',
    slug: '10-bridal-makeup-looks-dominating-2024-weddings',
  },
  {
    id: 2,
    category: 'Academy Insights',
    title: 'How to Build a Luxury Bridal Makeup Career from Scratch',
    preview: 'Our master trainers share the exact roadmap — from certification to premium clientele — for aspiring bridal artists.',
    image: '/images/blog/luxury_makeup_career.png',
    readTime: '7 min read',
    slug: 'build-luxury-bridal-makeup-career',
  },
  {
    id: 3,
    category: 'Skin Care',
    title: 'The Pre-Bridal Skin Care Ritual Every Bride Should Follow',
    preview: 'Six weeks out, four weeks, two weeks — the complete countdown for flawless skin on your wedding day.',
    image: '/images/blog/pre_bridal_skincare.png',
    readTime: '6 min read',
    slug: 'pre-bridal-skincare-ritual',
  },
];

const BlogCard = ({ blog, delay }) => {
  const slug = blog.slug || blog.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return (
  <Link to={`/blogs/${slug}`} style={{ textDecoration: 'none' }}>
  <motion.article
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-10%' }}
    transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    className="group flex flex-col cursor-pointer"
    style={{
      background: 'rgba(255,255,255,0.02)',
      border: '1px solid rgba(255,195,0,0.1)',
      overflow: 'hidden',
      transition: 'border-color 0.4s ease',
    }}
    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,195,0,0.3)'; }}
    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,195,0,0.1)'; }}
  >
    {/* Image */}
    <div className="overflow-hidden" style={{ aspectRatio: '16/10', position: 'relative' }}>
      <img
        src={blog.image}
        alt={blog.title}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
      {/* Overlay on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }}
      />
      {/* Category badge */}
      <div
        className="absolute top-4 left-4 font-cinzel text-[0.6rem] tracking-[0.25em] uppercase px-3 py-1"
        style={{ background: 'rgba(255,195,0,0.9)', color: '#000' }}
      >
        {blog.category}
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col flex-1 p-6">
      {/* Meta */}
      <div className="flex items-center gap-3 mb-4">
        <span className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,195,0,0.5)' }}>
          {blog.readTime}
        </span>
      </div>

      {/* Title */}
      <h3
        className="font-playfair font-semibold leading-snug mb-3 transition-colors duration-300 group-hover:text-gold-500"
        style={{ fontSize: '1.15rem', color: '#F8F5F0' }}
      >
        {blog.title}
      </h3>

      <div className="gold-divider-left mb-4" />

      {/* Preview */}
      <p
        className="font-cormorant leading-relaxed flex-1 mb-5"
        style={{ fontSize: '1.05rem', color: 'rgba(248,245,240,0.55)' }}
      >
        {blog.preview}
      </p>

      {/* Read more link */}
      <div
        className="flex items-center gap-2 font-cinzel text-[0.65rem] tracking-[0.2em] uppercase transition-all duration-300 group-hover:gap-3"
        style={{ color: '#FFD700' }}
      >
        Read Article
        <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#FFD700" strokeWidth="1.2" strokeLinecap="round">
          <path d="M1 5h12M7 1l6 4-6 4"/>
        </svg>
      </div>
    </div>
  </motion.article>
  </Link>
  );
};

const Blogs = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  return (
    <section
      id="blog"
      className="relative overflow-hidden"
      style={{
        padding: '5.5rem 0',
        background: 'linear-gradient(180deg, #000 0%, #050400 50%, #000 100%)',
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12" ref={ref}>
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="flex flex-col md:flex-row items-start md:items-end justify-between mb-14 gap-6"
        >
          <div>
            <motion.div variants={fadeUp} className="flex items-center gap-3 mb-4">
              <div className="gold-divider-left" />
              <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
                07 — Journal
              </span>
            </motion.div>
            <motion.h2
              variants={fadeUp}
              className="font-cinzel font-bold uppercase"
              style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.05em', color: '#F8F5F0' }}
            >
              Latest from the Studio
            </motion.h2>
          </div>
          <motion.div variants={fadeUp}>
            <Link to="/blogs" className="btn-outline-gold py-2 text-xs">
              View All Articles
            </Link>
          </motion.div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {blogs.map((blog, i) => (
            <BlogCard key={blog.id} blog={blog} delay={i * 0.1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blogs;
