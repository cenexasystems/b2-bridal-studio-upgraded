import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, Navigate } from 'react-router-dom';
import { fadeUp, staggerContainer } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

const statusColors = {
  Pending:   { bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)',  color: '#eab308' },
  Approved:  { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  color: '#22c55e' },
  Successful:{ bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  color: '#22c55e' },
  Completed: { bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  color: '#22c55e' },
  Rejected:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  color: '#ef4444' },
};

const Profile = () => {
  const [bookings, setBookings] = useState([]);
  const [cashAppointments, setCashAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cashLoading, setCashLoading] = useState(true);
  const getValidUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed && (parsed.email || parsed.name)) {
          return parsed;
        }
      } catch (e) {}
    }
    return null;
  };

  const user = getValidUser();

  useEffect(() => {
    if (!user?.email) { setLoading(false); return; }
    const load = () =>
      fetch(`${API}/api/bookings/user/${encodeURIComponent(user.email)}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => setBookings(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setLoading(false));

    load();
    // Poll every 10 seconds so status updates (Pending→Approved) reflect automatically
    const timer = setInterval(load, 10000);
    return () => clearInterval(timer);
  }, []);

  // Fetch cash walk-in appointments
  useEffect(() => {
    if (!user?.email) { setCashLoading(false); return; }
    const loadCash = () =>
      fetch(`${API}/api/cash-appointments/user/${encodeURIComponent(user.email)}`)
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(data => setCashAppointments(Array.isArray(data) ? data : []))
        .catch(console.error)
        .finally(() => setCashLoading(false));

    loadCash();
    const cashTimer = setInterval(loadCash, 10000);
    return () => clearInterval(cashTimer);
  }, []);

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div style={{ background: '#000', minHeight: '100vh' }}>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ padding: '9rem 0 4rem' }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center top, rgba(255,195,0,0.06), transparent 60%)' }} />
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="max-w-3xl mx-auto px-6 text-center">
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, transparent, #FFD700)' }} />
            <span className="font-cinzel text-[0.6rem] tracking-[0.5em] uppercase" style={{ color: '#FFD700' }}>My Account</span>
            <div className="h-px w-12" style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }} />
          </motion.div>
          <motion.h1 variants={fadeUp} className="font-cinzel font-bold uppercase" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: '#F8F5F0', letterSpacing: '0.05em' }}>
            Welcome, {user.name}
          </motion.h1>
          <motion.p variants={fadeUp} className="font-cormorant italic mt-3" style={{ fontSize: '1.1rem', color: 'rgba(248,245,240,0.5)' }}>
            {user.email}
          </motion.p>
        </motion.div>
      </section>

      {/* Bookings */}
      <section style={{ padding: '0 0 6rem' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-cinzel text-sm tracking-[0.25em] uppercase mb-6 font-bold" style={{ color: '#FFD700' }}>Your Bookings</h2>

          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(255,195,0,0.2)', borderTopColor: '#FFD700' }} />
            </div>
          ) : bookings.length === 0 ? (
            <div className="glass-dark p-12 rounded-sm text-center" style={{ border: '1px solid rgba(255,195,0,0.1)' }}>
              <span className="text-4xl block mb-4">📋</span>
              <h3 className="font-cinzel text-base tracking-[0.1em] uppercase mb-2 font-bold" style={{ color: '#FFFFFF' }}>No Bookings Yet</h3>
              <p className="font-cormorant italic mb-6 text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>You haven't made any bookings yet.</p>
              <Link to="/services" className="btn-outline-gold py-2 px-6 text-[0.8rem] font-bold">Browse Services</Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking, i) => {
                let displayStatus = booking.status;
                if (booking.billId) displayStatus = 'Completed';
                const sc = statusColors[displayStatus] || statusColors.Pending;
                return (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-dark rounded-sm overflow-hidden"
                    style={{ border: '1.5px solid rgba(255,215,0,0.2)' }}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase px-3 py-1 rounded-sm font-extrabold" style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, color: sc.color }}>
                            {displayStatus}
                          </span>
                          <span className="font-cinzel text-[0.7rem] tracking-[0.15em] uppercase px-3 py-1 font-extrabold" style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1.5px solid #FFD700' }}>
                            {booking.branch}
                          </span>
                        </div>
                        <div className="text-right">
                          {booking.dateTime && (
                            <div className="font-cormorant text-base mb-1 font-bold" style={{ color: '#FFD700' }}>
                              📅 {new Date(booking.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              {' '}&nbsp;🕐 {new Date(booking.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <span className="font-cormorant text-[0.9rem] font-bold" style={{ color: '#FFFFFF' }}>
                            Booked: {new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        {booking.items.map((item, j) => {
                          const count = item.peopleCount || item.quantity || 1;
                          return (
                            <div key={j} className="flex justify-between items-start py-2 text-lg font-bold" style={{ borderBottom: j < booking.items.length - 1 ? '1px solid rgba(255,195,0,0.08)' : 'none' }}>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-cormorant font-extrabold text-white">{item.name}</span>
                                <span className="font-cinzel text-[0.7rem] tracking-[0.05em] uppercase font-bold" style={{ color: '#FFD700' }}>
                                  Booked For: {count} {count === 1 ? 'Person' : 'People'}
                                </span>
                              </div>
                              <span className="font-cinzel text-base font-extrabold" style={{ color: '#FFD700' }}>₹{(item.price * count).toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3" style={{ borderTop: '1.5px solid rgba(255,195,0,0.15)' }}>
                        <div>
                          <span className="font-cinzel text-[0.7rem] tracking-[0.15em] uppercase font-extrabold" style={{ color: '#FFFFFF' }}>Transaction: </span>
                          <span className="font-inter text-base font-extrabold" style={{ color: '#FFFFFF' }}>{booking.transactionId}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-cinzel text-xl font-extrabold" style={{ color: '#FFD700' }}>
                            ₹{(booking.finalAmount || booking.total).toFixed(2)}
                          </span>
                          {booking.couponCode && (
                            <div className="font-cormorant text-sm italic mt-1 font-bold" style={{ color: '#22c55e' }}>
                              Coupon: {booking.couponCode} (-₹{booking.discountAmount})
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Rejected message */}
                      {displayStatus === 'Rejected' && (
                        <div className="mt-4 pt-3 text-center" style={{ borderTop: '1px solid rgba(255,195,0,0.08)' }}>
                          <span className="font-cormorant italic text-xs" style={{ color: '#ef4444' }}>
                            Rejected - refund handled via WhatsApp
                          </span>
                        </div>
                      )}

                      {/* Bill link */}
                      {displayStatus === 'Completed' && booking.billId && (
                        <div className="mt-4 pt-3" style={{ borderTop: '1.5px solid rgba(255,195,0,0.15)' }}>
                          <Link to={`/bill/${booking.billId}`} className="font-cinzel text-[0.8rem] tracking-[0.2em] uppercase flex items-center gap-2 font-extrabold" style={{ color: '#FFD700' }}>
                            View Bill
                            <svg width="14" height="10" viewBox="0 0 12 8" fill="none" stroke="#FFD700" strokeWidth="2.5" strokeLinecap="round"><path d="M1 4h10M7 1l4 3-4 3"/></svg>
                          </Link>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Walk-in Appointments (Cash) */}
      <section style={{ padding: '0 0 6rem' }}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-cinzel text-sm tracking-[0.25em] uppercase mb-6 font-bold" style={{ color: '#FFD700' }}>Walk-in Appointments (Cash)</h2>

          {cashLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '2px solid rgba(255,195,0,0.2)', borderTopColor: '#FFD700' }} />
            </div>
          ) : cashAppointments.length === 0 ? (
            <div className="glass-dark p-10 rounded-sm text-center" style={{ border: '1px solid rgba(255,195,0,0.1)' }}>
              <span className="text-3xl block mb-3">💵</span>
              <h3 className="font-cinzel text-base tracking-[0.1em] uppercase mb-2 font-bold" style={{ color: '#FFFFFF' }}>No Walk-in Appointments</h3>
              <p className="font-cormorant italic text-sm font-bold" style={{ color: 'rgba(255,255,255,0.6)' }}>Cash walk-in bookings will appear here.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cashAppointments.map((appt, i) => {
                const sc = statusColors[appt.status] || statusColors.Pending;
                return (
                  <motion.div
                    key={appt._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className="glass-dark rounded-sm overflow-hidden"
                    style={{ border: '1.5px solid rgba(255,215,0,0.2)' }}
                  >
                    <div className="p-6">
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-3">
                          <span className="font-cinzel text-[0.7rem] tracking-[0.2em] uppercase px-3 py-1 rounded-sm font-extrabold" style={{ background: sc.bg, border: `1.5px solid ${sc.border}`, color: sc.color }}>
                            {appt.status}
                          </span>
                          <span className="font-cinzel text-[0.7rem] tracking-[0.15em] uppercase px-3 py-1 font-extrabold" style={{ background: 'rgba(255,215,0,0.12)', color: '#FFD700', border: '1.5px solid #FFD700' }}>
                            {appt.branch}
                          </span>
                          <span className="font-cinzel text-[0.6rem] tracking-[0.1em] uppercase px-2 py-1 rounded-sm font-bold" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(248,245,240,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                            💵 Cash
                          </span>
                        </div>
                        <div className="text-right">
                          {appt.dateTime && (
                            <div className="font-cormorant text-base mb-1 font-bold" style={{ color: '#FFD700' }}>
                              📅 {new Date(appt.dateTime).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                              {' '}&nbsp;🕐 {new Date(appt.dateTime).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          <span className="font-cormorant text-[0.9rem] font-bold" style={{ color: '#FFFFFF' }}>
                            Booked: {new Date(appt.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="mb-4">
                        {appt.items.map((item, j) => {
                          const count = item.peopleCount || item.quantity || 1;
                          return (
                            <div key={j} className="flex justify-between items-start py-2 text-lg font-bold" style={{ borderBottom: j < appt.items.length - 1 ? '1px solid rgba(255,195,0,0.08)' : 'none' }}>
                              <div className="flex flex-col gap-0.5">
                                <span className="font-cormorant font-extrabold text-white">{item.name}</span>
                                <span className="font-cinzel text-[0.7rem] tracking-[0.05em] uppercase font-bold" style={{ color: '#FFD700' }}>
                                  Service For: {count} {count === 1 ? 'Person' : 'People'}
                                </span>
                              </div>
                              <span className="font-cinzel text-base font-extrabold" style={{ color: '#FFD700' }}>₹{(item.price * count).toLocaleString()}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3" style={{ borderTop: '1.5px solid rgba(255,195,0,0.15)' }}>
                        <div>
                          <span className="font-cinzel text-[0.7rem] tracking-[0.15em] uppercase font-extrabold" style={{ color: 'rgba(255,215,0,0.7)' }}>
                            {appt.status === 'Pending' ? '⏳ Awaiting your visit — pay at salon' : '✅ Service completed'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-cinzel text-xl font-extrabold" style={{ color: '#FFD700' }}>
                            ₹{Number(appt.total).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Profile;
