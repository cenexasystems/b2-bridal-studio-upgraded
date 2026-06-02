import React, { useState, useEffect } from 'react';

const WHATSAPP_NUMBER = '919361527951';
const WHATSAPP_MESSAGE = encodeURIComponent('Hi B2 Bridal Studio! I\'d like to enquire about your services.');

const WhatsAppFAB = () => {
  const [showScroll, setShowScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (!showScroll && window.scrollY > 300) {
        setShowScroll(true);
      } else if (showScroll && window.scrollY <= 300) {
        setShowScroll(false);
      }
    };
    window.addEventListener('scroll', checkScroll);
    return () => window.removeEventListener('scroll', checkScroll);
  }, [showScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      {/* Scroll to Top Button */}
      <button
        id="scroll-to-top"
        onClick={scrollToTop}
        className={`fixed bottom-[88px] right-[40px] z-[150] transition-all duration-300 ${
          showScroll ? 'opacity-70 hover:opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-75 pointer-events-none'
        }`}
        aria-label="Scroll to top"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#FFD700"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-6 h-6 transition-all duration-300 hover:scale-110"
          style={{
            filter: 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.45))'
          }}
          onMouseEnter={e => {
            e.currentTarget.style.filter = 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.85))';
            e.currentTarget.style.stroke = '#FFED8A';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.filter = 'drop-shadow(0 0 4px rgba(255, 215, 0, 0.45))';
            e.currentTarget.style.stroke = '#FFD700';
          }}
        >
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* WhatsApp Button */}
      <a
        id="whatsapp-fab"
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[150] group flex items-center gap-3"
        aria-label="Chat with us on WhatsApp"
      >
        {/* Tooltip */}
        <span
          className="font-cinzel text-[0.65rem] tracking-[0.15em] uppercase px-3 py-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.9)',
            border: '1px solid rgba(255,195,0,0.25)',
            color: '#FFD700',
            whiteSpace: 'nowrap',
          }}
        >
          Chat with us
        </span>

        {/* Button */}
        <div
          className="relative w-14 h-14 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-110"
          style={{
            background: 'linear-gradient(135deg, #25D366, #128C7E)',
            boxShadow: '0 4px 20px rgba(37,211,102,0.4)',
          }}
        >
          {/* Pulse ring */}
          <div
            className="absolute inset-0 rounded-full animate-pulse-glow"
            style={{ border: '2px solid rgba(37,211,102,0.4)', transform: 'scale(1.3)' }}
          />
          {/* WhatsApp SVG icon */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="white"
            width="26"
            height="26"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </div>
      </a>
    </>
  );
};

export default WhatsAppFAB;
