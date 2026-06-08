import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';

const GALLERY_TABS = ['All', 'Bridal', 'Makeup', 'Fashion', 'Embroidery', 'Crafts'];

const GALLERY_IMAGES = [
  { id: 57, src: '/images/model1.jpg', category: 'Bridal', title: 'Glamour in Red' },
  { id: 58, src: '/images/model2.png', category: 'Bridal', title: 'Radiant Red Elegance' },
  { id: 59, src: '/images/model3.png', category: 'Bridal', title: 'Midnight Sequin Glam' },
  { id: 60, src: '/images/model4.png', category: 'Bridal', title: 'Couture Red Pose' },
  { id: 1, src: '/images/1.jpeg', category: 'Bridal', title: 'Exquisite Bridal Artistry' },
  { id: 2, src: '/images/2.jpeg', category: 'Bridal', title: 'Royal Grace' },
  { id: 3, src: '/images/3.jpeg', category: 'Bridal', title: 'Shining Elegance' },
  { id: 4, src: '/images/4.jpeg', category: 'Bridal', title: 'Divine Bridal Look' },
  { id: 5, src: '/images/5.jpeg', category: 'Bridal', title: 'Couture Glamour' },
  { id: 6, src: '/images/bridal1.jpeg', category: 'Bridal', title: 'South Indian Bride' },
  { id: 7, src: '/images/bridal2.jpeg', category: 'Bridal', title: 'Bridal Elegance' },
  { id: 8, src: '/images/bridal3.jpeg', category: 'Bridal', title: 'Traditional Bridal' },
  { id: 9, src: '/images/bridal5.jpeg', category: 'Bridal', title: 'Bridal Makeover' },
  { id: 10, src: '/images/bridal6.jpeg', category: 'Bridal', title: 'Bridal Jewellery Look' },
  { id: 11, src: '/images/bridal4.jpeg', category: 'Makeup', title: 'HD Bridal Makeup' },
  { id: 12, src: '/images/bridal8.jpeg', category: 'Makeup', title: 'Bridal Glow' },
  { id: 13, src: '/images/bridal9.jpeg', category: 'Makeup', title: 'Reception Makeup' },
  { id: 14, src: '/images/bridal10.jpeg', category: 'Makeup', title: 'Pre-Bridal Look' },
  { id: 15, src: '/images/fashion1.jpeg', category: 'Fashion', title: 'Fashion Designing' },
  { id: 16, src: '/images/fashion2.jpeg', category: 'Fashion', title: 'Designer Collection' },
  { id: 17, src: '/images/fashion3.jpeg', category: 'Fashion', title: 'Fashion Showcase' },
  { id: 18, src: '/images/fashion4.jpeg', category: 'Fashion', title: 'Ethnic Wear' },
  { id: 19, src: '/images/fashion5.jpeg', category: 'Fashion', title: 'Bridal Couture' },
  { id: 20, src: '/images/aari1.jpeg', category: 'Embroidery', title: 'Aari Work' },
  { id: 21, src: '/images/aari2.jpeg', category: 'Embroidery', title: 'Zari Embroidery' },
  { id: 22, src: '/images/aari3.jpeg', category: 'Embroidery', title: 'Thread Art' },
  { id: 23, src: '/images/aari4.jpeg', category: 'Embroidery', title: 'Motif Design' },
  { id: 24, src: '/images/aari5.jpeg', category: 'Embroidery', title: 'Designer Embroidery' },
  { id: 25, src: '/images/bakery1.jpeg', category: 'Crafts', title: 'Bakery Creations' },
  { id: 26, src: '/images/bakery2.jpeg', category: 'Crafts', title: 'Cake Art' },
  { id: 27, src: '/images/sareedraping.jpeg', category: 'Fashion', title: 'Saree Draping' },
  { id: 28, src: '/images/bridal7.jpeg', category: 'Bridal', title: 'Maternity Photoshoot' },
  { id: 29, src: '/images/bridal12.jpeg', category: 'Bridal', title: 'Studio Session' },
  { id: 30, src: '/images/bridal11.jpeg', category: 'Bridal', title: 'Bridal Reception Look' },
  { id: 31, src: '/images/bride13.jpeg', category: 'Bridal', title: 'Elegance in Red' },
  { id: 32, src: '/images/bride14.jpeg', category: 'Bridal', title: 'Golden Bridal Glow' },
  { id: 33, src: '/images/bride15.jpeg', category: 'Bridal', title: 'Classic Bridal Smile' },
  { id: 34, src: '/images/bride16.jpeg', category: 'Bridal', title: 'Traditional Bridal Ceremony' },
  { id: 35, src: '/images/fashion6.jpeg', category: 'Fashion', title: 'Designer Indian Silk' },
  { id: 36, src: '/images/fashion.jpeg', category: 'Fashion', title: 'Vibrant Silhouette' },
  { id: 37, src: '/images/SareeDrap1.jpeg', category: 'Fashion', title: 'Traditional Saree Draping' },
  { id: 38, src: '/images/sareedrap2.jpeg', category: 'Fashion', title: 'Elegant Saree Style' },
  { id: 39, src: '/images/aari6.jpeg', category: 'Embroidery', title: 'Bridal Sleeve Beadwork' },
  { id: 40, src: '/images/aari7.jpeg', category: 'Embroidery', title: 'Peacock Aari Design' },
  { id: 41, src: '/images/aari8.jpeg', category: 'Embroidery', title: 'Intricate Blouse Embroidery' },
  { id: 42, src: '/images/aari9.jpeg', category: 'Embroidery', title: 'Flora & Zardozi' },
  { id: 43, src: '/images/aari10.jpeg', category: 'Embroidery', title: 'Precision Stitching' },
  { id: 44, src: '/images/aari11.jpeg', category: 'Embroidery', title: 'Custom Bridal Embroidery' },
  { id: 45, src: '/images/aari12.jpeg', category: 'Embroidery', title: 'Premium Golden Zari' },
  { id: 46, src: '/images/aari13.jpeg', category: 'Embroidery', title: 'Delicate Threadwork' },
  { id: 47, src: '/images/aari14.jpeg', category: 'Embroidery', title: 'Elegant Bead Detailing' },
  { id: 48, src: '/images/aari15.jpeg', category: 'Embroidery', title: 'Masterpiece Aari Art' },
  { id: 49, src: '/images/aari16.jpeg', category: 'Embroidery', title: 'Sleeve Border Design' },
  { id: 50, src: '/images/aari17.jpeg', category: 'Embroidery', title: 'Elaborate Handwork' },
  { id: 51, src: '/images/aari18.jpeg', category: 'Embroidery', title: 'Creative Zardozi Motif' },
  { id: 52, src: '/images/aari19.jpeg', category: 'Embroidery', title: 'Heavy Bridal Detailing' },
  { id: 53, src: '/images/aari20.jpeg', category: 'Embroidery', title: 'Stone Work Embroidery' },
  { id: 54, src: '/images/aari21.jpeg', category: 'Embroidery', title: 'Aari Craftsmanship' },
  { id: 55, src: '/images/embroidary.jpeg', category: 'Embroidery', title: 'Classic Embroidery Pattern' },
  { id: 56, src: '/images/bakery3.jpeg', category: 'Crafts', title: 'Artisanal Cake Design' },
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
        <motion.div layout className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" style={{ alignItems: 'start' }}>
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
                style={{ aspectRatio: '3/4', border: '1px solid rgba(255,195,0,0.08)' }}
                onClick={() => setLightbox(item)}
              >
                <img src={item.src} alt={item.title} className="w-full h-full object-cover" style={{ objectPosition: 'top center' }} loading="lazy" />
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