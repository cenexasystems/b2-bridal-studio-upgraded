import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { fadeUp, staggerContainer } from '../animations/variants';
import { UploadCloud, FileText, Check } from 'lucide-react';

const API = import.meta.env.VITE_API_URL;

const HOUR_LABELS = { '10':'10 AM','11':'11 AM','12':'12 PM','13':'1 PM','14':'2 PM','15':'3 PM','16':'4 PM','17':'5 PM','18':'6 PM','19':'7 PM' };

const ConfirmBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { items: cartItems, total: cartTotal, clearCart } = useCart();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Support direct service flow (via serviceData) AND cart flow
  const serviceData = location.state?.serviceData || null;
  const isServiceFlow = !!serviceData && cartItems.length === 0;
  const items = isServiceFlow ? (serviceData.items || []) : cartItems;
  const total = isServiceFlow ? (serviceData.total || 0) : cartTotal;
  const gstTotal = items.reduce((sum, i) => {
    const gstPercent = i.gstPercentage || 0;
    if (gstPercent > 0) {
      const finalPrice = i.price * (i.quantity || 1);
      const base = finalPrice / (1 + gstPercent / 100);
      return sum + (finalPrice - base);
    }
    return sum;
  }, 0);
  const appliedCoupon = serviceData?.coupon || null;

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    upiId: '',
    transactionId: '',
    branch: serviceData?.branch || 'Chennai',
  });
  const [paymentProof, setPaymentProof] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit WhatsApp number';
    if (!form.upiId.trim()) e.upiId = 'UPI ID is required';
    if (!form.transactionId.trim()) e.transactionId = 'Transaction ID is required';
    if (!paymentProof) e.paymentProof = 'Payment proof is required';
    if (items.length === 0) e.items = 'Cart is empty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Build dateTime: use chosen slot from serviceData, else current time
    const dateTime = (serviceData?.date && serviceData?.hour)
      ? `${serviceData.date}T${String(serviceData.hour).padStart(2, '0')}:00:00`
      : new Date().toISOString();

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', form.name);
      formData.append('phone', form.phone);
      formData.append('upiId', form.upiId);
      formData.append('transactionId', form.transactionId);
      formData.append('branch', form.branch);
      formData.append('userId', user?.email || '');
      formData.append('email', user?.email || '');
      formData.append('total', total);
      formData.append('gstAmount', appliedCoupon ? gstTotal * (appliedCoupon.finalAmount / total) : gstTotal);
      if (appliedCoupon) {
        formData.append('couponCode', appliedCoupon.code);
        formData.append('discountPercentage', appliedCoupon.discountPercentage);
        formData.append('discountAmount', appliedCoupon.discountAmount);
        formData.append('finalAmount', appliedCoupon.finalAmount);
      } else {
        formData.append('finalAmount', total);
      }
      formData.append('dateTime', dateTime);
      formData.append('items', JSON.stringify(items.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        gstPercentage: i.gstPercentage || 0
      }))));
      formData.append('paymentProof', paymentProof);

      const response = await fetch(`${API}/api/bookings`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      clearCart();
      localStorage.removeItem('services_cart');
      localStorage.removeItem('services_bookingDate');
      localStorage.removeItem('services_bookingTime');
      localStorage.removeItem('services_bookingBranch');
      navigate('/profile');
    } catch (err) {
      alert(`Failed to submit booking: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !loading) {
    return (
      <div style={{ background: '#000', minHeight: '100vh' }} className="flex items-center justify-center">
        <div className="text-center px-6">
          <span className="text-5xl block mb-6">🛒</span>
          <h2 className="font-cinzel text-lg tracking-[0.1em] uppercase mb-3" style={{ color: '#F8F5F0' }}>No Items in Cart</h2>
          <p className="font-cormorant italic mb-6" style={{ color: 'rgba(248,245,240,0.4)' }}>Please add items before confirming a booking.</p>
          <a href="/services" className="btn-gold py-3 px-8 text-xs">Browse Services</a>
        </div>
      </div>
    );
  }

  // Format scheduled slot label for display
  const scheduledLabel = (serviceData?.date && serviceData?.hour)
    ? `${new Date(serviceData.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} at ${HOUR_LABELS[serviceData.hour] || serviceData.hour}`
    : null;

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ padding: '9rem 0 4rem' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.06), transparent 60%)' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #FFD700)' }} />
            <span className="font-cinzel text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: '#FFD700' }}>Step 2 of 2</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Confirm Your Booking
          </motion.h1>
        </motion.div>
      </section>

      {/* Form */}
      <section style={{ padding: '0 0 6rem' }}>
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Form Fields */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-3 glass-dark p-8 rounded-sm"
            style={{ border: '1px solid rgba(255,195,0,0.15)' }}
          >
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-6 pb-4" style={{ color: '#FFD700', borderBottom: '1px solid rgba(255,195,0,0.1)' }}>Booking Details</h2>

            <div className="flex flex-col gap-5">
              {/* Name */}
              <div>
                <label className="block font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>Full Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-luxury rounded-sm" placeholder="Your full name" />
                {errors.name && <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>{errors.name}</span>}
              </div>

              {/* Phone */}
              <div>
                <label className="block font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>WhatsApp Number *</label>
                <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value.replace(/\D/g, '').slice(0,10)})} className="input-luxury rounded-sm" placeholder="10-digit number" maxLength={10} />
                {errors.phone && <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>{errors.phone}</span>}
              </div>

              {/* UPI ID */}
              <div>
                <label className="block font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>Your UPI ID *</label>
                <input type="text" value={form.upiId} onChange={e => setForm({...form, upiId: e.target.value})} className="input-luxury rounded-sm" placeholder="yourname@upi" />
                {errors.upiId && <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>{errors.upiId}</span>}
              </div>

              {/* Transaction ID */}
              <div>
                <label className="block font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>Transaction ID *</label>
                <input type="text" value={form.transactionId} onChange={e => setForm({...form, transactionId: e.target.value})} className="input-luxury rounded-sm" placeholder="UPI transaction reference" />
                {errors.transactionId && <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>{errors.transactionId}</span>}
              </div>

              {/* Branch */}
              <div>
                <label className="block font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>Branch *</label>
                <select value={form.branch} onChange={e => setForm({...form, branch: e.target.value})} className="input-luxury rounded-sm" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <option value="Chennai" style={{ background: '#111' }}>Chennai</option>
                  <option value="Madurai" style={{ background: '#111' }}>Madurai</option>
                </select>
              </div>

              {/* Payment Proof */}
              <div>
                <label className="block font-cinzel text-[0.55rem] tracking-[0.2em] uppercase mb-2" style={{ color: 'rgba(255,195,0,0.5)' }}>Payment Proof (Screenshot/PDF) *</label>
                
                <label 
                  htmlFor="paymentProofInput"
                  className="relative flex flex-col items-center justify-center min-h-[160px] p-6 rounded-sm cursor-pointer transition-all duration-300 group border"
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderColor: errors.paymentProof ? '#ef4444' : 'rgba(255, 195, 0, 0.25)',
                    borderStyle: 'dashed'
                  }}
                >
                  <input
                    id="paymentProofInput"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        setPaymentProof(file);
                        if (file.type.startsWith('image/')) {
                          setPreviewUrl(URL.createObjectURL(file));
                        } else {
                          setPreviewUrl(null);
                        }
                      }
                    }}
                    className="hidden"
                  />

                  {paymentProof ? (
                    <div className="flex flex-col items-center text-center gap-3 w-full">
                      {/* Image preview or Doc indicator */}
                      {previewUrl ? (
                        <div className="relative w-20 h-20 rounded-md overflow-hidden border border-amber-500/30 bg-black/40 flex items-center justify-center">
                          <img
                            src={previewUrl}
                            alt="Payment Proof Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-500/10 rounded-full border border-amber-500/20 text-amber-400">
                          <FileText size={28} />
                        </div>
                      )}

                      {/* File Details */}
                      <div className="max-w-full px-2">
                        <p className="text-xs font-medium text-amber-300 truncate max-w-[250px] md:max-w-[320px] mb-1">
                          {paymentProof.name}
                        </p>
                        <p className="text-[0.65rem]" style={{ color: 'rgba(248, 245, 240, 0.4)' }}>
                          {(paymentProof.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>

                      {/* Success Badge */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400">
                        <Check size={12} className="stroke-[3]" />
                        <span className="font-cinzel text-[0.55rem] tracking-wider uppercase font-bold">Selected</span>
                      </div>

                      {/* Tap to change text */}
                      <p className="text-[0.6rem] uppercase tracking-widest text-amber-500/60 group-hover:text-amber-400 transition-colors mt-1 font-semibold">
                        Tap again to change file
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center gap-3">
                      {/* Upload Icon */}
                      <div className="p-4 bg-amber-500/5 group-hover:bg-amber-500/10 border border-amber-500/10 group-hover:border-amber-500/30 rounded-full text-amber-400/80 group-hover:text-amber-300 transition-all duration-300 shadow-[0_0_15px_rgba(255,195,0,0.02)] group-hover:shadow-[0_0_20px_rgba(255,195,0,0.08)]">
                        <UploadCloud size={28} className="transition-transform duration-300 group-hover:-translate-y-0.5" />
                      </div>

                      {/* Description */}
                      <div>
                        <p className="font-cinzel text-xs tracking-wider font-semibold text-amber-400 group-hover:text-amber-300 transition-colors mb-1">
                          Upload Payment Screenshot
                        </p>
                        <p className="font-cormorant italic text-xs max-w-[260px] leading-relaxed" style={{ color: 'rgba(248, 245, 240, 0.5)' }}>
                          Tap here to upload your payment proof <span className="block text-[0.65rem] opacity-75 mt-0.5">(JPG, PNG, or PDF supported)</span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Elegant Golden Border Hover/Focus effect */}
                  <div className="absolute inset-0 border border-transparent rounded-sm group-hover:border-amber-400/40 pointer-events-none transition-all duration-300" />
                </label>

                {errors.paymentProof && (
                  <span className="text-xs mt-1.5 block font-inter" style={{ color: '#ef4444' }}>
                    {errors.paymentProof}
                  </span>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-gold w-full justify-center mt-4 py-4" style={{ opacity: loading ? 0.6 : 1 }}>
                {loading ? 'Submitting...' : 'Submit Booking'}
              </button>
            </div>
          </motion.form>

          {/* Order Summary Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-2 glass-dark p-6 rounded-sm h-fit sticky top-24"
            style={{ border: '1px solid rgba(255,195,0,0.15)' }}
          >
            <h3 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-5 pb-3" style={{ color: '#FFD700', borderBottom: '1px solid rgba(255,195,0,0.1)' }}>Cart Summary</h3>

            <div className="flex flex-col gap-3 mb-5">
              {items.map(item => (
                <div key={item._id || item.id} className="flex justify-between text-sm">
                  <span className="font-cormorant" style={{ color: 'rgba(248,245,240,0.7)' }}>{item.quantity}x {item.name}</span>
                  <span className="font-cinzel text-xs" style={{ color: '#FFD700' }}>₹{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,195,0,0.1)', paddingTop: '16px' }}>
              <div className="flex justify-between font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                <span>Service Total</span><span>₹{total.toFixed(2)}</span>
              </div>
              {gstTotal > 0 && (
                <div className="flex justify-between font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.5)' }}>
                  <span>GST (Included)</span>
                  <span>₹{(appliedCoupon ? gstTotal * (appliedCoupon.finalAmount / total) : gstTotal).toFixed(2)}</span>
                </div>
              )}
              {appliedCoupon && (
                <div className="flex justify-between font-cormorant text-sm text-green-500">
                  <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                  <span>-₹{appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-cinzel text-base mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,195,0,0.08)', color: '#F8F5F0' }}>
                <span>Total Payable</span>
                <span style={{ color: '#FFD700' }}>
                  ₹{(appliedCoupon ? appliedCoupon.finalAmount : total).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-sm" style={{ background: 'rgba(255,195,0,0.05)', border: '1px solid rgba(255,195,0,0.08)' }}>
              {scheduledLabel ? (
                <p className="font-cormorant italic text-xs" style={{ color: 'rgba(248,245,240,0.4)' }}>
                  📅 Scheduled: {scheduledLabel}
                </p>
              ) : (
                <>
                  <p className="font-cormorant italic text-xs" style={{ color: 'rgba(248,245,240,0.4)' }}>
                    📅 Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                  <p className="font-cormorant italic text-xs mt-1" style={{ color: 'rgba(248,245,240,0.4)' }}>
                    🕐 Time: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default ConfirmBooking;
