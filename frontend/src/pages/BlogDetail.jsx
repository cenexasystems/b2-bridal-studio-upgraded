import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { fadeUp, staggerContainer } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

/* ─── Simple Markdown-ish renderer ───────────────────────── */
const renderContent = (content) => {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-playfair font-medium mt-12 mb-5" style={{ fontSize: '1.3rem', color: '#FFD700', textShadow: '0 0 4px rgba(255,215,0,0.15)', fontStyle: 'normal', lineHeight: '1.45', letterSpacing: '0.07em', fontWeight: '500' }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="font-playfair font-medium mt-8 mb-4" style={{ fontSize: '1.0rem', color: '#FFD700', textShadow: '0 0 3px rgba(255,215,0,0.1)', fontStyle: 'normal', lineHeight: '1.45', letterSpacing: '0.06em', fontWeight: '500' }}>
          {line.slice(4)}
        </h3>
      );
    } else if (line === '---') {
      elements.push(
        <div key={i} className="gold-divider my-8" />
      );
    } else if (line.startsWith('- **') || line.startsWith('- ')) {
      // Collect list items
      const items = [];
      while (i < lines.length && (lines[i].trim().startsWith('- ') || lines[i].trim().startsWith('* '))) {
        const text = lines[i].trim().slice(2);
        items.push(text);
        i++;
      }
      elements.push(
        <ul key={`ul-${i}`} className="mb-6 ml-2" style={{ listStyle: 'none' }}>
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 mb-3 font-cormorant italic text-[1.2rem] font-medium" style={{ color: '#FFFFFF', textShadow: '0 0 4px rgba(255,255,255,0.15)', lineHeight: '1.9', letterSpacing: '0.025em' }}>
              <span className="mt-2.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'rgba(255, 255, 255, 0.65)', boxShadow: '0 0 4px rgba(255, 255, 255, 0.2)' }} />
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFFFFF; text-shadow: 0 0 5px rgba(255,255,255,0.2); font-weight:700">$1</strong>') }} />
            </li>
          ))}
        </ul>
      );
      continue;
    } else if (line.match(/^\d+\.\s/)) {
      const items = [];
      while (i < lines.length && lines[i].trim().match(/^\d+\.\s/)) {
        const text = lines[i].trim().replace(/^\d+\.\s/, '');
        items.push(text);
        i++;
      }
      elements.push(
        <ol key={`ol-${i}`} className="mb-6 ml-2 counter-reset-custom">
          {items.map((item, j) => (
            <li key={j} className="flex items-start gap-3 mb-4 font-cormorant italic text-[1.2rem] font-medium" style={{ color: '#FFFFFF', textShadow: '0 0 4px rgba(255,255,255,0.15)', lineHeight: '1.9', letterSpacing: '0.025em' }}>
              <span className="font-cormorant text-base mt-0.5 flex-shrink-0 font-medium italic" style={{ color: 'rgba(255, 255, 255, 0.75)', minWidth: '1.5rem' }}>{j + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: item.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFFFFF; text-shadow: 0 0 5px rgba(255,255,255,0.2); font-weight:700">$1</strong>') }} />
            </li>
          ))}
        </ol>
      );
      continue;
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(
        <p key={i} className="font-cormorant italic text-[1.2rem] font-bold mb-3" style={{ color: '#FFFFFF', textShadow: '0 0 4px rgba(255,255,255,0.15)', lineHeight: '1.9', letterSpacing: '0.025em' }}>
          {line.slice(2, -2)}
        </p>
      );
    } else if (line.trim() === '') {
      // skip empty lines
    } else if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
      const contentText = line.slice(1, -1);
      const html = contentText.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#FFFFFF;text-decoration:underline;font-weight:bold">$1</a>');
      elements.push(
        <p key={i} className="font-cormorant italic text-[1.35rem] tracking-wide mt-6 mb-8 leading-relaxed text-left" style={{ color: '#FFFFFF', textShadow: '0 0 5px rgba(255,255,255,0.15)', textTransform: 'none', lineHeight: '1.95', letterSpacing: '0.03em' }} dangerouslySetInnerHTML={{ __html: html }} />
      );
    } else {
      const html = line
        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#FFFFFF; text-shadow: 0 0 5px rgba(255,255,255,0.2); font-weight:700">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em style="color:#FFFFFF; font-family:var(--font-cormorant); font-style:italic">$1</em>')
        .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" style="color:#FFFFFF;text-decoration:underline;font-weight:bold">$1</a>');
      elements.push(
        <p key={i} className="font-cormorant italic text-[1.2rem] font-medium mb-5" style={{ color: '#FFFFFF', textShadow: '0 0 4px rgba(255,255,255,0.15)', lineHeight: '1.95', letterSpacing: '0.025em' }} dangerouslySetInnerHTML={{ __html: html }} />
      );
    }
    i++;
  }
  return elements;
};

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const contentRef = useRef(null);

  // Reading progress
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  useEffect(() => {
    fetch(`${API}/api/blogs/${slug}`)
      .then(r => { if (!r.ok) throw new Error('Not found'); return r.json(); })
      .then(setBlog)
      .catch(() => navigate('/blogs'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  if (loading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh', paddingTop: '8rem' }}>
        <div className="max-w-3xl mx-auto px-6 animate-pulse">
          <div className="h-4 rounded mb-6" style={{ background: 'rgba(255,195,0,0.08)', width: '30%' }} />
          <div className="h-8 rounded mb-4" style={{ background: 'rgba(255,195,0,0.1)' }} />
          <div className="h-4 rounded mb-8" style={{ background: 'rgba(255,195,0,0.06)', width: '50%' }} />
          <div style={{ aspectRatio: '16/9', background: 'rgba(255,195,0,0.05)', borderRadius: '2px' }} />
        </div>
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Reading Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 z-[200] h-[2px]"
        style={{
          scaleX,
          transformOrigin: '0%',
          background: 'linear-gradient(90deg, #FFD700, #FFE566)',
        }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden" style={{ padding: '9rem 0 0' }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.05), transparent 60%)' }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mx-auto px-6 lg:px-8"
        >
          
          {/* Back */}
          <Link
            to="/blogs"
            onClick={(e) => {
              e.preventDefault();
              navigate('/blogs');
            }}
            className="inline-flex items-center gap-2 mb-8 font-cormorant italic text-[1.25rem] transition-all duration-300 group cursor-pointer relative z-10"
            style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(255,255,255,0.2)', textDecoration: 'none' }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#FFD700';
              e.currentTarget.style.textShadow = '0 0 8px rgba(255,215,0,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.textShadow = '0 0 6px rgba(255,255,255,0.2)';
            }}
          >
            <svg width="14" height="10" viewBox="0 0 14 10" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="transition-transform duration-300 group-hover:-translate-x-1" style={{ marginRight: '4px' }}><path d="M13 5H1M7 9L1 5l6-4"/></svg>
            Back to Journal
          </Link>


          {/* Category + Meta */}
          <div className="flex items-center gap-3.5 mb-4">
            <span className="font-cinzel text-[0.55rem] tracking-[0.25em] uppercase px-3 py-1 font-bold" style={{ background: 'rgba(255,215,0,0.18)', color: '#FFE566', border: '1px solid #FFD700', textShadow: '0 0 4px rgba(255,229,102,0.35)' }}>{blog.category}</span>
            <span className="font-cinzel text-[0.55rem] tracking-[0.2em] uppercase font-bold" style={{ color: '#FFFFFF', textShadow: '0 0 6px rgba(255,255,255,0.3)' }}>{blog.readTime}</span>
          </div>

          {/* Title */}
          <h1 className="font-playfair font-bold tracking-wider mb-5" style={{ fontSize: 'clamp(1.3rem, 3.2vw, 2.1rem)', color: '#FFFFFF', fontStyle: 'normal', textShadow: '0 0 5px rgba(255,255,255,0.15)', lineHeight: '1.35', letterSpacing: '0.04em' }}>
            {blog.title}
          </h1>

          {/* Author + Date */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(255,195,0,0.2), rgba(255,195,0,0.05))', border: '1px solid rgba(255,195,0,0.3)' }}>
              <span className="font-cinzel text-xs font-bold" style={{ color: '#FFD700' }}>{blog.author?.charAt(0)}</span>
            </div>
            <div>
              <div className="font-cormorant" style={{ color: '#FFD700', fontSize: '20px', fontWeight: 'bold', textShadow: '0 0 6px rgba(255,215,0,0.3)', letterSpacing: '0.02em' }}>{blog.author}</div>
              <div className="font-cormorant italic text-sm font-bold mt-1" style={{ color: '#FFFFFF', textShadow: '0 0 5px rgba(255,255,255,0.25)' }}>
                {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          </div>

          <div className="gold-divider-left mb-8" style={{ width: '80px' }} />
        </motion.div>

        {/* Featured Image */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto px-6 lg:px-8 mb-12"
        >
          <div className="overflow-hidden" style={{ border: '1px solid rgba(255,195,0,0.1)' }}>
            <img src={blog.image} alt={blog.title} className="w-full object-cover" style={{ aspectRatio: '16/9' }} />
          </div>
        </motion.div>
      </section>

      {/* Content */}
      <section ref={contentRef} style={{ padding: '0 0 6rem' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="max-w-3xl mx-auto px-6 lg:px-8"
        >
          {renderContent(blog.content)}
        </motion.div>
      </section>

      {/* Back to Blog CTA */}
      <section className="relative" style={{ padding: '4rem 0 6rem' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="max-w-xl mx-auto px-6 text-center">
          <span className="font-cinzel text-[0.6rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Continue Reading</span>
          <h3 className="font-cinzel font-bold uppercase mt-3 mb-6" style={{ fontSize: '1.3rem', color: '#F8F5F0', letterSpacing: '0.04em' }}>Explore More Articles</h3>
          <Link
            to="/blogs"
            className="btn-outline-gold py-3 px-8 text-xs"
          >
            Back to Journal
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default BlogDetail;
