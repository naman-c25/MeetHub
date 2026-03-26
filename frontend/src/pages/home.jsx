import React, { useContext, useEffect, useRef, useState } from 'react'
import withAuth from '../utils/withAuth'
import { useNavigate } from 'react-router-dom'
import "../App.css";
import { Button, IconButton, Snackbar, TextField, Tooltip } from '@mui/material';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { AuthContext } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import generateMeetingId from '../utils/generateMeetingId';

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
                outlined: {
                    borderColor: '#2a2a3e',
                    color: '#a0a0b0',
                    '&:hover': { borderColor: '#6c63ff', color: '#fff', background: 'rgba(108,99,255,0.08)' },
                },
                text: { color: '#a0a0b0', '&:hover': { color: '#fff' } },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { color: '#a0a0b0', '&:hover': { color: '#fff' } },
            },
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: { background: '#1a1a2e', color: '#fff', border: '1px solid #2a2a3e' },
            },
        },
    },
});

function HomeComponent() {
    let navigate = useNavigate();
    const [meetingCode, setMeetingCode] = useState('');
    const [newMeetingId, setNewMeetingId] = useState('');
    const [copied, setCopied] = useState(false);
    const { addToUserHistory } = useContext(AuthContext);
    const glowRef = useRef(null);

    useEffect(() => {
        gsap.to(glowRef.current, {
            scale: 1.15,
            opacity: 0.6,
            duration: 1.8,
            ease: 'sine.inOut',
            yoyo: true,
            repeat: -1,
        });
    }, []);

    const handleJoinVideoCall = async () => {
        if (!meetingCode.trim()) return;
        await addToUserHistory(meetingCode.trim());
        navigate(`/${meetingCode.trim()}`);
    };

    const handleNewMeeting = async () => {
        const id = generateMeetingId();
        setNewMeetingId(id);
        await addToUserHistory(id);
        navigate(`/${id}`);
    };

    const handleCopyId = () => {
        navigator.clipboard.writeText(newMeetingId);
        setCopied(true);
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
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
                            <motion.h2 variants={itemVariants}>
                                Providing Quality Video Call<br />
                                <span style={{ color: '#FF9839' }}>Just Like Quality Education</span>
                            </motion.h2>

                            {/* New Meeting button */}
                            <motion.div variants={itemVariants}>
                                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleNewMeeting}
                                        sx={{ py: 1.6, px: 3, borderRadius: '10px', fontWeight: 700, fontSize: '1rem' }}
                                    >
                                        New Meeting
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* Divider */}
                            <motion.div
                                variants={itemVariants}
                                style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                            >
                                <div style={{ flex: 1, height: '1px', background: '#2a2a3e' }} />
                                <span style={{ color: '#555570', fontSize: '0.8rem' }}>or join with a code</span>
                                <div style={{ flex: 1, height: '1px', background: '#2a2a3e' }} />
                            </motion.div>

                            {/* Join by code */}
                            <motion.div
                                variants={itemVariants}
                                style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}
                            >
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
                                    onKeyDown={e => e.key === 'Enter' && handleJoinVideoCall()}
                                    label="Enter meeting code"
                                    variant="outlined"
                                    value={meetingCode}
                                    sx={{ minWidth: '220px' }}
                                />
                                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                                    <Button
                                        onClick={handleJoinVideoCall}
                                        variant="outlined"
                                        sx={{ py: 1.8, px: 3, borderRadius: '10px', fontWeight: 700 }}
                                    >
                                        Join
                                    </Button>
                                </motion.div>
                            </motion.div>

                            {/* Generated meeting ID display (shown after creating a new meeting) */}
                            <AnimatePresence>
                                {newMeetingId && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        transition={{ duration: 0.35 }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            padding: '12px 16px',
                                            background: 'rgba(108,99,255,0.1)',
                                            border: '1px solid rgba(108,99,255,0.3)',
                                            borderRadius: '10px',
                                        }}
                                    >
                                        <div style={{ flex: 1 }}>
                                            <p style={{ color: '#a0a0b0', fontSize: '0.75rem', marginBottom: '2px' }}>
                                                Your meeting ID
                                            </p>
                                            <p style={{ color: '#fff', fontWeight: 700, fontSize: '1rem', letterSpacing: '0.5px' }}>
                                                {newMeetingId}
                                            </p>
                                        </div>
                                        <Tooltip title={copied ? 'Copied!' : 'Copy ID'}>
                                            <IconButton onClick={handleCopyId} size="small" sx={{ color: copied ? '#FF9839' : '#a0a0b0' }}>
                                                <ContentCopyIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </motion.div>
                                )}
                            </AnimatePresence>
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

            <Snackbar
                open={copied}
                autoHideDuration={2000}
                onClose={() => setCopied(false)}
                message="Meeting ID copied to clipboard"
            />
        </ThemeProvider>
    );
}

export default withAuth(HomeComponent);
