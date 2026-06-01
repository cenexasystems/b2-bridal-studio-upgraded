import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { fadeUp, staggerContainer } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

const FilterPill = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className="font-cinzel text-[0.6rem] tracking-[0.25em] uppercase px-5 py-2 transition-all duration-400 whitespace-nowrap"
    style={{
      background: active ? 'linear-gradient(135deg, #FFD700, #FFE566)' : 'transparent',
      color: active ? '#000' : '#FFD700',
      border: `1px solid ${active ? 'transparent' : 'rgba(255, 215, 0, 0.4)'}`,
      fontWeight: active ? 700 : 600,
      textShadow: active ? 'none' : '0 0 8px rgba(255,215,0,0.2)',
    }}
  >
    {label}
  </button>
);

const BlogCard = ({ blog, index }) => (
  <motion.article
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-8%' }}
    transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    className="group flex flex-col card-luxury"
  >
    <Link to={`/blogs/${blog.slug}`} className="block">
      <div className="overflow-hidden" style={{ aspectRatio: '16/10', position: 'relative' }}>
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
        <div className="absolute top-4 left-4 font-cinzel text-[0.55rem] tracking-[0.25em] uppercase px-3 py-1.5 font-bold" style={{ background: '#FFD700', color: '#000' }}>
          {blog.category}
        </div>
      </div>
    </Link>
    <div className="flex flex-col flex-1 p-6 lg:p-7">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase font-bold" style={{ color: '#FFD700', textShadow: '0 0 6px rgba(255,215,0,0.2)' }}>
          {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </span>
        <span style={{ color: 'rgba(255, 215, 0, 0.4)' }}>·</span>
        <span className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase font-bold" style={{ color: '#FFD700', textShadow: '0 0 6px rgba(255,215,0,0.2)' }}>{blog.readTime}</span>
      </div>
      <Link to={`/blogs/${blog.slug}`}>
        <h3 className="font-playfair font-semibold leading-snug mb-3 transition-colors duration-300 group-hover:text-gold-500" style={{ fontSize: '1.15rem', color: '#F8F5F0' }}>{blog.title}</h3>
      </Link>
      <div className="gold-divider-left mb-4" />
      <p className="font-cormorant leading-relaxed flex-1 mb-5" style={{ fontSize: '1.05rem', color: 'rgba(248,245,240,0.75)' }}>{blog.preview}</p>
      <div className="flex items-center justify-between">
        <span className="font-cormorant italic text-sm font-semibold" style={{ color: '#FFE566', textShadow: '0 0 6px rgba(255,229,102,0.2)' }}>By {blog.author}</span>
        <Link to={`/blogs/${blog.slug}`} className="flex items-center gap-2 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase transition-all duration-300 group-hover:gap-3 font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.3)', textDecoration: 'none' }}>
          Read More
          <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round"><path d="M1 5h12M7 1l6 4-6 4"/></svg>
        </Link>
      </div>
    </div>
  </motion.article>
);

const FeaturedBlog = ({ blog }) => (
  <motion.article initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} className="group">
    <Link to={`/blogs/${blog.slug}`} className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden" style={{ border: '1px solid rgba(255, 215, 0, 0.2)', background: 'rgba(255,255,255,0.02)', textDecoration: 'none' }}>
      <div className="overflow-hidden" style={{ minHeight: '340px', position: 'relative' }}>
        <img src={blog.image} alt={blog.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        <div className="absolute top-6 left-6 font-cinzel text-[0.55rem] tracking-[0.25em] uppercase px-4 py-2 font-bold" style={{ background: '#FFD700', color: '#000' }}>★ Featured</div>
      </div>
      <div className="flex flex-col justify-center p-8 lg:p-12">
        <div className="flex items-center gap-3 mb-3">
          <span className="font-cinzel text-[0.55rem] tracking-[0.25em] uppercase font-bold" style={{ color: '#FFD700', textShadow: '0 0 6px rgba(255,215,0,0.2)' }}>{blog.category}</span>
          <span style={{ color: 'rgba(255, 215, 0, 0.4)' }}>·</span>
          <span className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase font-bold" style={{ color: '#FFD700', textShadow: '0 0 6px rgba(255,215,0,0.2)' }}>{blog.readTime}</span>
        </div>
        <h2 className="font-playfair font-bold leading-tight mb-4 transition-colors duration-300 group-hover:text-gold-400" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', color: '#F8F5F0' }}>{blog.title}</h2>
        <div className="gold-divider-left mb-4" />
        <p className="font-cormorant leading-relaxed mb-6" style={{ fontSize: '1.1rem', color: 'rgba(248,245,240,0.75)' }}>{blog.preview}</p>
        <div className="flex items-center gap-2 font-cinzel text-[0.65rem] tracking-[0.2em] uppercase transition-all duration-300 group-hover:gap-4 font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255,215,0,0.3)' }}>
          Read Full Article
          <svg width="16" height="10" viewBox="0 0 14 10" fill="none" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round"><path d="M1 5h12M7 1l6 4-6 4"/></svg>
        </div>
      </div>
    </Link>
  </motion.article>
);

const BlogList = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true, margin: '-10%' });

  useEffect(() => {
    fetch(`${API}/api/blogs`).then(r => r.json()).then(setBlogs).catch(console.error).finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(blogs.map(b => b.category))];
  const filtered = activeFilter === 'All' ? blogs : blogs.filter(b => b.category === activeFilter);
  const featured = filtered[0];
  const rest = filtered.slice(1);

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ padding: '10rem 0 5rem' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.06), transparent 60%)' }} />
        <div className="absolute top-24 right-12 opacity-[0.04] pointer-events-none hidden lg:block">
          <span className="font-signature" style={{ fontSize: '12rem', color: '#FFD700' }}>Blog</span>
        </div>
        <motion.div ref={headerRef} variants={staggerContainer} initial="hidden" animate={headerInView ? 'visible' : 'hidden'} className="max-w-[1300px] mx-auto px-6 lg:px-12 text-center">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-5">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #FFD700)' }} />
            <span className="font-cinzel text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: '#FFD700' }}>Journal & Insights</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', letterSpacing: '0.06em', color: '#F8F5F0' }}>
            The B2 <span className="text-gold-gradient">Journal</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-4 max-w-2xl mx-auto" style={{ fontSize: '1.2rem', color: 'rgba(248,245,240,0.5)' }}>
            Expert insights on bridal beauty, fashion trends, skincare rituals, and the art of transformation
          </motion.p>
          <motion.div variants={fadeUp} className="gold-divider mt-8" />
        </motion.div>
      </section>

      {/* Filters */}
      <section style={{ padding: '0 0 3rem' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12 flex flex-wrap items-center justify-center gap-3">
          {categories.map(cat => <FilterPill key={cat} label={cat} active={activeFilter === cat} onClick={() => setActiveFilter(cat)} />)}
        </div>
      </section>

      {/* Blog Grid */}
      <section style={{ padding: '0 0 8rem' }}>
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1,2,3].map(i => (
                <div key={i} className="animate-pulse" style={{ border: '1px solid rgba(255,195,0,0.08)' }}>
                  <div style={{ aspectRatio: '16/10', background: 'rgba(255,195,0,0.05)' }} />
                  <div className="p-6"><div className="h-5 rounded mb-3" style={{ background: 'rgba(255,195,0,0.08)' }} /><div className="h-3 rounded" style={{ background: 'rgba(255,195,0,0.05)', width: '70%' }} /></div>
                </div>
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={activeFilter} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
                {featured && <div className="mb-10"><FeaturedBlog blog={featured} /></div>}
                {rest.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {rest.map((blog, i) => <BlogCard key={blog._id} blog={blog} index={i} />)}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="relative" style={{ padding: '5rem 0 6rem' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }} className="max-w-xl mx-auto px-6 text-center">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Stay Inspired</span>
          <h3 className="font-cinzel font-bold uppercase mt-3 mb-4" style={{ fontSize: 'clamp(1.2rem, 3vw, 1.8rem)', color: '#F8F5F0', letterSpacing: '0.04em' }}>Join Our Community</h3>
          <p className="font-cormorant italic mb-8" style={{ color: 'rgba(248,245,240,0.5)' }}>Follow us for the latest beauty insights, tutorials, and bridal inspiration</p>
          <Link to="/contact" className="btn-gold py-3 px-8 text-xs">Get In Touch</Link>
        </motion.div>
      </section>
    </div>
  );
};

export default BlogList;
