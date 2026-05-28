import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  { label: 'Contact', to: '/contact', isContact: true },
];

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
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
  const navigate = useNavigate();

  const scrollToContact = (e) => {
    e.preventDefault();
    setMenuOpen(false);
    const scrollToEl = () => {
      const el = document.getElementById('contact');
      if (el) {
        const offset = 80; // fixed navbar height
        const y = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    };
    if (location.pathname === '/') {
      scrollToEl();
    } else {
      navigate('/');
      setTimeout(scrollToEl, 500);
    }
  };

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
    setShowScrollTop(window.scrollY > 400);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="absolute top-0 left-0 right-0 z-[100] transition-all duration-500"
        style={{
          background: 'rgba(0, 0, 0, 0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(212, 175, 55, 0.18)',
        }}
      >
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group shrink-0 whitespace-nowrap">
              <div
                className="flex items-center justify-center transition-all duration-300 group-hover:scale-105 shrink-0"
                style={{ width: 48, height: 48, flexShrink: 0 }}
              >
                <img
                  src="/b2-logo-transparent.svg"
                  alt="B2 Bridal Studio"
                  style={{ width: 48, height: 48, objectFit: 'contain', filter: 'drop-shadow(0 0 6px rgba(212,175,55,0.3))' }}
                />
              </div>
              <div className="shrink-0 whitespace-nowrap">
                <div className="font-cinzel text-xs tracking-[0.25em] uppercase font-bold whitespace-nowrap" style={{ color: '#D4AF37' }}>B2 Bridal</div>
                <div className="font-cormorant text-[0.65rem] tracking-[0.2em] uppercase font-semibold whitespace-nowrap" style={{ color: 'rgba(248, 245, 240, 0.7)', lineHeight: 1 }}>Studio</div>
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
                      className="relative font-cinzel text-[0.72rem] tracking-[0.2em] uppercase group flex items-center gap-1 font-bold"
                      style={{ color: location.pathname.startsWith('/courses') ? '#D4AF37' : '#F8F5F0', textDecoration: 'none' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#FFFED8'}
                      onMouseLeave={e => { if (!location.pathname.startsWith('/courses')) e.currentTarget.style.color = '#F8F5F0'; }}
                    >
                      {link.label}
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none" stroke="currentColor" strokeWidth="1.5" className={`transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`}>
                        <path d="M1 3l3 3 3-3"/>
                      </svg>
                      <span className="absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full" style={{ width: 0, background: 'linear-gradient(90deg, #D4AF37, #FFED8A)' }} />
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
                          style={{ width: '300px' }}
                        >
                          <div
                            className="rounded-sm py-2"
                            style={{
                              background: 'rgba(10, 10, 10, 0.95)',
                              border: '1px solid rgba(212,175,55,0.25)',
                              backdropFilter: 'blur(20px)',
                              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                            }}
                          >
                            {COURSE_CATEGORIES.map((cat, i) => (
                              <Link
                                key={cat.to}
                                to={cat.to}
                                className="flex items-center gap-3 px-5 py-3 transition-all duration-200 group"
                                style={{ borderBottom: i < COURSE_CATEGORIES.length - 1 ? '1px solid rgba(212,175,55,0.1)' : 'none' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(212,175,55,0.1)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                              >
                                <span className="text-base">{cat.icon}</span>
                                <span className="font-cormorant text-base font-bold" style={{ color: '#F8F5F0' }}>
                                  {cat.label}
                                </span>
                                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="rgba(212,175,55,0.4)" strokeWidth="1" className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                                  <path d="M3 2l4 3-4 3"/>
                                </svg>
                              </Link>
                            ))}
                            <div className="px-5 pt-3 pb-2" style={{ borderTop: '1px solid rgba(212,175,55,0.15)' }}>
                              <Link
                                to="/courses"
                                className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase flex items-center gap-2 font-semibold"
                                style={{ color: '#D4AF37' }}
                              >
                                View All Courses
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" stroke="#D4AF37" strokeWidth="1">
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
                  <NavLink key={link.to} to={link.to} active={location.pathname === link.to} onClick={link.isContact ? scrollToContact : undefined}>
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
                className="relative w-10 h-10 flex items-center justify-center transition-colors duration-200 cursor-pointer"
                style={{ color: '#F8F5F0' }}
                onMouseEnter={e => e.currentTarget.style.color = '#D4AF37'}
                onMouseLeave={e => e.currentTarget.style.color = '#F8F5F0'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 flex items-center justify-center rounded-full text-[0.55rem] font-bold"
                    style={{ background: '#D4AF37', color: '#fff' }}
                  >
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="w-10 h-10 rounded-full flex items-center justify-center font-cinzel text-lg font-bold cursor-pointer"
                    style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}
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
                          background: 'rgba(10, 10, 10, 0.95)',
                          border: '1px solid rgba(212,175,55,0.25)',
                          backdropFilter: 'blur(20px)',
                          boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        }}
                      >
                        <div className="px-4 py-2 border-b" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                          <p className="font-inter text-sm text-[#F8F5F0] truncate font-bold">{user.name}</p>
                          <p className="font-inter text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                        <Link to="/profile" onClick={() => setProfileDropdownOpen(false)} className="block px-4 py-3 font-cinzel text-[0.7rem] tracking-[0.1em] uppercase text-[#F8F5F0] hover:bg-white/5 transition-colors">
                          My Profile
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-4 py-3 font-cinzel text-[0.7rem] tracking-[0.1em] uppercase text-red-500 hover:bg-white/5 transition-colors cursor-pointer">
                          Logout
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    to="/auth"
                    className="font-cinzel text-[0.7rem] tracking-[0.15em] uppercase px-4 py-2 transition-all duration-300 font-bold"
                    style={{ color: '#F8F5F0', border: '1px solid rgba(255,255,255,0.2)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#F8F5F0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; }}
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Mobile: Cart + Hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={openCart}
                className="relative w-10 h-10 flex items-center justify-center cursor-pointer"
                style={{ color: '#D4AF37' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 flex items-center justify-center rounded-full text-[0.55rem] font-bold" style={{ background: '#D4AF37', color: '#fff' }}>
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <button
                id="mobile-menu-toggle"
                className="flex flex-col gap-[5px] p-2 z-50 cursor-pointer"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                <span className="block w-6 h-px transition-all duration-300 origin-center" style={{ background: '#D4AF37', transform: menuOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
                <span className="block h-px transition-all duration-300" style={{ background: '#D4AF37', width: menuOpen ? 0 : '24px', opacity: menuOpen ? 0 : 1 }} />
                <span className="block w-6 h-px transition-all duration-300 origin-center" style={{ background: '#D4AF37', transform: menuOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
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
        style={{ background: '#0A0A0A', borderLeft: '1px solid rgba(212,175,55,0.15)' }}
      >
        <div className="flex flex-col gap-1 mt-24 px-8 overflow-y-auto flex-1">
          {NAV_LINKS.map(link => (
            <div key={link.to}>
              {link.hasDropdown ? (
                <>
                  <div className="flex items-center justify-between border-b" style={{ borderColor: 'rgba(212,175,55,0.1)' }}>
                    <Link
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      className="flex-1 py-4 font-cinzel text-sm tracking-[0.2em] uppercase font-bold"
                      style={{ color: '#F8F5F0' }}
                    >
                      {link.label}
                    </Link>
                    <button
                      onClick={() => setMobileCoursesOpen(!mobileCoursesOpen)}
                      className="p-2 cursor-pointer"
                      style={{ color: '#D4AF37' }}
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
                        <div className="pl-4 pb-3 flex flex-col gap-1 mt-2">
                          {COURSE_CATEGORIES.map(cat => (
                            <Link
                              key={cat.to}
                              to={cat.to}
                              onClick={() => setMenuOpen(false)}
                              className="flex items-center gap-2 py-2 font-cormorant text-sm font-semibold"
                              style={{ color: '#CCCCCC' }}
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
                  onClick={(e) => { if (link.isContact) { scrollToContact(e); } else { setMenuOpen(false); } }}
                  className="block py-4 font-cinzel text-sm tracking-[0.2em] uppercase border-b font-bold"
                  style={{ color: '#F8F5F0', borderBottomColor: 'rgba(212,175,55,0.1)' }}
                >
                  {link.label}
                </Link>
              )}
            </div>
          ))}
            {user ? (
              <div className="mt-8 flex flex-col gap-3 pb-8 border-t pt-4" style={{ borderColor: 'rgba(212,175,55,0.15)' }}>
                <div className="px-2 mb-2">
                  <p className="font-cinzel text-sm font-bold text-[#D4AF37]">{user.name}</p>
                  <p className="font-inter text-xs text-gray-400">{user.email}</p>
                </div>
                <Link to="/profile" className="btn-outline-gold text-center text-xs py-3" onClick={() => setMenuOpen(false)}>My Profile</Link>
                <button onClick={() => { setMenuOpen(false); handleLogout(); }} className="btn-gold text-center text-xs py-3 cursor-pointer" style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}>Logout</button>
              </div>
            ) : (
              <div className="mt-8 flex flex-col gap-3 pb-8">
                <Link to="/auth" className="btn-outline-gold text-center text-xs py-3" onClick={() => setMenuOpen(false)}>Login</Link>
              </div>
            )}
        </div>
      </motion.div>

      {/* Backdrop */}
      {menuOpen && (
        <div className="fixed inset-0 z-[98] lg:hidden" style={{ background: 'rgba(0,0,0,0.4)' }} onClick={() => setMenuOpen(false)} />
      )}

      {/* Floating Back to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-[90] w-12 h-12 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300"
            style={{
              background: 'rgba(10, 10, 10, 0.85)',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 0 15px rgba(212, 175, 55, 0.25)',
              color: '#D4AF37',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#FFFED8';
              e.currentTarget.style.borderColor = '#D4AF37';
              e.currentTarget.style.boxShadow = '0 0 25px rgba(212, 175, 55, 0.5)';
              e.currentTarget.style.transform = 'translateY(-3px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#D4AF37';
              e.currentTarget.style.borderColor = 'rgba(212, 175, 55, 0.4)';
              e.currentTarget.style.boxShadow = '0 0 15px rgba(212, 175, 55, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

const NavLink = ({ to, children, active, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="relative font-cinzel text-[0.72rem] tracking-[0.2em] uppercase group font-bold"
    style={{ color: active ? '#D4AF37' : '#F8F5F0', textDecoration: 'none' }}
    onMouseEnter={e => e.currentTarget.style.color = '#FFFED8'}
    onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#F8F5F0'; }}
  >
    {children}
    <span className="absolute -bottom-1 left-0 h-px transition-all duration-300 group-hover:w-full" style={{ width: active ? '100%' : 0, background: 'linear-gradient(90deg, #D4AF37, #FFED8A)' }} />
  </Link>
);

export default Navbar;