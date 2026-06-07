import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { fadeUp, staggerContainer } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

const HOUR_LABELS = {
  '10':'10 AM','11':'11 AM','12':'12 PM','13':'1 PM',
  '14':'2 PM','15':'3 PM','16':'4 PM','17':'5 PM','18':'6 PM','19':'7 PM'
};

const CashBooking = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  // Protect route
  useEffect(() => {
    if (!user) {
      const serviceDataState = location.state?.serviceData || null;
      sessionStorage.setItem('redirectAfterLogin', '/cash-booking');
      if (serviceDataState) sessionStorage.setItem('bookingServiceData', JSON.stringify(serviceDataState));
      sessionStorage.setItem('authMessage', 'Please login to confirm your appointment.');
      navigate('/auth', { replace: true });
    }
  }, [user, navigate, location.state?.serviceData]);

  const serviceData = useMemo(() => {
    if (location.state?.serviceData) return location.state.serviceData;
    const saved = sessionStorage.getItem('bookingServiceData');
    return saved ? JSON.parse(saved) : null;
  }, [location.state?.serviceData]);

  if (!user) return null;

  const items = serviceData?.items || [];
  const total = serviceData?.total || 0;

  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter valid 10-digit WhatsApp number';
    if (items.length === 0) e.items = 'Cart is empty';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const dateTime = (serviceData?.date && serviceData?.hour)
      ? `${serviceData.date}T${String(serviceData.hour).padStart(2, '0')}:00:00`
      : new Date().toISOString();

    setLoading(true);
    try {
      const token = localStorage.getItem('customerToken');
      const payload = {
        name: form.name,
        phone: form.phone,
        branch: serviceData?.branch || 'Chennai',
        userId: user?.email || '',
        email: user?.email || '',
        total,
        dateTime,
        items: items.map(i => ({
          name: i.name,
          price: i.price,
          quantity: i.peopleCount || i.quantity || 1,
          peopleCount: i.peopleCount || i.quantity || 1,
          gstPercentage: i.gstPercentage || 0
        }))
      };

      const response = await fetch(`${API}/api/cash-appointments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server error: ${response.status}`);
      }

      // Clear cart state
      localStorage.removeItem('services_cart');
      localStorage.removeItem('services_bookingDate');
      localStorage.removeItem('services_bookingTime');
      localStorage.removeItem('services_bookingBranch');
      sessionStorage.removeItem('bookingServiceData');
      sessionStorage.removeItem('redirectAfterLogin');
      sessionStorage.removeItem('authMessage');

      navigate('/profile', { state: { cashAppointmentBooked: true } });
    } catch (err) {
      setErrors({ submit: `Failed to confirm appointment: ${err.message || 'Please try again.'}` });
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
          <p className="font-cormorant italic mb-6" style={{ color: 'rgba(248,245,240,0.4)' }}>Please add items before confirming an appointment.</p>
          <a href="/services" className="btn-gold py-3 px-8 text-xs">Browse Services</a>
        </div>
      </div>
    );
  }

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
            <span className="font-cinzel text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: '#FFD700' }}>Cash Walk-in</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Confirm Appointment
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-3" style={{ fontSize: '1.1rem', color: 'rgba(248,245,240,0.55)' }}>
            Pay at the salon when you arrive. Your slot is reserved upon confirmation.
          </motion.p>
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
            <h2 className="font-cinzel text-xs tracking-[0.2em] uppercase mb-2 pb-4 font-bold" style={{ color: '#FFD700', borderBottom: '1px solid rgba(255,195,0,0.1)' }}>
              Your Details
            </h2>
            <p className="font-cormorant italic text-sm mb-6" style={{ color: 'rgba(248,245,240,0.5)' }}>
              No payment needed now — just confirm your details and we'll reserve your slot.
            </p>

            {/* Cash badge */}
            <div className="mb-6 p-3 rounded-sm flex items-center gap-3" style={{ background: 'rgba(255,215,0,0.06)', border: '1px solid rgba(255,215,0,0.2)' }}>
              <span style={{ fontSize: '1.2rem' }}>💵</span>
              <div>
                <p className="font-cinzel text-[0.65rem] tracking-[0.15em] uppercase font-bold" style={{ color: '#FFD700' }}>Cash Payment at Salon</p>
                <p className="font-cormorant italic text-xs mt-0.5" style={{ color: 'rgba(248,245,240,0.55)' }}>Please carry exact amount when you visit.</p>
              </div>
            </div>

            {errors.submit && (
              <div className="mb-5 p-4 rounded-sm text-sm font-inter text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
                {errors.submit}
              </div>
            )}

            <div className="flex flex-col gap-5">
              {/* Name */}
              <div>
                <label className="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Full Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  className="input-luxury rounded-sm"
                  placeholder="Your full name"
                />
                {errors.name && <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>{errors.name}</span>}
              </div>

              {/* Phone */}
              <div>
                <label className="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>WhatsApp Number *</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                  className="input-luxury rounded-sm"
                  placeholder="10-digit number"
                  maxLength={10}
                />
                {errors.phone && <span className="text-xs mt-1 block" style={{ color: '#ef4444' }}>{errors.phone}</span>}
              </div>

              {/* Branch (read-only) */}
              <div>
                <label className="block font-cinzel text-[0.65rem] tracking-[0.2em] uppercase mb-2 font-bold" style={{ color: '#FFD700' }}>Branch</label>
                <div className="input-luxury rounded-sm flex items-center" style={{ opacity: 0.8, cursor: 'not-allowed' }}>
                  <span className="font-cinzel text-sm font-bold" style={{ color: '#FFD700' }}>{serviceData?.branch || 'Chennai'}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full justify-center mt-4 py-4"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                {loading ? 'Confirming Appointment...' : 'Confirm Walk-in Appointment'}
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
            <h3 className="font-cinzel text-sm tracking-[0.25em] uppercase mb-5 pb-3 font-bold" style={{ color: '#FFD700', borderBottom: '1px solid rgba(255,195,0,0.1)' }}>Appointment Summary</h3>

            <div className="flex flex-col gap-3 mb-5">
              {items.map(item => {
                const count = item.peopleCount || item.quantity || 1;
                return (
                  <div key={item._id || item.id} className="flex justify-between items-center py-2" style={{ borderBottom: '1px solid rgba(255,195,0,0.06)' }}>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-cormorant text-base font-medium" style={{ color: 'rgba(248,245,240,0.95)' }}>{item.name}</span>
                      <span className="font-cinzel text-[0.7rem] tracking-[0.05em] uppercase font-bold" style={{ color: '#FFD700' }}>
                        Service For: {count} {count === 1 ? 'Person' : 'People'}
                      </span>
                    </div>
                    <span className="font-cinzel text-sm font-bold" style={{ color: '#FFD700' }}>₹{(item.price * count).toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-col gap-2" style={{ borderTop: '1px solid rgba(255,195,0,0.1)', paddingTop: '16px' }}>
              <div className="flex justify-between font-cinzel text-lg font-bold mt-2 pt-3" style={{ borderTop: '1px solid rgba(255,195,0,0.2)', color: '#FFFFFF' }}>
                <span>Total Payable</span>
                <span style={{ color: '#FFD700' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>

            {scheduledLabel && (
              <div className="mt-5 p-4 rounded-sm" style={{ background: 'rgba(255,195,0,0.08)', border: '1px solid rgba(255,195,0,0.15)' }}>
                <p className="font-cormorant italic text-sm font-medium" style={{ color: 'rgba(248,245,240,0.9)' }}>
                  📅 Scheduled: {scheduledLabel}
                </p>
                <p className="font-cormorant italic text-sm font-medium mt-1" style={{ color: 'rgba(248,245,240,0.9)' }}>
                  📍 Branch: {serviceData?.branch}
                </p>
                <p className="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase mt-3 font-bold" style={{ color: 'rgba(255,215,0,0.6)' }}>
                  💵 Pay cash when you arrive
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CashBooking;
