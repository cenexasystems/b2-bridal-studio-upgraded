import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';
import { useCart } from '../context/CartContext';
const API = import.meta.env.VITE_API_URL;
const DEMO_PRODUCTS = [
  { _id: 'p1', name: 'Bridal Makeup Kit Pro', category: 'Makeup', price: 4999, image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p2', name: 'Silk Thread Jhumka Set', category: 'Jewellery', price: 799, image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p3', name: 'Aari Embroidery Frame', category: 'Tools', price: 1499, image: 'https://images.unsplash.com/photo-1597696929736-6d13bed8e6a8?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p4', name: 'Gold Leaf Nail Art Kit', category: 'Nails', price: 999, image: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p5', name: 'Mehandi Cone Premium Pack', category: 'Mehandi', price: 599, image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p6', name: 'Hair Styling Tools Bundle', category: 'Hair', price: 3499, image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p7', name: 'Kundan Making Kit', category: 'Jewellery', price: 1299, image: 'https://images.unsplash.com/photo-1515562141589-67f0d569b41e?auto=format&fit=crop&w=600&q=80' },
  { _id: 'p8', name: 'Bridal Skincare Collection', category: 'Skincare', price: 2999, image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?auto=format&fit=crop&w=600&q=80' },
];

const Products = () => {
  const [products, setProducts] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [toast, setToast] = useState(null);
  const { addToCart, removeFromCart, items, openCart } = useCart();

  useEffect(() => {
    axios.get(`${API}/api/products`)
      .then(res => setProducts(res.data.length > 0 ? res.data : DEMO_PRODUCTS))
      .catch(() => setProducts(DEMO_PRODUCTS));
  }, []);

  const isInCart = (id) => items.some(i => (i._id || i.id) === id);

  const handleQuantityChange = (id, delta) => {
    setQuantities(prev => {
      const current = prev[id] || 1;
      const next = current + delta;
      return { ...prev, [id]: next < 1 ? 1 : next };
    });
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product._id] || 1;
    addToCart(product, qty);
    
    const id = Date.now();
    setToast({ message: `${product.name} (Qty: ${qty}) added to cart`, id });
    setTimeout(() => {
      setToast(current => current?.id === id ? null : current);
    }, 3000);
  };

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero Banner */}
      <div className="page-hero">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>Shop</span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Exclusive Products
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-4" style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.7)' }}>
            Premium beauty tools and artistry supplies, handpicked by our experts.
          </motion.p>
        </motion.div>
      </div>

      {/* Product Grid */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-16 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, i) => {
            const inCart = isInCart(product._id);
            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="card-luxury rounded-sm group"
              >
                {/* Image */}
                <div className="img-zoom-container relative" style={{ height: '240px' }}>
                  <img
                    src={product.image || 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80'}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)' }} />

                  {/* Quick add overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                    {!inCart && (
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="px-6 py-2 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase transition-all"
                        style={{ background: 'rgba(255,195,0,0.95)', color: '#000' }}
                      >
                        Quick Add
                      </button>
                    )}
                  </div>

                  {/* Category badge */}
                  <span className="absolute top-3 left-3 font-cinzel text-[0.5rem] tracking-[0.2em] uppercase px-2 py-1" style={{ background: 'rgba(0,0,0,0.7)', color: '#FFD700', border: '1px solid rgba(255,195,0,0.2)' }}>
                    {product.category}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col justify-between" style={{ minHeight: '160px' }}>
                  <div>
                    <h3 className="font-playfair text-sm mb-2 leading-tight" style={{ color: '#F8F5F0' }}>{product.name}</h3>
                    <span className="font-cinzel text-sm block mb-3" style={{ color: '#FFD700' }}>₹{product.price?.toLocaleString()}</span>
                  </div>
                  
                  {/* Quantity & Add to Cart */}
                  {!inCart ? (
                    <div className="flex flex-col gap-3 mt-auto pt-3" style={{ borderTop: '1px solid rgba(255,195,0,0.1)' }}>
                      <div className="flex items-center justify-between">
                        <span className="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase" style={{ color: 'rgba(248,245,240,0.7)' }}>Quantity</span>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleQuantityChange(product._id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors"
                            style={{ border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,195,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            −
                          </button>
                          <span className="font-cinzel text-xs w-4 text-center" style={{ color: '#F8F5F0' }}>
                            {quantities[product._id] || 1}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(product._id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded-sm transition-colors"
                            style={{ border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700' }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,195,0,0.1)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase transition-all rounded-sm"
                        style={{ background: 'linear-gradient(135deg, #FFED8A, #FFD700, #FFCA28, #E5A100)', border: 'none', color: '#000', fontWeight: 700, boxShadow: '0 2px 10px rgba(255,195,0,0.25)' }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 25px rgba(255,215,0,0.5), 0 4px 16px rgba(255,195,0,0.25)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 10px rgba(255,195,0,0.25)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                      >
                        Add to Cart
                      </button>
                    </div>
                  ) : (
                    <div className="mt-auto pt-3 flex gap-2" style={{ borderTop: '1px solid rgba(255,195,0,0.1)' }}>
                      <span
                        className="flex-1 py-2 font-cinzel text-[0.6rem] tracking-[0.15em] uppercase flex items-center justify-center gap-1.5 rounded-sm"
                        style={{ background: 'rgba(255,195,0,0.12)', border: '1px solid rgba(255,195,0,0.25)', color: '#FFD700', fontWeight: 700 }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12l5 5L19 7" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        Added
                      </span>
                      <button
                        onClick={() => removeFromCart(product._id)}
                        className="px-3 py-2 font-cinzel text-[0.6rem] tracking-[0.1em] uppercase flex items-center justify-center gap-1.5 rounded-sm transition-all"
                        style={{ background: 'transparent', color: '#f87171', fontWeight: 700, border: '1px solid rgba(248,113,113,0.3)' }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(248,113,113,0.1)'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.5)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.3)'; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-8 left-1/2 z-[250] px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl w-max max-w-[90vw]"
            style={{
              background: 'rgba(5,5,3,0.98)',
              border: '1px solid rgba(255,195,0,0.3)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,195,0,0.2)' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="font-playfair text-sm" style={{ color: '#F8F5F0' }}>{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;