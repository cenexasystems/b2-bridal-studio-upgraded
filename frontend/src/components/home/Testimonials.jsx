import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import axios from 'axios';
import { Star, X, Check } from 'lucide-react';
import { fadeUp, staggerContainer } from '../../animations/variants';

const API = import.meta.env.VITE_API_URL || '';

const staticTestimonials = [
  {
    _id: 'static-7',
    name: 'Rekha Sivakumar',
    role: 'Student',
    quote: "I really enjoyed the Aari work class because the teacher explained the steps clearly, and I was able to learn and practice well with confidence.Practicing during the class helped me improve my skills. The materials they gave us were of good quality. After attending the class, I feel more confident in doing Aari's. work on my own. Overall, it was a great experience and I'm happy I joined.",
    stars: 5,
  },
  {
    _id: 'static-8',
    name: 'fy rose27',
    role: 'Student',
    quote: 'Hi sis, im Fyrose I m happy to learn aari course for 2 weeks,ur are the one off best coching tutor and also patient and give self-confidence for women Thank you for ur giving to ur for best service',
    stars: 5,
  },
  {
    _id: 'static-9',
    name: 'LAKSHATHI DR',
    role: 'Student',
    quote: 'Thank you so much mam i loved ur way of teaching and learned many things and many technical term and theory too. A friendly way of teaching i loved all these days',
    stars: 5,
  },
  {
    _id: 'static-10',
    name: 'sunishka',
    role: 'Student',
    quote: "The course of Aari class is really very good, you'll get a great experience to design your own blouse with neat work 💯",
    stars: 5,
  },
  {
    _id: 'static-1',
    name: 'Priya Lakshmi',
    role: 'Bride, 2023',
    quote: 'Shanmugavadivu Sabarinathan transformed me into exactly the bride I dreamed of being. The artistry, the attention to detail, and the love poured into every brushstroke — it was a spiritual experience.',
    stars: 5,
  },
  {
    _id: 'static-2',
    name: 'Kavitha Raj',
    role: 'Bride, 2024',
    quote: "I've been to many studios, but B2 is in a different league entirely. The luxury experience begins the moment you walk in. My bridal look was absolute perfection.",
    stars: 5,
  },
  {
    _id: 'static-3',
    name: 'Meena Selvam',
    role: 'Student, Batch 2023',
    quote: "The training programme at B2 Academy launched my entire career. The techniques, the professionalism, and the personal mentoring — I couldn't ask for more from a teacher.",
    stars: 5,
  },
  {
    _id: 'static-4',
    name: 'Deepa Sundar',
    role: 'Bride, 2024',
    quote: "Every photograph from my wedding is a masterpiece. That is what B2 does — they don't just do makeup, they create art that lasts forever.",
    stars: 5,
  },
  {
    _id: 'static-5',
    name: 'Anitha Kumar',
    role: 'Bride, 2023',
    quote: 'From the moment I walked in, I felt like royalty. The team understood exactly what I wanted — my bridal look was beyond anything I imagined possible.',
    stars: 5,
  },
  {
    _id: 'static-6',
    name: 'Lakshmi Narayan',
    role: 'Student, Batch 2024',
    quote: 'B2 Academy gave me the skills and confidence to launch my own studio. The hands-on training and mentorship are genuinely world-class.',
    stars: 5,
  },
];

const StarRating = ({ count }) => (
  <div className="flex gap-1">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        fill={i < count ? '#FFD700' : 'transparent'}
        color={i < count ? '#FFD700' : 'rgba(255, 215, 0, 0.2)'}
      />
    ))}
  </div>
);

const TestimonialCard = ({ testimonial, isFloating }) => (
  <div
    className={`glass-dark px-6 py-8 sm:px-8 sm:py-10 flex flex-col items-center text-center rounded-sm h-full ${isFloating ? 'animate-float-subtle' : ''}`}
    style={{
      width: '100%',
      minHeight: '360px',
      border: '1px solid rgba(255,195,0,0.18)',
      boxShadow: '0 15px 35px rgba(0,0,0,0.4), inset 0 0 15px rgba(255,195,0,0.02)',
      background: 'linear-gradient(135deg, rgba(15,15,12,0.98) 0%, rgba(5,5,5,0.99) 100%)',
      boxSizing: 'border-box',
    }}
  >
    {/* Quote mark */}
    <div
      className="font-playfair font-bold mb-3 leading-none select-none"
      style={{ fontSize: '3.5rem', lineHeight: 0.8, color: 'rgba(255,215,0,0.25)' }}
    >
      "
    </div>

    {/* Stars */}
    <div className="flex justify-center mb-4">
      <StarRating count={testimonial.stars} />
    </div>

    {/* Quote */}
    <blockquote
      className="font-cormorant italic leading-relaxed mb-6 flex-1 text-ellipsis overflow-hidden"
      style={{
        fontSize: '1.2rem',
        fontWeight: 500,
        color: 'rgba(248,245,240,0.93)',
        maxWidth: '100%',
        display: '-webkit-box',
        WebkitLineClamp: 5,
        WebkitBoxOrient: 'vertical',
      }}
    >
      {testimonial.quote}
    </blockquote>

    {/* Author */}
    <div className="flex flex-col items-center gap-2 mt-auto">
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '1px solid rgba(255,215,0,0.4)', background: 'rgba(255,215,0,0.08)' }}>
        <span className="font-cinzel text-sm font-bold" style={{ color: '#FFD700' }}>
          {testimonial.name ? testimonial.name.charAt(0).toUpperCase() : 'C'}
        </span>
      </div>
      <div>
        <div className="font-cinzel text-sm tracking-[0.1em] uppercase text-white font-extrabold">
          {testimonial.name}
        </div>
        <div className="font-cormorant text-xs italic mt-0.5" style={{ color: 'rgba(255,215,0,0.65)' }}>
          {testimonial.role || 'Client'}
        </div>
      </div>
    </div>
  </div>
);

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? '60px' : '-60px',
    opacity: 0,
    scale: 0.95
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    zIndex: 1
  },
  exit: (direction) => ({
    x: direction < 0 ? '60px' : '-60px',
    opacity: 0,
    scale: 0.95,
    zIndex: 0
  })
};

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  const [list, setList] = useState(staticTestimonials);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [quote, setQuote] = useState('');
  const [role, setRole] = useState('');
  const [stars, setStars] = useState(5);
  const [hoverStars, setHoverStars] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Carousel States
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  // Fetch reviews from Database
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API}/api/reviews`);
        if (Array.isArray(res.data) && res.data.length > 0) {
          // Put DB reviews first, then append static ones
          setList([...res.data, ...staticTestimonials]);
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      }
    };
    fetchReviews();
  }, []);

  // Auto-sliding effect
  useEffect(() => {
    if (isHovered || list.length <= 1) return;
    const interval = setInterval(() => {
      setDirection(1);
      setActiveIndex((prev) => (prev + 1) % list.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [list.length, isHovered]);

  const handleDotClick = (index) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? 1 : -1);
    setActiveIndex(index);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedName = name.trim();
    const trimmedQuote = quote.trim();
    const trimmedRole = role.trim() || 'Client';

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!trimmedQuote) {
      setError('Please enter your review / experience.');
      return;
    }

    if (trimmedName.length > 50) {
      setError('Name must be 50 characters or less.');
      return;
    }
    if (trimmedQuote.length > 500) {
      setError('Review must be 500 characters or less.');
      return;
    }
    if (trimmedRole.length > 30) {
      setError('Role / Occasion must be 30 characters or less.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(`${API}/api/reviews`, {
        name: trimmedName,
        quote: trimmedQuote,
        role: trimmedRole,
        stars,
      });

      // Update list instantly with the new review at the front
      setList((prev) => [res.data, ...prev]);
      setActiveIndex(0); // Show the newly submitted review
      setSuccess(true);
      
      // Reset form fields
      setName('');
      setQuote('');
      setRole('');
      setStars(5);

      // Close modal after showing success screen
      setTimeout(() => {
        setShowModal(false);
        setSuccess(false);
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden"
      style={{ padding: '4.5rem 0', background: '#000' }}
    >
      {/* Subtle left ambient glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%',
          left: '-5%',
          width: '40%',
          height: '80%',
          background: 'radial-gradient(ellipse, rgba(255,195,0,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-[1300px] mx-auto px-6 lg:px-12" ref={ref}>
        {/* Header */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="text-center mb-12"
        >
          <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-divider" style={{ width: '40px' }} />
            <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
              06 — Voices
            </span>
            <div className="gold-divider" style={{ width: '40px' }} />
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-cinzel font-bold uppercase mb-4"
            style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', letterSpacing: '0.05em', color: '#F8F5F0' }}
          >
            Client Stories
          </motion.h2>
          <motion.p variants={fadeUp} className="font-cormorant italic" style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.92)' }}>
            The most honest reviews — from those who wore our artistry.
          </motion.p>

          {/* Luxury Google Reviews Rating Badge */}
          <motion.div variants={fadeUp} className="flex justify-center items-center gap-4 mt-6">
            <a
              href="https://www.google.com/search?q=B2+Bridal+Studio#sv=CAESzQEKuQEStgEKd0FNbjMteVJYajYwcFlKdk1xZFpGRzZtU2JnNE5sQlNUekY3dlFaMFRwNl92a0lRVW5MdmdUeHItUEJUYUlMeDBlN1hBOTNyMzk0TjBfczZ3LW9qVUJ3Y0U3cDUwZUFlMXNvQTZOWDdiRmVreWRIWDJsbTRYd0ZFEhc1bzRlYXJUVkt0M1R3Y3NQdmZLZnVBOBoiQUpLTEZtSUp0OVZ5a3lzYktGLVo3T3FiT0FfM0lEUWh0QRIEODA1MRoBMyoAMAA4AUAAGAAgqvWU0Q1KAhAC"
              target="_blank"
              rel="noopener noreferrer"
              className="glass-dark px-5 py-2.5 rounded-sm border border-[#FFD700]/15 flex items-center gap-3 hover:border-[#FFD700]/30 transition-all cursor-pointer"
              style={{ background: 'rgba(255, 215, 0, 0.02)' }}
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114A5.94 5.94 0 0 1 8 12.571a5.94 5.94 0 0 1 5.99-5.943c1.606 0 3.066.6 4.2 1.571l3.207-3.2A10.137 10.137 0 0 0 13.99 1C8.473 1 4 5.485 4 11s4.473 10 9.99 10c5.752 0 10.01-4.048 10.01-10 0-.685-.06-1.342-.18-1.714H12.24Z"/>
              </svg>
              <span className="font-cinzel text-[0.65rem] tracking-[0.18em] text-[#FFD700] font-bold">
                4.9 ★ ON GOOGLE REVIEWS
              </span>
            </a>
          </motion.div>
        </motion.div>

        <style>{`
          @keyframes floatSubtle {
            0% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
            100% { transform: translateY(0); }
          }
          .animate-float-subtle {
            animation: floatSubtle 4s ease-in-out infinite;
          }
        `}</style>

        {/* Auto-sliding premium carousel */}
        <div 
          className="relative mx-auto mb-8 flex justify-center items-center" 
          style={{ width: 'clamp(280px, 85vw, 550px)', minHeight: '380px', perspective: '1000px' }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { duration: 0.7, ease: [0.25, 1, 0.5, 1] },
                opacity: { duration: 0.7, ease: 'easeInOut' },
                scale: { duration: 0.7, ease: 'easeInOut' }
              }}
              style={{ position: 'absolute', width: '100%', height: '100%' }}
            >
              {list[activeIndex] && (
                <TestimonialCard testimonial={list[activeIndex]} isFloating={true} />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center items-center gap-3 mb-10">
          {list.map((_, index) => (
            <button
              key={index}
              onClick={() => handleDotClick(index)}
              className="w-2.5 h-2.5 rounded-full transition-all duration-300 relative cursor-pointer"
              style={{
                background: index === activeIndex ? '#FFD700' : 'rgba(255, 215, 0, 0.25)',
                transform: index === activeIndex ? 'scale(1.3)' : 'scale(1)',
                boxShadow: index === activeIndex ? '0 0 10px rgba(255, 215, 0, 0.6)' : 'none',
                border: 'none',
              }}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Action Button to Open Submission Modal */}
        <div className="text-center">
          <button
            onClick={() => setShowModal(true)}
            className="btn-outline-gold px-8 py-3 rounded-sm transition-all"
          >
            Leave a Review
          </button>
        </div>
      </div>

      {/* Review Submission Dialog Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !submitting && setShowModal(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="glass-dark max-w-lg w-full p-6 sm:p-8 rounded-sm relative border border-[#FFD700]/30 shadow-2xl z-10"
              style={{
                background: 'rgba(10, 10, 12, 0.98)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              {/* Close Button */}
              <button
                onClick={() => !submitting && setShowModal(false)}
                className="absolute right-4 top-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
                disabled={submitting}
              >
                <X size={20} />
              </button>

              {success ? (
                <div className="text-center py-10 flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                    <Check size={32} className="text-emerald-400" />
                  </div>
                  <h3 className="font-cinzel text-xl text-[#FFD700] uppercase font-bold tracking-[0.1em] mb-3">
                    Thank you!
                  </h3>
                  <p className="font-cormorant text-lg italic text-[#F8F5F0] max-w-xs leading-relaxed">
                    Thank you for sharing your experience! Your review has been added to our story wall.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="mb-2">
                    <h3 className="font-cinzel text-lg text-[#F8F5F0] uppercase font-bold tracking-[0.15em] mb-1">
                      Share Your Story
                    </h3>
                    <p className="font-cormorant text-sm italic text-gray-300">
                      We value your feedback. Let us know how your experience was.
                    </p>
                  </div>

                  {error && (
                    <p className="text-xs text-red-400 bg-red-950/20 border border-red-900/30 px-3.5 py-2.5 rounded-sm">
                      {error}
                    </p>
                  )}

                  {/* Star Rating Input */}
                  <div>
                    <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-gray-300 mb-2 font-semibold">
                      Your Rating *
                    </label>
                    <div className="flex gap-2">
                      {Array.from({ length: 5 }).map((_, i) => {
                        const starVal = i + 1;
                        return (
                          <button
                            type="button"
                            key={i}
                            onClick={() => setStars(starVal)}
                            onMouseEnter={() => setHoverStars(starVal)}
                            onMouseLeave={() => setHoverStars(null)}
                            className="p-1 cursor-pointer transition-transform hover:scale-110 active:scale-95"
                          >
                            <Star
                              size={24}
                              fill={(hoverStars !== null ? hoverStars >= starVal : stars >= starVal) ? '#FFD700' : 'transparent'}
                              color={(hoverStars !== null ? hoverStars >= starVal : stars >= starVal) ? '#FFD700' : 'rgba(255, 215, 0, 0.25)'}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Customer Name */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-gray-300 font-semibold">
                        Your Name *
                      </label>
                      <span className="text-[0.65rem] text-gray-500 font-sans">
                        {name.length}/50
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={50}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Priya Lakshmi"
                      className="input-luxury rounded-sm text-sm"
                      required
                    />
                  </div>

                  {/* Role / Occasion */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-gray-300 font-semibold">
                        Role / Occasion (Optional)
                      </label>
                      <span className="text-[0.65rem] text-gray-500 font-sans">
                        {role.length}/30
                      </span>
                    </div>
                    <input
                      type="text"
                      maxLength={30}
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      placeholder="e.g. Bride, Madurai (2024)"
                      className="input-luxury rounded-sm text-sm"
                    />
                  </div>

                  {/* Review / Experience */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="block font-cinzel text-[0.6rem] tracking-[0.2em] uppercase text-gray-300 font-semibold">
                        Your Review / Experience *
                      </label>
                      <span className="text-[0.65rem] text-gray-500 font-sans">
                        {quote.length}/500
                      </span>
                    </div>
                    <textarea
                      maxLength={500}
                      rows={4}
                      value={quote}
                      onChange={(e) => setQuote(e.target.value)}
                      placeholder="Share details of your experience with our artists..."
                      className="input-luxury rounded-sm text-sm resize-none"
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-gold w-full mt-2 py-3.5 text-center flex items-center justify-center"
                  >
                    {submitting ? 'Submitting Review...' : 'Submit Review'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Testimonials;
