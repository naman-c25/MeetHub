import React, { useEffect, useRef } from 'react'
import "../App.css"
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'

export default function LandingPage() {
    const router = useNavigate();
    const imageRef = useRef(null);
    const bgRef = useRef(null);

    useEffect(() => {
        // GSAP floating animation on the hero image
        gsap.to(imageRef.current, {
            y: -18,
            duration: 2.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });

        // GSAP subtle background pulse
        gsap.to(bgRef.current, {
            opacity: 0.7,
            duration: 4,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });
    }, []);

    const navVariants = {
        hidden: { y: -60, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    const heroTextVariants = {
        hidden: { opacity: 0, x: -60 },
        visible: (i) => ({
            opacity: 1,
            x: 0,
            transition: { delay: i * 0.18, duration: 0.7, ease: 'easeOut' },
        }),
    };

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.85, x: 60 },
        visible: { opacity: 1, scale: 1, x: 0, transition: { duration: 0.8, ease: 'easeOut', delay: 0.3 } },
    };

    const navItemVariants = {
        hidden: { opacity: 0, y: -15 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: 0.4 + i * 0.1, duration: 0.4 },
        }),
    };

    return (
        <div className='landingPageContainer'>
            <div ref={bgRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0 }} />

            <motion.nav variants={navVariants} initial="hidden" animate="visible">
                <div className='navHeader'>
                    <motion.h2
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        MeetHub Video Call
                    </motion.h2>
                </div>
                <div className='navlist'>
                    {['Join as Guest', 'Register'].map((label, i) => (
                        <motion.p
                            key={label}
                            custom={i}
                            variants={navItemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover={{ color: '#FF9839', scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => router(i === 0 ? '/aljk23' : '/auth')}
                        >
                            {label}
                        </motion.p>
                    ))}
                    <motion.div
                        custom={2}
                        variants={navItemVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => router('/auth')}
                        role='button'
                    >
                        <p>Login</p>
                    </motion.div>
                </div>
            </motion.nav>

            <div className="landingMainContainer">
                <div>
                    <motion.h1
                        custom={0}
                        variants={heroTextVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <span style={{ color: '#FF9839' }}>Connect</span> with your loved Ones
                    </motion.h1>

                    <motion.p
                        custom={1}
                        variants={heroTextVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        Cover a distance by MeetHub Video Call
                    </motion.p>

                    <motion.div
                        custom={2}
                        variants={heroTextVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.97 }}
                        role='button'
                    >
                        <Link to={'/auth'}>Get Started</Link>
                    </motion.div>
                </div>

                <motion.div variants={imageVariants} initial="hidden" animate="visible">
                    <img ref={imageRef} src="/mobile.png" alt="MeetHub app preview" />
                </motion.div>
            </div>
        </div>
    )
}
