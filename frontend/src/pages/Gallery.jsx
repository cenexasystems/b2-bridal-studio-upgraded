import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';

const GALLERY_TABS = ['All', 'Bridal', 'Makeup', 'Fashion', 'Embroidery', 'Crafts'];

const GALLERY_IMAGES = [
  { id: 1, src: '/images/bridal1.jpeg', category: 'Bridal', title: 'South Indian Bride' },
  { id: 2, src: '/images/bridal2.jpeg', category: 'Bridal', title: 'Bridal Elegance' },
  { id: 3, src: '/images/bridal3.jpeg', category: 'Bridal', title: 'Traditional Bridal' },
  { id: 4, src: '/images/bridal5.jpeg', category: 'Bridal', title: 'Bridal Makeover' },
  { id: 5, src: '/images/bridal6.jpeg', category: 'Bridal', title: 'Bridal Jewellery Look' },
  { id: 6, src: '/images/bridal4.jpeg', category: 'Makeup', title: 'HD Bridal Makeup' },
  { id: 7, src: '/images/bridal8.jpeg', category: 'Makeup', title: 'Bridal Glow' },
  { id: 8, src: '/images/bridal9.jpeg', category: 'Makeup', title: 'Reception Makeup' },
  { id: 9, src: '/images/bridal10.jpeg', category: 'Makeup', title: 'Pre-Bridal Look' },
  { id: 10, src: '/images/fashion1.jpeg', category: 'Fashion', title: 'Fashion Designing' },
  { id: 11, src: '/images/fashion2.jpeg', category: 'Fashion', title: 'Designer Collection' },
  { id: 12, src: '/images/fashion3.jpeg', category: 'Fashion', title: 'Fashion Showcase' },
  { id: 13, src: '/images/fashion4.jpeg', category: 'Fashion', title: 'Ethnic Wear' },
  { id: 14, src: '/images/fashion5.jpeg', category: 'Fashion', title: 'Bridal Couture' },
  { id: 15, src: '/images/aari1.jpeg', category: 'Embroidery', title: 'Aari Work' },
  { id: 16, src: '/images/aari2.jpeg', category: 'Embroidery', title: 'Zari Embroidery' },
  { id: 17, src: '/images/aari3.jpeg', category: 'Embroidery', title: 'Thread Art' },
  { id: 18, src: '/images/aari4.jpeg', category: 'Embroidery', title: 'Motif Design' },
  { id: 19, src: '/images/aari5.jpeg', category: 'Embroidery', title: 'Designer Embroidery' },
  { id: 20, src: '/images/bakery1.jpeg', category: 'Crafts', title: 'Bakery Creations' },
  { id: 21, src: '/images/bakery2.jpeg', category: 'Crafts', title: 'Cake Art' },
  { id: 22, src: '/images/sareedraping.jpeg', category: 'Fashion', title: 'Saree Draping' },
  { id: 23, src: '/images/bridal7.jpeg', category: 'Bridal', title: 'Maternity Photoshoot' },
  { id: 24, src: '/images/bridal12.jpeg', category: 'Bridal', title: 'Studio Session' },
];

const Gallery = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [lightbox, setLightbox] = useState(null);

  const filtered = activeTab === 'All' ? GALLERY_IMAGES : GALLERY_IMAGES.filter(i => i.category === activeTab);

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero */}
      <div className="page-hero">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Portfolio</span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Our Gallery
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-4" style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.92)' }}>
            A curated showcase of beauty transformations and artistry.
          </motion.p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 pt-8 pb-4">
        <div className="flex flex-wrap justify-center gap-2">
          {GALLERY_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="font-cinzel text-[0.6rem] tracking-[0.15em] uppercase px-4 py-2 transition-all duration-300 rounded-sm"
              style={{
                background: activeTab === tab ? 'rgba(255,195,0,0.15)' : 'transparent',
                border: `1px solid ${activeTab === tab ? 'rgba(255,195,0,0.5)' : 'rgba(255,195,0,0.12)'}`,
                color: activeTab === tab ? '#FFD700' : 'rgba(248,245,240,0.85)',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-8 pb-20">
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="relative group cursor-pointer img-zoom-container"
                style={{ aspectRatio: '1/1', border: '1px solid rgba(255,195,0,0.08)' }}
                onClick={() => setLightbox(item)}
              >
                <img src={item.src} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.3), rgba(255,195,0,0.05))' }}>
                  <span className="font-cinzel text-[0.5rem] tracking-[0.25em] uppercase px-2 py-0.5 mb-1" style={{ background: 'rgba(255,195,0,0.9)', color: '#000' }}>{item.category}</span>
                  <span className="font-playfair text-sm" style={{ color: '#F8F5F0' }}>{item.title}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="lightbox-overlay" onClick={() => setLightbox(null)}>
            <motion.div initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.85, opacity: 0 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="relative max-w-4xl max-h-[85vh] mx-4" onClick={e => e.stopPropagation()}>
              <img src={lightbox.src} alt={lightbox.title} className="w-full h-full object-contain" style={{ maxHeight: '85vh' }} />
              <div className="absolute bottom-0 left-0 right-0 p-4 text-center" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)' }}>
                <span className="font-cinzel text-[0.6rem] tracking-[0.25em] uppercase" style={{ color: '#FFD700' }}>{lightbox.category}</span>
                <span className="mx-3" style={{ color: 'rgba(248,245,240,0.2)' }}>·</span>
                <span className="font-playfair text-sm" style={{ color: '#F8F5F0' }}>{lightbox.title}</span>
              </div>
              <button onClick={() => setLightbox(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', color: '#FFD700', border: '1px solid rgba(255,195,0,0.3)' }}>✕</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;