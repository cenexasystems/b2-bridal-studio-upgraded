import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer, zoomIn } from '../../animations/variants';

const GALLERY_ITEMS = [
  { id: 1, src: '/images/model2.png', category: 'Styling', title: 'Radiant Red Elegance' },
  { id: 2, src: '/images/bridal4.jpeg', category: 'Makeup', title: 'HD Bridal Look' },
  { id: 3, src: '/images/sareedraping.jpeg', category: 'Styling', title: 'Saree Draping' },
  { id: 4, src: '/images/5.jpeg', category: 'Bride', title: 'Makeup' },
  { id: 5, src: '/images/2.jpeg', category: 'Bridal', title: 'Bridal Makeup' },
  { id: 6, src: '/images/4.jpeg', category: 'Reception', title: 'Reception Look' },
  { id: 7, src: '/images/bridal7.jpeg', category: 'Maternity Photoshoot', title: 'Baby Bump' },
  { id: 8, src: '/images/bridal11.jpeg', category: 'Reception', title: 'Bridal Makeup' },
];

const GalleryShowcase = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });
  const [lightbox, setLightbox] = useState(null);

  return (
    <>
      <section id="gallery-showcase" className="relative overflow-hidden" style={{ padding: '4.5rem 0', background: '#000' }}>
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,195,0,0.2), transparent)' }} />

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12" ref={ref}>
          {/* Header */}
          <motion.div variants={staggerContainer} initial="hidden" animate={isInView ? 'visible' : 'hidden'} className="text-center mb-14">
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
              <div className="gold-divider" style={{ width: '40px' }} />
              <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Our Artistry</span>
              <div className="gold-divider" style={{ width: '40px' }} />
            </motion.div>
            <motion.h2 variants={fadeUp} className="font-cinzel font-bold uppercase mb-4" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.05em', color: '#F8F5F0' }}>
              Gallery of Excellence
            </motion.h2>
            <motion.p variants={fadeUp} className="font-cormorant italic" style={{ fontSize: '1.1rem', color: 'rgba(248,245,240,0.92)' }}>
              A glimpse into the transformations we create every day.
            </motion.p>
          </motion.div>

          {/* Editorial Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
            {GALLERY_ITEMS.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-5%' }}
                transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                className="relative group cursor-pointer img-zoom-container"
                style={{ aspectRatio: '3/4', border: '1px solid rgba(255,195,0,0.1)' }}
                onClick={() => setLightbox(item)}
              >
                <img
                  src={item.src}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'top center' }}
                  loading="lazy"
                />
                {/* Gold hover overlay */}
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500"
                  style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(255,195,0,0.1) 100%)' }}
                >
                  <span className="font-cinzel text-[0.6rem] tracking-[0.3em] uppercase px-3 py-1.5 mb-2" style={{ background: 'rgba(255,195,0,0.9)', color: '#000', fontWeight: 700 }}>
                    {item.category}
                  </span>
                  <span className="font-playfair text-sm font-medium" style={{ color: '#F8F5F0' }}>
                    {item.title}
                  </span>
                  {/* Expand icon */}
                  <div className="mt-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(248,245,240,0.4)' }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="#F8F5F0" strokeWidth="1.2">
                      <path d="M1 1h4M1 1v4M11 11H7M11 11V7" strokeLinecap="round" />
                    </svg>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* View Full Gallery CTA */}
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="text-center mt-10">
            <a href="/gallery" className="btn-outline-gold py-2 text-xs">
              View Full Gallery
            </a>
          </motion.div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lightbox-overlay"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative max-w-4xl max-h-[85vh] mx-4"
              onClick={e => e.stopPropagation()}
            >
              <img src={lightbox.src} alt={lightbox.title} className="w-full h-full object-contain" style={{ maxHeight: '85vh' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                <span className="font-cinzel text-[0.6rem] tracking-[0.25em] uppercase" style={{ color: '#FFD700' }}>{lightbox.category}</span>
                <span className="mx-3" style={{ color: 'rgba(248,245,240,0.2)' }}>·</span>
                <span className="font-playfair text-sm" style={{ color: '#F8F5F0' }}>{lightbox.title}</span>
              </div>
              <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', color: '#FFD700', border: '1px solid rgba(255,195,0,0.3)' }}>
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default GalleryShowcase;
