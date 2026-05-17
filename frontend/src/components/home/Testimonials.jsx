import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/variants';

const testimonials = [
  {
    id: 1,
    name: 'Priya Lakshmi',
    role: 'Bride, 2023',
    quote: 'Shammugapriya transformed me into exactly the bride I dreamed of being. The artistry, the attention to detail, and the love poured into every brushstroke — it was a spiritual experience.',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=200&q=80',
    stars: 5,
  },
  {
    id: 2,
    name: 'Kavitha Raj',
    role: 'Bride, 2024',
    quote: 'I\'ve been to many studios, but B2 is in a different league entirely. The luxury experience begins the moment you walk in. My bridal look was absolute perfection.',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?auto=format&fit=crop&w=200&q=80',
    stars: 5,
  },
  {
    id: 3,
    name: 'Meena Selvam',
    role: 'Student, Batch 2023',
    quote: 'The training programme at B2 Academy launched my entire career. The techniques, the professionalism, and the personal mentoring — I couldn\'t ask for more from a teacher.',
    image: 'https://images.unsplash.com/photo-1557555187-23d685287bc3?auto=format&fit=crop&w=200&q=80',
    stars: 5,
  },
  {
    id: 4,
    name: 'Deepa Sundar',
    role: 'Bride, 2024',
    quote: 'Every photograph from my wedding is a masterpiece. That is what B2 does — they don\'t just do makeup, they create art that lasts forever.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    stars: 5,
  },
  {
    id: 5,
    name: 'Anitha Kumar',
    role: 'Bride, 2023',
    quote: 'From the moment I walked in, I felt like royalty. The team understood exactly what I wanted — my bridal look was beyond anything I imagined possible.',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    stars: 5,
  },
  {
    id: 6,
    name: 'Lakshmi Narayan',
    role: 'Student, Batch 2024',
    quote: 'B2 Academy gave me the skills and confidence to launch my own studio. The hands-on training and mentorship are genuinely world-class.',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80',
    stars: 5,
  },
];

const StarRating = ({ count }) => (
  <div className="flex gap-1">
    {Array.from({ length: count }).map((_, i) => (
      <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#FFD700">
        <path d="M7 1l1.6 4.4H13L9.2 8.2l1.4 4.4L7 10l-3.6 2.6L4.8 8.2 1 5.4h4.4z" />
      </svg>
    ))}
  </div>
);

const TestimonialCard = ({ testimonial }) => (
  <div
    className="glass-dark flex-shrink-0 px-8 py-10 flex flex-col items-center text-center"
    style={{
      width: '380px',
      minHeight: '320px',
      border: '1px solid rgba(255,195,0,0.15)',
    }}
  >
    {/* Quote mark */}
    <div
      className="font-playfair font-bold mb-4 leading-none select-none"
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
      className="font-cormorant italic leading-relaxed mb-6 flex-1"
      style={{
        fontSize: '1.15rem',
        fontWeight: 500,
        color: 'rgba(248,245,240,0.93)',
        maxWidth: '320px',
      }}
    >
      {testimonial.quote}
    </blockquote>

    {/* Author */}
    <div className="flex flex-col items-center gap-2">
      <img
        src={testimonial.image}
        alt={testimonial.name}
        className="w-12 h-12 rounded-full object-cover"
        style={{ border: '2px solid rgba(255,215,0,0.45)' }}
      />
      <div>
        <div className="font-cinzel text-sm tracking-[0.1em] uppercase" style={{ color: '#F8F5F0' }}>
          {testimonial.name}
        </div>
        <div className="font-cormorant text-xs italic mt-0.5" style={{ color: 'rgba(255,215,0,0.65)' }}>
          {testimonial.role}
        </div>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-10%' });

  // Duplicate testimonials for seamless infinite scroll
  const doubledTestimonials = [...testimonials, ...testimonials];

  return (
    <section
      id="testimonials"
      className="relative overflow-hidden"
      style={{ padding: '4.5rem 0', background: '#000' }}
    >
      {/* Subtle left glow */}
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
          <motion.p variants={fadeUp} className="font-cormorant italic" style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.8)' }}>
            The most honest reviews — from those who wore our artistry.
          </motion.p>
        </motion.div>

        {/* Auto-scrolling carousel */}
        <div className="testimonial-mask overflow-hidden">
          <div className="testimonial-track">
            {doubledTestimonials.map((testimonial, i) => (
              <TestimonialCard key={`${testimonial.id}-${i}`} testimonial={testimonial} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
