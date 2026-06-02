import React, { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { fadeUp, staggerContainer } from '../../animations/variants';
import { Link } from 'react-router-dom';

const courses = [
  {
    id: 1,
    image: '/images/bridal4.jpeg',
    category: 'Bridal',
    title: 'Bridal Makeup Mastery',
    description: 'Complete bridal transformation — from skin prep to final look. Learn HD, airbrush, and traditional styles.',
    duration: '3 Months',
    level: 'All Levels',
  },
  {
    id: 2,
    image: '/images/fashion.jpeg',
    category: 'Fashion',
    title: 'Fashion & Styling',
    description: 'Couture draping, outfit coordination, color theory, and editorial styling for shoots and ramps.',
    duration: '2 Months',
    level: 'Intermediate',
  },
  {
    id: 3,
    image: '/images/embroidary.jpeg',
    category: 'Craft',
    title: 'Embroidery & Crafts',
    description: 'Zardozi, thread work, and modern embroidery art — perfect for creative professionals.',
    duration: '6 Weeks',
    level: 'Beginner',
  },
  {
    id: 4,
    image: '/images/jewelry.png',
    category: 'Jewellery',
    title: 'Jewellery Making',
    description: 'Design and craft exquisite pieces — from temple jewellery to contemporary luxury designs.',
    duration: '2 Months',
    level: 'All Levels',
  },
  {
    id: 5,
    image: '/images/bag.png',
    category: 'Accessories',
    title: 'Bags & Accessories',
    description: 'Create premium handbags, clutches, and accessories using luxury materials and modern techniques.',
    duration: '6 Weeks',
    level: 'Beginner',
  },
  {
    id: 6,
    image: '/images/bridal8.jpeg',
    category: 'Special',
    title: 'Special Occasion Looks',
    description: 'Party makeup, reception looks, and festive styling for every celebration and occasion.',
    duration: '4 Weeks',
    level: 'All Levels',
  },
];

const levelColors = {
  'All Levels': '#FFD700',
  'Intermediate': '#c48a00',
  'Beginner': 'rgba(255,195,0,0.6)',
};

const CourseCard = ({ course, delay }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative flex flex-col"
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,195,0,0.12)',
        transition: 'all 0.4s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(255,195,0,0.35)';
        e.currentTarget.style.background = 'rgba(255,195,0,0.04)';
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 16px 50px rgba(255,195,0,0.1)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,195,0,0.12)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.02)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top color bar */}
      <div
        className="h-px"
        style={{ background: 'linear-gradient(90deg, #FFD700, transparent)' }}
      />

      <div className="p-7 flex flex-col flex-1">
        {/* Image + Category */}
        <div className="course-card-header flex items-start justify-between mb-5">
          {/* IMAGE instead of icon */}
          <div
            className="course-card-img-wrap"
            style={{
              width: '240px',
              height: '170px',
              overflow: 'hidden',
              borderRadius: '8px',
              border: '1px solid rgba(255,195,0,0.25)',
              flexShrink: 0,
            }}
          >
            <img
              src={course.image}
              alt={course.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          <span
            className="font-cinzel text-[0.55rem] tracking-[0.3em] uppercase px-3 py-1 text-center"
            style={{
              color: '#FFD700',
              border: '1px solid rgba(255,195,0,0.25)',
              background: 'rgba(255,195,0,0.06)',
            }}
          >
            {course.category}
          </span>
        </div>

        {/* Title */}
        <h3
          className="font-playfair font-semibold mb-3 leading-snug"
          style={{ fontSize: '1.2rem', color: '#F8F5F0' }}
        >
          {course.title}
        </h3>

        {/* Gold divider */}
        <div className="gold-divider-left mb-4" />

        {/* Description */}
        <p
          className="font-cormorant leading-relaxed flex-1 mb-5"
          style={{ fontSize: '1.05rem', color: 'rgba(248,245,240,0.92)' }}
        >
          {course.description}
        </p>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div
                className="mb-5 py-4 px-4"
                style={{
                  background: 'rgba(255,195,0,0.05)',
                  border: '1px solid rgba(255,195,0,0.1)',
                }}
              >
                <div className="flex justify-between mb-2">
                  <span className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase font-bold" style={{ color: '#FFD700' }}>Duration</span>
                  <span className="font-cormorant text-sm font-bold" style={{ color: '#FFD700' }}>{course.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-cinzel text-[0.6rem] tracking-[0.2em] uppercase font-bold" style={{ color: '#FFD700' }}>Level</span>
                  <span className="font-cormorant text-sm font-bold" style={{ color: '#FFD700' }}>{course.level}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* CTA row */}
        <div className="flex items-center justify-between mt-auto">
          <button
            onClick={() => setExpanded(!expanded)}
            className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase transition-colors duration-200"
            style={{ color: '#FFD700', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {expanded ? 'Show Less ↑' : 'Details ↓'}
          </button>
          <Link
            to="/courses"
            className="font-cinzel text-[0.65rem] tracking-[0.2em] uppercase px-4 py-2 transition-all duration-300"
            style={{
              color: '#000',
              background: 'linear-gradient(135deg, #FFD700, #FFE566)',
            }}
          >
            Enroll
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const CoursesGrid = () => {
  return (
    <section
      id="courses"
      className="relative overflow-hidden"
      style={{ padding: '5.5rem 0', background: '#000' }}
    >
      <div className="max-w-[1300px] mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="max-w-[1300px] mx-auto px-6 lg:px-12">
          {/* Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-10%' }}
            variants={staggerContainer}
            className="mb-16 text-center"
          >
            <motion.div variants={fadeUp} className="flex items-center justify-center gap-4 mb-4">
              <div className="gold-divider" style={{ width: '40px' }} />
              <span className="font-cinzel text-[0.65rem] tracking-[0.4em] uppercase" style={{ color: '#FFD700' }}>
                03 — Academy
              </span>
              <div className="gold-divider" style={{ width: '40px' }} />
            </motion.div>

            <motion.h2
              variants={fadeUp}
              className="font-cinzel font-bold uppercase mb-4"
              style={{
                fontSize: 'clamp(1.8rem, 4vw, 3rem)',
                letterSpacing: '0.05em',
                color: '#F8F5F0',
              }}
            >
              Courses & Training
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="font-cormorant italic mx-auto"
              style={{ fontSize: '1.15rem', color: 'rgba(248,245,240,0.92)', maxWidth: '480px' }}
            >
              Master the art of beauty with industry-leading professional courses.
            </motion.p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {courses.map((course, i) => (
            <CourseCard key={course.id} course={course} delay={i * 0.07} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link to="/courses" className="btn-outline-gold">
            View All Courses
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CoursesGrid;