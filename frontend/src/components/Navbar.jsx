import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const COURSE_CATEGORIES = [
  { label: 'Bridal Makeup', to: '/courses/beautician', icon: '💄' },
  { label: 'Fashion Design', to: '/courses/fashion', icon: '👗' },
  { label: 'Embroidery', to: '/courses/embroidery', icon: '🧵' },
  { label: 'Jewellery Making', to: '/courses/jewellery', icon: '💎' },
  { label: 'Bags & Accessories', to: '/courses/bags', icon: '👜' },
  { label: 'Kids Programs', to: '/courses/kids', icon: '🎨' },
];

const NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Services', to: '/services' },
  { label: 'Courses', to: '/courses', hasDropdown: true },
  { label: 'Products', to: '/products' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [mobileCoursesOpen, setMobileCoursesOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('user');
      setUser(stored ? JSON.parse(stored) : null);
    };
    loadUser();
    window.addEventListener('storage', loadUser);
    window.addEventListener('userStateChange', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
      window.removeEventListener('userStateChange', loadUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userStateChange'));
    setProfileDropdownOpen(false);
    // Use window.location to ensure full reset and routing back to home
    window.location.href = '/';
  };

  const dropdownRef = useRef(null);
  const dropdownTimeout = useRef(null);
  const { itemCount, openCart } = useCart();
  const location = useLocation();

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
    setMobileCoursesOpen(false);
  }, [location.pathname]);

  const handleDropdownEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setCoursesOpen(true);
  };

  const handleDropdownLeave = () => {
    dropdownTimeout.current = setTimeout(() => setCoursesOpen(false), 200);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-[100] transition-all duration-500"
        style={{
          background: scrolled ? 'rgba(0,0,0,0.92)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(255,195,0,0.12)' : 'none',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div
                className="flex items-center justify-center transition-all duration-300 group-hover:scale-105"
                style={{ width: 48, height: 48, flexShrink: 0 }}
              >
                <img
                  src="/b2-logo.png"
                  alt="B2 Bridal Studio"
                  style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(255,195,0,0.45))', mixBlendMode: 'lighten' }}
                />
              </div>
              <div>
                <div className="font-cinzel text-xs tracking-[0.25em] uppercase" style={{ color: '#FFD700' }}>B2 Bridal</div>
                <div className="font-cormorant text-[0.65rem] tracking-[0.2em] uppercase" style={{ color: 'rgba(248,245,240,0.45)', lineHeight: 1 }}>Studio</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-7">
              {NAV_LINKS.map(link => (
                link.hasDropdown ? (
                  <div
                    key={link.to}
                    className="relative"
                    ref={dropdownRef}
                    onMouseEnter={handleDropdownEnter}
                    onMouseLeave={handleDropdownLeave}
                  >
                    <Link
                      to={link.to}
                      className="relative font-cinzel text-[0.7rem] tracking-[0.2em] uppercase group flex items-center gap-1"
                      style={{ color: location.pathname.startsWith('/courses') ? '#FFD700' : 'rgba(248,245,240,0.7)', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
                      onMouseLeave={e => { if (!location.pathname.startsWith('/courses')) e.currentTarget.style.color = 'rgba(248,245,240,0.7)'; }}
                    >
                      {link.label}
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`}>
                        <path d="M1 3l3 3 3-3"/>
                      </svg>
                      <span className="absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full" style={{ width: 0, background: 'linear-gradient(90deg, #FFD700, #FFE566)' }} />
                    </Link>

                    {/* Dropdown */}
                    <AnimatePresence>
                      {coursesOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="absolute top-full left-1/2 -translate-x-1/2 pt-3"
                          style={{ width: '260px' }}
                        >
                          <div
                            className="rounded-sm py-2"
                            style={{
                              background: 'rgba(10,8,2,0.96)',
                              border: '1px solid rgba(255,195,0,0.2)',
                              backdropFilter: 'blur(20px)',
                              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                            }}
                          >
                            {COURSE_CATEGORIES.map((cat, i) => (
                              <Link
                                key={cat.to}
                                to={cat.to}
                                className="flex items-center gap-3 px-5 py-3 transition-all duration-200 group"
                                style={{ borderBottom: i < COURSE_CATEGORIES.length - 1 ? '1px solid rgba(255,195,0,0.06)' : 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,195,0,0.08)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                              >
                                <span className="text-sm">{cat.icon}</span>
                                <span className="font-cormorant text-sm" style={{ color: 'rgba(248,245,240,0.7)' }}>
                                  {cat.label}
                                </span>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(255,195,0,0.4)" strokeWidth="1" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  <path d="M3 2l4 3-4 3"/>
                                </svg>
                              </Link>
                            ))}
                            <div className="px-5 pt-3 pb-2" style={{ borderTop: '1px solid rgba(255,195,0,0.1)' }}>
                              <Link
                                to="/courses"
                                className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase flex items-center gap-2"
                                style={{ color: '#FFD700' }}
                              >
                                View All Courses
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#FFD700" strokeWidth="1">
                                  <path d="M1 4h8M5 1l4 3-4 3"/>
                                </svg>
                              </Link>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <NavLink key={link.to} to={link.to} active={location.pathname === link.to}>
                    {link.label}
                  </NavLink>
                )
              ))}
            </div>

            {/* Right side: Cart + Login + CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Cart Icon */}
              <button
                onClick={openCart}
                className="relative w-10 h-10 flex items-center justify-center transition-colors duration-200"
                style={{ color: 'rgba(248,245,240,0.7)' }}
                onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(248,245,240,0.7)'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[0.55rem] font-bold"
                    style={{ background: '#FFD700', color: '#000' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel text-lg font-bold"
                    style={{ background: 'rgba(255,195,0,0.1)', border: '1px solid rgba(255,195,0,0.3)', color: '#FFD700' }}
                  >
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </button>

                  <AnimatePresence>
                    {profileDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-3 py-2 w-48 rounded-sm"
                        style={{
                          background: 'rgba(10,8,2,0.96)',
                          border: '1px solid rgba(255,195,0,0.2)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
                        }}
                      >
                        <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(255,195,0,0.1)' }}>
                          <p className="font-inter text-sm text-white truncate">{user.name}</p>
                          <p className="font-inter text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-3 font-cinzel text-[0.7rem] tracking-[0.1em] uppercase text-white hover:bg-white/5 transition-colors">
                          My Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 font-cinzel text-[0.7rem] tracking-[0.1em] uppercase text-red-400 hover:bg-white/5 transition-colors">
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="font-cinzel text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 transition-all duration-300"
                    style={{ color: 'rgba(248,245,240,0.7)', border: '1px solid rgba(248,245,240,0.15)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#FFD700'; e.currentTarget.style.borderColor = 'rgba(255,195,0,0.4)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,245,240,0.7)'; e.currentTarget.style.borderColor = 'rgba(248,245,240,0.15)'; }}
                  >
                    Login
                  </Link>
                  <Link to="/register" className="btn-gold text-[0.7rem] py-2 px-5">
                    Enroll Now
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={openCart}
                className="relative w-10 h-10 flex items-center justify-center"
                style={{ color: '#FFD700' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center rounded-full text-[0.55rem] font-bold" style={{ background: '#FFD700', color: '#000' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <button
                id="mobile-menu-toggle"
                className="flex flex-col gap-[5px] p-2 z-50"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="block w-6 h-px transition-all duration-300 origin-center" style={{ background: '#FFD700', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
                <span className="block h-px transition-all duration-300" style={{ background: '#FFD700', width: menuOpen ? 0 : '24px', opacity: menuOpen ? 0 : 1 }} />
                <span className="block w-6 h-px transition-all duration-300 origin-center" style={{ background: '#FFD700', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Drawer */}
      <motion.div
        initial={false}
        animate={{ x: menuOpen ? 0 : '100%' }}
        transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-y-0 right-0 z-[99] w-72 flex flex-col lg:hidden"
        style={{ background: 'rgba(0,0,0,0.97)', borderLeft: '1px solid rgba(255,195,0,0.15)' }}
      >
        <div className="flex flex-col gap-1 mt-24 px-8 overflow-y-auto flex-1">
          {NAV_LINKS.map(link => (
            <div key={link.to}>
              {link.hasDropdown ? (
                <>
                  <div className="flex items-center justify-between">
                    <Link
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 py-4 font-cinzel text-sm tracking-[0.2em] uppercase"
                      style={{ color: 'rgba(248,245,240,0.7)' }}
                    >
                      {link.label}
                    </Link>
                    <button
                      onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                      className="p-2"
                      style={{ color: '#FFD700' }}
                    >
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform ${mobileCoursesOpen ? 'rotate-180' : ''}`}>
                        <path d="M2 4l3 3 3-3"/>
                      </svg>
                    </button>
                  </div>
                  <AnimatePresence>
                    {mobileCoursesOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="pl-4 pb-3 flex flex-col gap-1">
                          {COURSE_CATEGORIES.map(cat => (
                            <Link
                              key={cat.to}
                              to={cat.to}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 py-2 font-cormorant text-sm"
                              style={{ color: 'rgba(248,245,240,0.5)' }}
                            >
                              <span className="text-xs">{cat.icon}</span>
                              {cat.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <Link
                  to={link.to}
                  onClick={() => setMenuOpen(false)}
                  className="block py-4 font-cinzel text-sm tracking-[0.2em] uppercase border-b"
                  style={{ color: 'rgba(248,245,240,0.7)', borderBottomColor: 'rgba(255,195,0,0.08)' }}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
            {user ? (
              <div className="mt-8 flex flex-col gap-3 pb-8 border-t pt-4" style={{ borderColor: 'rgba(255,195,0,0.1)' }}>
                <div className="px-2 mb-2">
                  <p className="font-cinzel text-sm text-gold-gradient">{user.name}</p>
                  <p className="font-inter text-xs text-gray-500">{user.email}</p>
                </div>
                <Link to="/profile" className="btn-outline-gold text-center text-xs py-3" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="btn-gold text-center text-xs py-3" style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}>Logout</button>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3 pb-8">
                <Link to="/login" className="btn-outline-gold text-center text-xs py-3" onClick={() => setMenuOpen(false)}>Login</Link>
                <Link to="/register" className="btn-gold text-center text-xs py-3" onClick={() => setMenuOpen(false)}>Enroll Now</Link>
              </div>
            )}
        </div>
      </motion.div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="fixed inset-0 z-[98] lg:hidden" style={{ background: 'rgba(0,0,0,0.6)' }} onClick={() => setMenuOpen(false)} />
      )}
    </>
  );
};

const NavLink = ({ to, children, active }) => (
  <Link
    to={to}
    className="relative font-cinzel text-[0.7rem] tracking-[0.2em] uppercase group"
    style={{ color: active ? '#FFD700' : 'rgba(248,245,240,0.7)', textDecoration: 'none' }}
    onMouseEnter={e => e.currentTarget.style.color = '#FFD700'}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = 'rgba(248,245,240,0.7)'; }}
  >
    {children}
    <span className="absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full" style={{ width: active ? '100%' : 0, background: 'linear-gradient(90deg, #FFD700, #FFE566)' }} />
  </Link>
);

export default Navbar;