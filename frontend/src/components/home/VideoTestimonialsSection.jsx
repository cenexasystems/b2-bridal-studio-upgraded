import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const videos = [
    { id: 1, src: '/videos/v-5.mp4' },
    { id: 2, src: '/videos/v-1.mp4' },
    { id: 3, src: '/videos/v-3.mp4' },
    { id: 4, src: '/videos/v-2.mp4' },
];

// Slide animation (kept for premium feel)
const variants = {
    enter: (dir) => ({ opacity: 0, x: dir > 0 ? 120 : -120, scale: 0.96 }),
    center: { opacity: 1, x: 0, scale: 1 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -120 : 120, scale: 0.96 }),
};

const VideoTestimonialsSection = () => {
    const [[index, dir], setIndex] = useState([0, 0]);
    const videoRef = useRef(null);

    const paginate = (direction) => {
        setIndex(([prev]) => {
            const next = (prev + direction + videos.length) % videos.length;
            return [next, direction];
        });
    };

    const current = videos[index];

    return (
        <section
            className="relative overflow-hidden"
            style={{ background: '#000', padding: '4rem 0' }}
        >
            {/* Gold ambient glow */}
            <div
                className="pointer-events-none absolute inset-0"
                style={{
                    background:
                        'radial-gradient(ellipse at 20% 30%, rgba(212,175,55,0.08), transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(212,175,55,0.06), transparent 60%)',
                }}
            />

            <div className="max-w-[1100px] mx-auto px-6 text-center relative">
                {/* Heading */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="font-cinzel text-white uppercase mb-6"
                    style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', letterSpacing: '0.08em' }}
                >
                    Video Testimonials
                </motion.h2>

                {/* Frame */}
                <div className="relative flex items-center justify-center">

                    {/* LEFT */}
                    <button
                        onClick={() => paginate(-1)}
                        className="absolute left-0 z-20 w-12 h-12 flex items-center justify-center backdrop-blur-md"
                        style={{
                            border: '1px solid rgba(212,175,55,0.45)',
                            color: '#D4AF37',
                            background: 'rgba(212,175,55,0.06)',
                        }}
                    >
                        ←
                    </button>

                    {/* GLASS VIDEO CARD */}
                    <div
                        className="relative w-full max-w-3xl overflow-hidden group"
                        style={{
                            border: '1px solid rgba(212,175,55,0.5)',
                            background: 'rgba(212,175,55,0.06)',
                            backdropFilter: 'blur(16px)',
                        }}
                    >
                        <AnimatePresence initial={false} custom={dir}>
                            <motion.div
                                key={index}
                                custom={dir}
                                variants={variants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{ duration: 0.6 }}
                                className="relative"
                            >
                                {/* Background blur */}
                                <div
                                    className="absolute inset-0 scale-110 blur-2xl opacity-40"
                                    style={{
                                        backgroundImage: `url(${current.src})`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center',
                                    }}
                                />

                                {/* VIDEO (NORMAL CONTROLS ENABLED) */}
                                <video
                                    ref={videoRef}
                                    key={current.src}
                                    src={current.src}
                                    controls   // ✅ native controls
                                    className="relative w-full h-[360px] object-cover"
                                    style={{ background: '#000' }}
                                />

                                {/* Cinematic overlay */}
                                <div
                                    className="absolute inset-0 pointer-events-none"
                                    style={{
                                        background:
                                            'linear-gradient(to top, rgba(0,0,0,0.5), transparent 60%)',
                                    }}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT */}
                    <button
                        onClick={() => paginate(1)}
                        className="absolute right-0 z-20 w-12 h-12 flex items-center justify-center backdrop-blur-md"
                        style={{
                            border: '1px solid rgba(212,175,55,0.45)',
                            color: '#D4AF37',
                            background: 'rgba(212,175,55,0.06)',
                        }}
                    >
                        →
                    </button>
                </div>

                {/* Indicators */}
                <div className="flex justify-center gap-3 mt-8">
                    {videos.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setIndex([i, i > index ? 1 : -1])}
                            className="cursor-pointer transition-all duration-300"
                            style={{
                                width: i === index ? '32px' : '10px',
                                height: '2px',
                                background: i === index ? '#FFD700' : 'rgba(255,195,0,0.3)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoTestimonialsSection;
