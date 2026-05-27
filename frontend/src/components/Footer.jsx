import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const QUICK_LINKS = [
  { label: 'Our Services', to: '/services' },
  { label: 'Academy', to: '/courses' },
  { label: 'Gallery', to: '/gallery' },
  { label: 'Certificates', to: '/certificates' },
  { label: 'About Us', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const COURSES = [
  { label: 'Bridal Makeup', to: '/courses/beautician' },
  { label: 'Fashion & Design', to: '/courses/fashion' },
  { label: 'Embroidery & Crafts', to: '/courses/embroidery' },
  { label: 'Jewellery Making', to: '/courses/jewellery' },
  { label: 'Bags & Accessories', to: '/courses/bags' },
];

const SocialLink = ({ href, label, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="w-9 h-9 flex items-center justify-center transition-all duration-300"
    style={{
      border: '1px solid rgba(255,195,0,0.2)',
      color: 'rgba(248,245,240,0.5)',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.background = 'rgba(255,195,0,0.12)';
      e.currentTarget.style.borderColor = 'rgba(255,195,0,0.5)';
      e.currentTarget.style.color = '#FFD700';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.borderColor = 'rgba(255,195,0,0.2)';
      e.currentTarget.style.color = 'rgba(248,245,240,0.5)';
    }}
  >
    {children}
  </a>
);

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToContact = (e) => {
    e.preventDefault();
    const scrollToEl = () => {
      const el = document.getElementById('contact');
      if (el) {
        const offset = 80;
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

  return (
    <footer style={{ background: '#000', borderTop: '1px solid rgba(255,195,0,0.15)' }}>
      {/* Main footer grid */}
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12 py-16 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">

        {/* Brand column */}
        <div>
          <Link to="/" className="flex items-center gap-3 mb-5 w-fit">
            <div style={{ width: 52, height: 52, flexShrink: 0 }}>
              <img
                src="/b2-logo-transparent.svg"
                alt="B2 Bridal Studio"
                style={{ width: 52, height: 52, objectFit: 'contain', filter: 'drop-shadow(0 0 8px rgba(255,195,0,0.4))' }}
              />
            </div>
            <div>
              <div className="font-cinzel text-xs tracking-[0.2em] uppercase" style={{ color: '#FFD700' }}>B2 Bridal</div>
              <div className="font-cormorant text-[0.65rem] tracking-wider uppercase" style={{ color: 'rgba(248,245,240,0.35)' }}>Studio</div>
            </div>
          </Link>
          <p className="font-cormorant leading-relaxed text-base mb-6" style={{ color: 'rgba(248,245,240,0.6)', fontSize: '1rem' }}>
            Crafting luxury bridal experiences and professional training in Chennai and Madurai since 2018.
          </p>
          {/* Social links */}
          <div className="flex gap-2">
            <SocialLink href="https://www.facebook.com/b2bridalmakeoverstudio" label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>
              </svg>
            </SocialLink>
            <SocialLink href="https://www.instagram.com/b2_bridal_studio_" label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="14" height="14">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                <circle cx="12" cy="12" r="4"/>
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>
              </svg>
            </SocialLink>
            <SocialLink href="https://www.youtube.com/@ShammuB2" label="YouTube">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.95C18.88 4 12 4 12 4s-6.88 0-8.59.47a2.78 2.78 0 00-1.95 1.95A29 29 0 001 12a29 29 0 00.46 5.58A2.78 2.78 0 003.41 19.5C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.95A29 29 0 0023 12a29 29 0 00-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z"/>
              </svg>
            </SocialLink>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-cinzel text-[0.65rem] tracking-[0.35em] uppercase mb-6" style={{ color: '#FFD700' }}>
            Quick Links
          </h3>
          <ul className="flex flex-col gap-3">
            {QUICK_LINKS.map(link => (
              <li key={link.to}>
                {link.to === '/contact' ? (
                <a
                  href="/#contact"
                  onClick={scrollToContact}
                  className="font-cormorant text-base transition-colors duration-200 flex items-center gap-2 group cursor-pointer"
                  style={{ color: 'rgba(248,245,240,0.6)', fontSize: '1rem' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#FFD700'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,245,240,0.6)'; }}
                >
                  <span className="w-3 h-px opacity-0 group-hover:opacity-100 transition-all" style={{ background: '#FFD700' }} />
                  {link.label}
                </a>
              ) : (
                <Link
                  to={link.to}
                  className="font-cormorant text-base transition-colors duration-200 flex items-center gap-2 group"
                  style={{ color: 'rgba(248,245,240,0.6)', fontSize: '1rem' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#FFD700'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,245,240,0.6)'; }}
                >
                  <span className="w-3 h-px opacity-0 group-hover:opacity-100 transition-all" style={{ background: '#FFD700' }} />
                  {link.label}
                </Link>
              )}
              </li>
            ))}
          </ul>
        </div>

        {/* Courses */}
        <div>
          <h3 className="font-cinzel text-[0.65rem] tracking-[0.35em] uppercase mb-6" style={{ color: '#FFD700' }}>
            Academy
          </h3>
          <ul className="flex flex-col gap-3">
            {COURSES.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className="font-cormorant text-base transition-colors duration-200 flex items-center gap-2 group"
                  style={{ color: 'rgba(248,245,240,0.6)', fontSize: '1rem' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#FFD700'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,245,240,0.6)'; }}
                >
                  <span className="w-3 h-px opacity-0 group-hover:opacity-100 transition-all" style={{ background: '#FFD700' }} />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-cinzel text-[0.65rem] tracking-[0.35em] uppercase mb-6" style={{ color: '#FFD700' }}>
            Contact
          </h3>
          <ul className="flex flex-col gap-4">
            {[
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, text: 'No. 63, Madavaram Red Hills Rd, Moolakaadu, Chennai — 600060', href: 'https://www.google.com/maps/dir/?api=1&destination=13.1283,80.2410' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>, text: 'C6, Santhi Sadan Enclave, Melakkal Main Road, Kochadai, Madurai – 625016', href: 'https://www.google.com/maps/dir/?api=1&destination=9.9252,78.0747' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, text: '+91 98405 51365' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>, text: '+91 97908 82561' },
              { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FFD700" strokeWidth="1.5"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, text: 'b2shammu@gmail.com' },
            ].map((item, i) => (
              <li key={i} className="flex gap-2 items-start">
                <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
                {item.href ? (
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-cormorant leading-snug transition-colors duration-200 hover:text-[#FFD700]"
                    style={{ fontSize: '0.95rem', color: 'rgba(248,245,240,0.6)', textDecoration: 'none' }}
                  >
                    {item.text}
                  </a>
                ) : (
                  <span className="font-cormorant leading-snug" style={{ fontSize: '0.95rem', color: 'rgba(248,245,240,0.6)' }}>
                    {item.text}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="max-w-[1300px] mx-auto px-6 lg:px-12 py-6 flex flex-col md:flex-row items-center justify-between gap-4"
        style={{ borderTop: '1px solid rgba(255,195,0,0.08)' }}
      >
        <p className="font-cormorant text-sm text-center md:text-left" style={{ color: 'rgba(248,245,240,0.45)', fontSize: '0.9rem' }}>
          © {new Date().getFullYear()} B2 Bridal Studio. All rights reserved.
        </p>
        
        {/* Attribution */}
        <p className="font-inter text-[0.7rem] tracking-wide text-center" style={{ color: 'rgba(248,245,240,0.35)' }}>
          Powered by{' '}
          <a
            href="https://cenexasystems.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-all duration-300 font-semibold hover:text-[#FFD700]"
            style={{ color: '#FFD700', textDecoration: 'none' }}
          >
            Cenexa Systems
          </a>{' '}
          © 2026
        </p>

        <div className="flex items-center gap-2">
          <div className="gold-divider" style={{ width: '20px' }} />
          <span className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase" style={{ color: 'rgba(255,195,0,0.3)' }}>
            Luxury. Art. Excellence.
          </span>
          <div className="gold-divider" style={{ width: '20px' }} />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
