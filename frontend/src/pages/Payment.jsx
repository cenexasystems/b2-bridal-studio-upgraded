import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fadeUp, staggerContainer } from '../animations/variants';

const UPI_ID = 'b2bridalstudio@sbi';
const API = import.meta.env.VITE_API_URL;

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, subtotal: cartSubtotal, gst: cartGst, total: cartTotal } = useCart();

  // Support both Cart flow and Direct Service flow
  const serviceData = location.state?.serviceData;
  const items = cartItems.length > 0 ? cartItems : (serviceData?.items || []);
  const subtotal = cartItems.length > 0 ? cartSubtotal : (serviceData?.subtotal || 0);
  const gst = cartItems.length > 0 ? cartGst : (serviceData?.gstTotal || 0);
  const total = cartItems.length > 0 ? cartTotal : (serviceData?.total || 0);
  const isServiceFlow = cartItems.length === 0 && !!serviceData;

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) return;
    
    try {
      const res = await axios.post(`${API}/api/coupons/validate`, { code: couponCode });
      const discountPercentage = res.data.discountPercentage;
      const discountAmount = total * (discountPercentage / 100);
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discountPercentage,
        discountAmount,
        finalAmount: total - discountAmount
      });
      setCouponSuccess('Coupon applied successfully');
    } catch (err) {
      setCouponError(err.response?.data?.error || 'Invalid coupon');
      setAppliedCoupon(null);
    }
  };

  // Redirect if both are empty
  if (items.length === 0) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center px-6">
          <span className="text-5xl block mb-6">🛒</span>
          <h2 className="font-cinzel text-lg tracking-[0.1em] uppercase mb-3" style={{ color: '#F8F5F0' }}>Your Cart is Empty</h2>
          <p className="font-cormorant italic mb-6" style={{ color: 'rgba(248,245,240,0.4)' }}>Add services or products before proceeding to payment.</p>
          <Link to="/services" className="btn-gold py-3 px-8 text-xs">Browse Services</Link>
        </div>
      </div>
    );
  }

  const finalAmount = appliedCoupon ? appliedCoupon.finalAmount : total;
  const upiUri = `upi://pay?pa=${UPI_ID}&pn=B2%20Bridal%20Studio&am=${finalAmount.toFixed(2)}&cu=INR`;

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ padding: '9rem 0 4rem' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.06), transparent 60%)' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #FFD700)' }} />
            <span className="font-cinzel text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: '#FFD700' }}>Step 1 of 2</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Make Payment
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-3" style={{ fontSize: '1.1rem', color: 'rgba(248,245,240,0.5)' }}>
            Scan the QR code or use the UPI ID below to complete your payment
          </motion.p>
        </motion.div>
      </section>

      {/* Content */}
      <section style={{ padding: '0 0 6rem' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* QR Code & UPI */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="glass-dark p-8 rounded-sm text-center"
            style={{ border: '1px solid rgba(255,195,0,0.15)' }}
          >
            <span className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase block mb-6" style={{ color: '#FFD700' }}>Scan to Pay</span>
            
            {/* QR Code */}
            <div className="mx-auto mb-6 p-2 inline-block rounded-sm" style={{ background: '#fff' }}>
              <img src="/images/b2-qr.jpg" alt="B2 Bridal Studio QR Code" style={{ width: '220px', height: 'auto', display: 'block' }} />
            </div>

            <div className="gold-divider mb-6" />

            {/* UPI ID */}
            <div className="mb-6">
              <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>UPI ID</span>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="font-inter text-base font-medium" style={{ color: '#FFD700' }}>{UPI_ID}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(UPI_ID); }}
                  className="px-3 py-1 font-cinzel text-[0.5rem] tracking-[0.15em] uppercase transition-all cursor-pointer"
                  style={{ border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700' }}
                >
                  Copy
                </button>
              </div>

              {/* GPay Number */}
              <span className="font-cinzel text-[0.5rem] tracking-[0.2em] uppercase block mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>GPay Number</span>
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="font-inter text-base font-medium" style={{ color: '#FFD700' }}>9840551365</span>
                <button
                  onClick={() => { navigator.clipboard.writeText('9840551365'); }}
                  className="px-3 py-1 font-cinzel text-[0.5rem] tracking-[0.15em] uppercase transition-all cursor-pointer"
                  style={{ border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700' }}
                >
                  Copy
                </button>
              </div>

              <div className="gold-divider mb-4" />

              <a
                href={upiUri}
                className="btn-gold w-full justify-center py-3 text-xs tracking-wider flex items-center gap-2 mb-2"
                style={{
                  background: 'linear-gradient(135deg, #FFED8A 0%, #FFD700 35%, #FFCA28 65%, #E5A100 100%)',
                  color: '#000',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(255, 195, 0, 0.25)',
                }}
              >
                Tap to Pay via UPI
              </a>
              <span className="font-cormorant italic text-[0.7rem] block text-center" style={{ color: 'rgba(248,245,240,0.45)' }}>
                Opens Google Pay, PhonePe, or Paytm on mobile devices
              </span>
            </div>

            <div className="p-4 rounded-sm" style={{ background: 'rgba(255,195,0,0.05)', border: '1px solid rgba(255,195,0,0.1)' }}>
              <p className="font-cormorant italic text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                After making the payment, click "Confirm Booking" to submit your booking details and payment proof.
              </p>
            </div>
          </motion.div>

          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="glass-dark p-8 rounded-sm flex flex-col"
            style={{ border: '1px solid rgba(255,195,0,0.15)' }}
          >
            <span className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase block mb-6" style={{ color: '#FFD700' }}>Order Summary</span>

            <div className="flex-1 overflow-y-auto mb-6" style={{ maxHeight: '300px' }}>
              {items.map(item => (
                <div key={item._id || item.id} className="flex justify-between items-center py-3" style={{ borderBottom: '1px solid rgba(255,195,0,0.06)' }}>
                  <div>
                    <span className="font-cormorant text-sm block" style={{ color: '#F8F5F0' }}>{item.name}</span>
                    <span className="font-cinzel text-[0.5rem] tracking-[0.1em]" style={{ color: 'rgba(255,195,0,0.4)' }}>Qty: {item.quantity}</span>
                  </div>
                  <span className="font-cinzel text-sm" style={{ color: '#FFD700' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,195,0,0.1)' }}>
              <div className="flex justify-between font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              {/* Show GST when applicable */}
              {gst > 0 && (
                <div className="flex justify-between font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                  <span>GST</span><span>₹{gst.toFixed(2)}</span>
                </div>
              )}

              {/* Coupon Section (Only for Services) */}
              {isServiceFlow && (
                <div className="pt-2 pb-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="flex-1 px-3 py-2 bg-black/50 border outline-none text-sm font-cinzel text-white uppercase"
                      style={{ borderColor: 'rgba(255,195,0,0.3)' }}
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 font-cinzel text-xs tracking-wider"
                      style={{ background: 'rgba(255,195,0,0.1)', color: '#FFD700', border: '1px solid rgba(255,195,0,0.3)' }}
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-red-500 text-xs mt-1 italic font-cormorant">{couponError}</p>}
                  {couponSuccess && <p className="text-green-500 text-xs mt-1 italic font-cormorant">{couponSuccess}</p>}
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between font-cormorant text-sm text-green-500">
                  <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                  <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between font-cinzel text-base pt-2" style={{ borderTop: '1px solid rgba(255,195,0,0.08)', color: '#F8F5F0' }}>
                <span>Total</span>
                <span style={{ color: '#FFD700' }}>
                  ₹{(appliedCoupon ? appliedCoupon.finalAmount : total).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/confirm-booking', { state: { serviceData: { ...serviceData, coupon: appliedCoupon } } })}
              className="btn-gold w-full justify-center mt-8 py-4"
            >
              Confirm Booking
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Payment;
