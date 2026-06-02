import React, { useState, useEffect, useRef } from 'react';
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
    const [mobileIndex, setMobileIndex] = useState(0);
    const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
    
    const videoRef = useRef(null);
    const scrollRef = useRef(null);

    // Detect screen width for mobile/tablet layout
    useEffect(() => {
        const handleResize = () => {
            setIsMobileOrTablet(window.innerWidth < 1024);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const paginate = (direction) => {
        setIndex(([prev]) => {
            const next = (prev + direction + videos.length) % videos.length;
            return [next, direction];
        });
    };

    const handleDragEnd = (event, info) => {
        const swipeThreshold = 50; // pixels to trigger paging
        if (info.offset.x < -swipeThreshold) {
            paginate(1);
        } else if (info.offset.x > swipeThreshold) {
            paginate(-1);
        }
    };

    // Track active card center on mobile horizontal scroll
    const handleScroll = (e) => {
        const container = e.currentTarget;
        const scrollLeft = container.scrollLeft;
        const containerWidth = container.clientWidth;
        const children = container.children;

        let closestIndex = 0;
        let minDiff = Infinity;

        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            const childCenter = child.offsetLeft + child.clientWidth / 2;
            const containerCenter = scrollLeft + containerWidth / 2;
            const diff = Math.abs(childCenter - containerCenter);

            if (diff < minDiff) {
                minDiff = diff;
                closestIndex = i;
            }
        }
        setMobileIndex(closestIndex);
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

                {isMobileOrTablet ? (
                    /* MOBILE & TABLET LAYOUT: Touch Swipe native scroll-snap slider */
                    <div className="relative w-full">
                        <div
                            ref={scrollRef}
                            onScroll={handleScroll}
                            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-none pb-4 px-2"
                            style={{
                                scrollbarWidth: 'none',
                                msOverflowStyle: 'none',
                                scrollBehavior: 'smooth',
                            }}
                        >
                            {videos.map((video) => (
                                <div
                                    key={video.id}
                                    className="snap-center shrink-0 w-[85vw] max-w-[420px]"
                                >
                                    <div
                                        className="relative w-full overflow-hidden rounded-sm"
                                        style={{
                                            border: '1px solid rgba(212,175,55,0.4)',
                                            background: 'rgba(212,175,55,0.06)',
                                            backdropFilter: 'blur(16px)',
                                            WebkitBackdropFilter: 'blur(16px)',
                                        }}
                                    >
                                        {/* Golden ambient background glow */}
                                        <div
                                            className="absolute inset-0 scale-110 blur-2xl opacity-40 bg-gradient-to-tr from-[#FFD700]/10 via-transparent to-[#FFD700]/5 pointer-events-none"
                                        />

                                        {/* VIDEO */}
                                        <video
                                            src={video.src}
                                            controls
                                            className="relative w-full h-[240px] sm:h-[320px] object-cover"
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    /* DESKTOP LAYOUT: Exactly the original design and layout */
                    <div className="relative flex items-center justify-center">

                        {/* LEFT ARROW */}
                        <button
                            onClick={() => paginate(-1)}
                            className="absolute left-0 z-20 w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-90"
                            style={{
                                border: 'none',
                                color: '#FFD700',
                                background: 'transparent',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                                e.currentTarget.style.color = '#FFFFFF';
                                e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.color = '#FFD700';
                                e.currentTarget.style.filter = 'none';
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </button>

                        {/* GLASS VIDEO CARD WITH DRAG SUPPORT */}
                        <div
                            className="relative w-full max-w-3xl overflow-hidden group rounded-sm"
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
                                    drag="x"
                                    dragConstraints={{ left: 0, right: 0 }}
                                    dragElastic={0.2}
                                    onDragEnd={handleDragEnd}
                                    className="relative cursor-grab active:cursor-grabbing touch-pan-y"
                                >
                                    {/* Golden ambient background glow */}
                                    <div
                                        className="absolute inset-0 scale-110 blur-2xl opacity-40 bg-gradient-to-tr from-[#FFD700]/10 via-transparent to-[#FFD700]/5 pointer-events-none"
                                    />

                                    {/* VIDEO */}
                                    <video
                                        ref={videoRef}
                                        key={current.src}
                                        src={current.src}
                                        controls
                                        className="relative w-full h-[450px] object-cover"
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

                        {/* RIGHT ARROW */}
                        <button
                            onClick={() => paginate(1)}
                            className="absolute right-0 z-20 w-12 h-12 flex items-center justify-center cursor-pointer transition-all duration-300 active:scale-90"
                            style={{
                                border: 'none',
                                color: '#FFD700',
                                background: 'transparent',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.transform = 'scale(1.2)';
                                e.currentTarget.style.color = '#FFFFFF';
                                e.currentTarget.style.filter = 'drop-shadow(0 0 8px rgba(255, 215, 0, 0.8))';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.transform = 'scale(1)';
                                e.currentTarget.style.color = '#FFD700';
                                e.currentTarget.style.filter = 'none';
                            }}
                        >
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14M12 5l7 7-7 7"/>
                            </svg>
                        </button>
                    </div>
                )}

                {/* Indicators / Pagination Dots */}
                <div className="flex justify-center gap-3 mt-8">
                    {videos.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => {
                                if (isMobileOrTablet) {
                                    const container = scrollRef.current;
                                    if (container && container.children[i]) {
                                        const target = container.children[i];
                                        container.scrollTo({
                                            left: target.offsetLeft - (container.clientWidth - target.clientWidth) / 2,
                                            behavior: 'smooth',
                                        });
                                    }
                                } else {
                                    setIndex([i, i > index ? 1 : -1]);
                                }
                            }}
                            className="cursor-pointer transition-all duration-300"
                            style={{
                                width: (isMobileOrTablet ? i === mobileIndex : i === index) ? '32px' : '10px',
                                height: '2px',
                                background: (isMobileOrTablet ? i === mobileIndex : i === index) ? '#FFD700' : 'rgba(255,195,0,0.3)',
                            }}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default VideoTestimonialsSection;
