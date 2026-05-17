import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';

const API = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/customer/login`, form);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      
      // Dispatch custom event to notify Navbar of login
      window.dispatchEvent(new Event('userStateChange'));
      
      navigate('/profile');
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#000' }}>
      {/* Background glow */}
      <div className="absolute pointer-events-none" style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(255,195,0,0.06), transparent 65%)' }} />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md mx-4"
      >
        {/* Logo */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3" style={{ border: '1px solid rgba(255,195,0,0.4)', boxShadow: '0 0 20px rgba(255,195,0,0.15)' }}>
            <span className="font-cinzel text-lg font-bold text-gold-gradient">B2</span>
          </div>
          <h1 className="font-cinzel text-base tracking-[0.3em] uppercase" style={{ color: '#F8F5F0' }}>Welcome Back</h1>
          <p className="font-cormorant italic text-sm mt-1" style={{ color: 'rgba(248,245,240,0.6)' }}>Sign in to your account</p>
        </motion.div>

        {/* Form */}
        <motion.form
          variants={fadeUp}
          onSubmit={handleSubmit}
          className="glass-dark p-8 rounded-sm"
          style={{ border: '1px solid rgba(255,195,0,0.15)' }}
        >
          <div className="flex flex-col gap-5">
            <div>
              <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase mb-2 font-semibold" style={{ color: 'rgba(255,195,0,0.75)' }}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                required
                className="input-luxury rounded-sm"
              />
            </div>
            <div>
              <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase mb-2 font-semibold" style={{ color: 'rgba(255,195,0,0.75)' }}>Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  required
                  className="input-luxury rounded-sm pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: 'rgba(255,195,0,0.4)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    {showPw ? <><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></> : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></>}
                  </svg>
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full justify-center mt-2"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </div>
        </motion.form>

        <motion.p variants={fadeUp} className="text-center mt-6 font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.6)' }}>
          Don't have an account?{' '}
          <Link to="/register" className="font-cinzel text-[0.65rem] tracking-[0.1em] uppercase" style={{ color: '#FFD700' }}>Register</Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;