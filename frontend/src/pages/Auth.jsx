import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../animations/variants';
import { GoogleLogin } from '@react-oauth/google';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Auth = () => {
  const navigate = useNavigate();

  // Steps: 'selection' | 'emailForm' | 'otpVerify'
  const [step, setStep] = useState('selection');
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  // Form states
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    dob: ''
  });

  // Validation errors
  const [errors, setErrors] = useState({});

  // OTP Verification states
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [resendCooldown, setResendCooldown] = useState(30); // 30 seconds resend cooldown
  const otpRefs = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];

  // Expiry Timer countdown
  useEffect(() => {
    if (step !== 'otpVerify') return;
    if (timer <= 0) return;

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, timer]);

  // Resend cooldown countdown
  useEffect(() => {
    if (step !== 'otpVerify') return;
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [step, resendCooldown]);

  // Format seconds to mm:ss
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Basic validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = 'Full Name is required.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = 'Email address is required.';
    } else if (!emailRegex.test(form.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    const phoneRegex = /^\d{10}$/;
    if (!form.phone.trim()) {
      newErrors.phone = 'Mobile number is required.';
    } else if (!phoneRegex.test(form.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit mobile number.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Google OAuth Success Handler
  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setGeneralError('');
      const res = await axios.post(`${API}/api/customer/google-auth`, {
        credential: credentialResponse.credential
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.token) localStorage.setItem('customerToken', res.data.token);
      window.dispatchEvent(new Event('userStateChange'));
      navigate('/profile');
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Google authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP handler
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setGeneralError('');
    try {
      await axios.post(`${API}/api/customer/send-otp`, form);
      setStep('otpVerify');
      setTimer(300); // reset 5 minute timer
      setResendCooldown(30); // reset 30 seconds resend cooldown
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP handler
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setGeneralError('');
    try {
      await axios.post(`${API}/api/customer/send-otp`, form);
      setTimer(300); // reset timer
      setResendCooldown(30); // reset cooldown
      setOtpDigits(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP handler
  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otp = otpDigits.join('');
    if (otp.length !== 6) {
      setGeneralError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setGeneralError('');
    try {
      const res = await axios.post(`${API}/api/customer/verify-otp`, {
        email: form.email,
        otp
      });
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.token) localStorage.setItem('customerToken', res.data.token);
      window.dispatchEvent(new Event('userStateChange'));
      navigate('/profile');
    } catch (err) {
      setGeneralError(err.response?.data?.error || 'OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // OTP digits change handling
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1); // Get last char if multiple pasted
    setOtpDigits(newDigits);

    // Auto-advance
    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  // OTP key down handling for backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  // Handle paste in OTP inputs
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const digits = pastedData.split('');
    setOtpDigits(digits);
    otpRefs[5].current.focus();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative pt-28 pb-12 px-4" style={{ background: '#000' }}>
      {/* Background radial glow */}
      <div className="absolute pointer-events-none" style={{ top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(212,175,55,0.08), transparent 70%)' }} />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="relative w-full max-w-md"
      >
        {/* Logo and Premium Branding */}
        <motion.div variants={fadeUp} className="text-center mb-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 bg-black" style={{ border: '1px solid rgba(212,175,55,0.4)', boxShadow: '0 0 25px rgba(212,175,55,0.18)' }}>
            <img
              src="/b2-logo-transparent.svg"
              alt="B2 Logo"
              style={{ width: '42px', height: '42px', objectFit: 'contain', filter: 'drop-shadow(0 0 4px rgba(212,175,55,0.4))' }}
            />
          </div>
          <h1 className="font-cinzel text-lg tracking-[0.25em] uppercase font-bold" style={{ color: '#D4AF37' }}>B2 BRIDAL STUDIO</h1>
          <p className="font-cormorant italic text-sm mt-1" style={{ color: 'rgba(248,245,240,0.6)' }}>Premium Salon & Academy Experience</p>
        </motion.div>

        {/* Auth Card Container */}
        <motion.div
          variants={fadeUp}
          className="glass-dark p-8 rounded-sm transition-all duration-300"
          style={{ border: '1px solid rgba(212,175,55,0.18)' }}
        >
          {generalError && (
            <div className="mb-6 p-4 rounded-sm text-sm font-inter text-center" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}>
              {generalError}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* STEP 1: Selection screen */}
            {step === 'selection' && (
              <motion.div
                key="selection"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center mb-2">
                  <h2 className="font-cinzel text-sm tracking-[0.15em] uppercase" style={{ color: '#F8F5F0' }}>Sign In / Enroll</h2>
                  <p className="font-cormorant italic text-xs mt-1" style={{ color: 'rgba(248,245,240,0.5)' }}>Select your preferred authentication method</p>
                </div>

                {/* Google Button */}
                <div className="flex justify-center w-full">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setGeneralError('Google login failed. Please try again.')}
                    theme="filled_black"
                    shape="rectangular"
                    text="continue_with"
                    width="100%"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
                  <span className="font-cormorant text-xs italic" style={{ color: 'rgba(248,245,240,0.4)' }}>or</span>
                  <div className="flex-1 h-px" style={{ background: 'rgba(212,175,55,0.15)' }} />
                </div>

                {/* Continue with Email CTA */}
                <button
                  onClick={() => setStep('emailForm')}
                  className="btn-outline-gold w-full justify-center text-xs py-3"
                >
                  Continue with Email
                </button>
              </motion.div>
            )}

            {/* STEP 2: Email form */}
            {step === 'emailForm' && (
              <motion.form
                key="emailForm"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleSendOtp}
                className="flex flex-col gap-5"
              >
                <div className="text-center mb-2">
                  <h2 className="font-cinzel text-sm tracking-[0.15em] uppercase" style={{ color: '#F8F5F0' }}>Enter Details</h2>
                  <p className="font-cormorant italic text-xs mt-1" style={{ color: 'rgba(248,245,240,0.5)' }}>Verify your email to continue</p>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block font-cinzel text-[0.7rem] tracking-[0.25em] uppercase mb-2 font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255, 215, 0, 0.15)' }}>Full Name</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Your full name"
                    className="input-luxury rounded-sm"
                  />
                  {errors.name && <p className="text-red-500 text-xs font-inter mt-1.5">{errors.name}</p>}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block font-cinzel text-[0.7rem] tracking-[0.25em] uppercase mb-2 font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255, 215, 0, 0.15)' }}>Email Address</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    placeholder="your@email.com"
                    className="input-luxury rounded-sm"
                  />
                  {errors.email && <p className="text-red-500 text-xs font-inter mt-1.5">{errors.email}</p>}
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block font-cinzel text-[0.7rem] tracking-[0.25em] uppercase mb-2 font-bold" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255, 215, 0, 0.15)' }}>Mobile Number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder="9876543210"
                    maxLength={10}
                    className="input-luxury rounded-sm"
                  />
                  {errors.phone && <p className="text-red-500 text-xs font-inter mt-1.5">{errors.phone}</p>}
                </div>

                {/* Date of Birth (Optional) */}
                <div>
                  <label className="block font-cinzel text-[0.7rem] tracking-[0.25em] uppercase mb-1 font-bold flex items-center justify-between" style={{ color: '#FFD700', textShadow: '0 0 8px rgba(255, 215, 0, 0.15)' }}>
                    Date of Birth
                    <span className="font-cormorant italic text-[0.75rem] normal-case tracking-normal font-semibold text-gold-300">
                      (optional)
                    </span>
                  </label>
                  <p className="font-cormorant italic text-[0.75rem] text-gray-400 mb-2">Enter DOB to receive offers in future</p>
                  <input
                    type="date"
                    value={form.dob}
                    onChange={e => setForm({ ...form, dob: e.target.value })}
                    className="input-luxury rounded-sm"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>

                {/* Send OTP & Back Buttons */}
                <div className="flex flex-col gap-3 mt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gold w-full justify-center text-xs py-3"
                    style={{ opacity: loading ? 0.6 : 1 }}
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('selection');
                      setGeneralError('');
                    }}
                    className="text-center font-cormorant text-sm italic py-1 transition-all duration-300 hover:text-[#FFD700] font-semibold"
                    style={{ color: 'rgba(248,245,240,0.8)' }}
                  >
                    Back to options
                  </button>
                </div>
              </motion.form>
            )}

            {/* STEP 3: OTP Verification */}
            {step === 'otpVerify' && (
              <motion.form
                key="otpVerify"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleVerifyOtp}
                className="flex flex-col gap-6"
              >
                <div className="text-center">
                  <h2 className="font-cinzel text-sm tracking-[0.15em] uppercase" style={{ color: '#F8F5F0' }}>Verify Code</h2>
                  <p className="font-cormorant italic text-xs mt-1" style={{ color: 'rgba(248,245,240,0.5)' }}>
                    Enter the 6-digit OTP sent to
                  </p>
                  <p className="font-inter text-xs text-gold-300 mt-0.5 select-all font-semibold">
                    {form.email}
                  </p>
                </div>

                {/* OTP Digit Boxes */}
                <div className="flex justify-between gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={otpRefs[index]}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(index, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(index, e)}
                      className="w-12 h-14 bg-white/5 border text-center text-xl font-bold font-inter focus:outline-none transition-all duration-300 text-white rounded-sm"
                      style={{
                        borderColor: digit ? '#D4AF37' : 'rgba(212, 175, 55, 0.25)',
                        boxShadow: digit ? '0 0 10px rgba(212, 175, 55, 0.2)' : 'none'
                      }}
                    />
                  ))}
                </div>

                {/* Timer details */}
                <div className="flex justify-between items-center text-xs font-inter" style={{ color: 'rgba(248,245,240,0.5)' }}>
                  <div>
                    {timer > 0 ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-gold-premium animate-pulse" />
                        Code expires in <strong className="text-white font-semibold">{formatTime(timer)}</strong>
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">Code has expired</span>
                    )}
                  </div>

                  <div>
                    {resendCooldown > 0 ? (
                      <span>Resend in <strong className="text-white font-semibold">{resendCooldown}s</strong></span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        className="text-gold-premium hover:underline font-semibold"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>

                {/* Verification CTA & Back */}
                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={loading || timer <= 0}
                    className="btn-gold w-full justify-center text-xs py-3"
                    style={{ opacity: (loading || timer <= 0) ? 0.6 : 1 }}
                  >
                    {loading ? 'Verifying...' : 'Verify & Continue'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('emailForm');
                      setGeneralError('');
                    }}
                    className="text-center font-cormorant text-sm italic py-1 transition-all duration-300 hover:text-[#FFD700] font-semibold"
                    style={{ color: 'rgba(248,245,240,0.8)' }}
                  >
                    Edit details or email
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Auth;
