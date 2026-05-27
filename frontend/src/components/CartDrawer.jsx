import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

const CartDrawer = () => {
  const { items, itemCount, subtotal, total, isOpen, closeCart, removeFromCart, updateQuantity } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="cart-drawer-backdrop"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[200] w-[380px] max-w-[90vw] flex flex-col"
            style={{
              background: 'rgba(5,5,3,0.98)',
              borderLeft: '1px solid rgba(255,195,0,0.15)',
              backdropFilter: 'blur(20px)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,195,0,0.1)' }}>
              <div className="flex items-center gap-3">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                <span className="font-cinzel text-xs tracking-[0.25em] uppercase" style={{ color: '#FFD700' }}>
                  Your Cart
                </span>
                {itemCount > 0 && (
                  <span className="font-cinzel text-[0.6rem] px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,195,0,0.15)', color: '#FFD700' }}>
                    {itemCount}
                  </span>
                )}
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 flex items-center justify-center transition-colors"
                style={{ color: 'rgba(248,245,240,0.5)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,245,240,0.5)'}
              >
                ✕
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,195,0,0.2)" strokeWidth="1">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                    <line x1="3" y1="6" x2="21" y2="6"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                  </svg>
                  <p className="font-cormorant italic mt-4" style={{ color: 'rgba(248,245,240,0.4)', fontSize: '1.05rem' }}>
                    Your cart is empty
                  </p>
                  <button
                    onClick={closeCart}
                    className="mt-4 font-cinzel text-[0.6rem] tracking-[0.2em] uppercase"
                    style={{ color: '#FFD700' }}
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map(item => (
                    <div
                      key={item._id || item.id}
                      className="flex gap-3 pb-4"
                      style={{ borderBottom: '1px solid rgba(255,195,0,0.06)' }}
                    >
                      {/* Thumbnail */}
                      {item.image && (
                        <div className="w-16 h-16 flex-shrink-0 rounded overflow-hidden" style={{ border: '1px solid rgba(255,195,0,0.1)' }}>
                          <img 
                            src={item.image.startsWith('data:') || item.image.startsWith('http') ? item.image : `${API}/uploads/${item.image}`} 
                            alt={item.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-playfair text-sm leading-tight truncate" style={{ color: '#F8F5F0' }}>
                          {item.name}
                        </h4>
                        <p className="font-cinzel text-xs mt-1" style={{ color: '#FFD700' }}>
                          ₹{item.price}
                        </p>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs"
                            style={{ border: '1px solid rgba(255,195,0,0.2)', color: 'rgba(248,245,240,0.6)' }}
                          >
                            −
                          </button>
                          <span className="font-cinzel text-xs w-6 text-center" style={{ color: '#F8F5F0' }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                            className="w-6 h-6 flex items-center justify-center text-xs"
                            style={{ border: '1px solid rgba(255,195,0,0.2)', color: 'rgba(248,245,240,0.6)' }}
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart(item._id || item.id)}
                        className="self-start mt-1 transition-colors"
                        style={{ color: 'rgba(248,245,240,0.3)' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                        onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,245,240,0.3)'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer — totals & checkout */}
            {items.length > 0 && (
              <div className="px-6 py-5" style={{ borderTop: '1px solid rgba(255,195,0,0.12)' }}>
                <div className="flex flex-col gap-2 mb-4">
                  <div className="flex justify-between font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-cinzel text-sm tracking-wider pt-2" style={{ color: '#F8F5F0', borderTop: '1px solid rgba(255,195,0,0.1)' }}>
                    <span>Total</span>
                    <span style={{ color: '#FFD700' }}>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const user = JSON.parse(localStorage.getItem('user') || 'null');
                    if (!user) {
                      alert('Please login to continue');
                      window.location.href = '/login';
                      return;
                    }
                    
                    let message = `*Product Enquiry*\n\n*Customer:* ${user.name}\nPhone: ${user.phone}\nEmail: ${user.email}\n\n*Products:*\n`;
                    items.forEach(item => {
                      message += `- ${item.name} — Qty: ${item.quantity} — ₹${item.price}\n`;
                    });
                    message += `\n*Total Amount:* ₹${total.toFixed(2)}\n\nPlease contact me regarding availability and payment.`;
                    
                    window.open(`https://wa.me/919361527951?text=${encodeURIComponent(message)}`, '_blank');
                    closeCart();
                    // clearCart(); // Optional: We can keep the items in cart if they just enquired
                  }}
                  className="w-full py-3 flex items-center justify-center gap-2 font-cinzel text-xs tracking-[0.15em] uppercase transition-all duration-300"
                  style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#FFF', borderRadius: '2px', fontWeight: 700 }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(37,211,102,0.4)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                  Enquire via WhatsApp
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
