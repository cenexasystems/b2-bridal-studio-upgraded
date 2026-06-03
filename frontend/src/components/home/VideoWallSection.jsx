import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const videoWallVideos = [
    { id: 1, src: "/videos/a.mp4" },
    { id: 2, src: "/videos/b.mp4" },
    { id: 3, src: "/videos/c.mp4" },
    { id: 4, src: "/videos/d.mp4" },
    { id: 5, src: "/videos/e.mp4" },
    { id: 6, src: "/videos/f.mp4" },
];

const VideoCard = ({ video, onClick }) => {
    const videoRef = useRef(null);
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold: 0.1 }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => {
            if (containerRef.current) observer.unobserve(containerRef.current);
        };
    }, []);

    useEffect(() => {
        if (!videoRef.current) return;
        
        if (isVisible && !isHovered) {
            videoRef.current.play().catch(e => console.log('Autoplay prevented', e));
        } else {
            videoRef.current.pause();
        }
    }, [isVisible, isHovered]);

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    return (
        <div
            ref={containerRef}
            className="relative w-full max-w-[280px] mx-auto aspect-[9/16] overflow-hidden rounded-xl cursor-pointer group shadow-lg"
            style={{
                border: '1px solid rgba(212,175,55,0.4)',
                background: 'rgba(212,175,55,0.06)',
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onClick(video)}
        >
            {/* Golden ambient background glow */}
            <div className="absolute inset-0 scale-110 blur-2xl opacity-40 bg-gradient-to-tr from-[#FFD700]/10 via-transparent to-[#FFD700]/5 pointer-events-none" />

            <video
                ref={videoRef}
                src={video.src}
                muted
                loop
                playsInline
                preload="metadata"
                className="relative w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Play icon overlay on hover */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 backdrop-blur-[2px]"
                    >
                        <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center border border-[#FFD700]/50 shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const VideoWallSection = () => {
    const [selectedVideo, setSelectedVideo] = useState(null);

    const Modal = ({ video, onClose }) => {
        if (!video) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                <div className="relative h-[85vh] aspect-[9/16] flex flex-col justify-center items-center rounded-xl overflow-hidden border border-[#FFD700]/30 shadow-[0_0_30px_rgba(212,175,55,0.2)] bg-black">
                    <button 
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-[#FFD700] hover:text-black transition-colors"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                    
                    <video
                        src={video.src}
                        controls
                        autoPlay
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
        );
    };

    return (
        <section className="relative overflow-hidden" style={{ background: '#000', padding: '4rem 0' }}>
            <div className="max-w-[1100px] mx-auto px-4 md:px-6 relative">
                {/* Heading */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12 px-6"
                >
                    <h2 className="font-cinzel text-white uppercase mb-3" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', letterSpacing: '0.08em' }}>
                        Video Testimonials
                    </h2>
                    <p className="text-[#FFD700] text-sm md:text-base font-medium uppercase tracking-widest">
                        Real Brides, Real Experiences
                    </p>
                </motion.div>

                {/* Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5 px-4 md:px-0 items-center justify-center max-w-[900px] mx-auto">
                    {videoWallVideos.map(video => (
                        <div key={video.id} className="w-full">
                            <VideoCard video={video} onClick={setSelectedVideo} />
                        </div>
                    ))}
                </div>

                {/* Follow For More */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="mt-12 flex flex-col items-center justify-center gap-4"
                >
                    <p className="text-[#FFD700] text-sm md:text-base font-medium uppercase tracking-widest font-cinzel">
                        Follow For More
                    </p>
                    <div className="flex gap-6">
                        <a 
                            href="https://www.instagram.com/b2_bridal_studio_" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full border border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.06)] flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110"
                            title="B2 Bridal Studio Instagram"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                        <a 
                            href="https://www.instagram.com/tharagai_b2_entrepreneur/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="w-12 h-12 rounded-full border border-[rgba(212,175,55,0.4)] bg-[rgba(212,175,55,0.06)] flex items-center justify-center text-[#FFD700] hover:bg-[#FFD700] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-110"
                            title="Tharagai B2 Entrepreneur Instagram"
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                            </svg>
                        </a>
                    </div>
                </motion.div>
            </div>

            {/* Modal */}
            <AnimatePresence>
                {selectedVideo && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50"
                    >
                        <Modal video={selectedVideo} onClose={() => setSelectedVideo(null)} />
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

export default VideoWallSection;
