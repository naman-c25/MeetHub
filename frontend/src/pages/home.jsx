import React, { useContext, useEffect, useRef, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, TextField } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import { AuthContext } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#FF9839' },
        secondary: { main: '#6c63ff' },
        background: { default: '#0a0a0f', paper: '#111118' },
    },
    components: {
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        '& fieldset': { borderColor: '#2a2a3e' },
                        '&:hover fieldset': { borderColor: '#6c63ff' },
                        '&.Mui-focused fieldset': { borderColor: '#FF9839' },
                        backgroundColor: '#0a0a0f',
                    },
                    '& .MuiInputLabel-root': { color: '#a0a0b0' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#FF9839' },
                    '& .MuiOutlinedInput-input': { color: '#ffffff' },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                contained: {
                    background: 'linear-gradient(135deg, #FF9839, #e07820)',
                    boxShadow: '0 4px 20px rgba(255,152,57,0.3)',
                    '&:hover': {
                        background: 'linear-gradient(135deg, #e07820, #FF9839)',
                        boxShadow: '0 6px 28px rgba(255,152,57,0.4)',
                    },
                },
                text: { color: '#a0a0b0', '&:hover': { color: '#fff' } },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { color: '#a0a0b0', '&:hover': { color: '#fff' } },
            },
        },
    },
});

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState('');
    const { addToUserHistory } = useContext(AuthContext);
    const glowRef = useRef(null);

    useEffect(() => {
        // GSAP pulsing glow behind the join button
        gsap.to(glowRef.current, {
            scale: 1.15,
            opacity: 0.6,
            duration: 1.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });
    }, []);

    let handleJoinVideoCall = async () => {
        await addToUserHistory(meetingCode);
        navigate(`/${meetingCode}`);
    };

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.15 } },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div style={{ background: '#0a0a0f', minHeight: '100vh' }}>
                {/* Navbar */}
                <motion.div
                    className="navBar"
                    initial={{ y: -60, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h2>MeetHub Video Call</h2>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <IconButton onClick={() => navigate('/history')}>
                            <RestoreIcon />
                        </IconButton>
                        <p style={{ color: '#a0a0b0', fontSize: '0.9rem' }}>History</p>
                        <Button onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/auth');
                        }}>
                            Logout
                        </Button>
                    </div>
                </motion.div>

                {/* Main content */}
                <div className="meetContainer">
                    <motion.div
                        className="leftPanel"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <div>
                            <motion.h2 variants={itemVariants}>
                                Providing Quality Video Call<br />
                                <span style={{ color: '#FF9839' }}>Just Like Quality Education</span>
                            </motion.h2>

                            <motion.div
                                variants={itemVariants}
                                style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}
                            >
                                {/* Glow effect behind join button */}
                                <div
                                    ref={glowRef}
                                    style={{
                                        position: 'absolute',
                                        right: '0',
                                        width: '80px',
                                        height: '80px',
                                        background: 'radial-gradient(circle, rgba(255,152,57,0.35) 0%, transparent 70%)',
                                        borderRadius: '50%',
                                        pointerEvents: 'none',
                                        transform: 'translate(10px, 0)',
                                    }}
                                />
                                <TextField
                                    onChange={e => setMeetingCode(e.target.value)}
                                    label="Meeting Code"
                                    variant="outlined"
                                    value={meetingCode}
                                />
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                    <Button onClick={handleJoinVideoCall} variant='contained' sx={{ py: 1.8, px: 3, borderRadius: '10px', fontWeight: 700 }}>
                                        Join
                                    </Button>
                                </motion.div>
                            </motion.div>
                        </div>
                    </motion.div>

                    <motion.div
                        className='rightPanel'
                        initial={{ opacity: 0, x: 60, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
                    >
                        <img srcSet='/logo3.png' alt="MeetHub" />
                    </motion.div>
                </div>
            </div>
        </ThemeProvider>
    );
}

export default withAuth(HomeComponent);
