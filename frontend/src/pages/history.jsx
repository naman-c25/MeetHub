import React, { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import { createTheme, ThemeProvider } from '@mui/material/styles';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#FF9839' },
        secondary: { main: '#6c63ff' },
        background: { default: '#0a0a0f', paper: '#1a1a2e' },
        text: { primary: '#ffffff', secondary: '#a0a0b0' },
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    background: '#1a1a2e',
                    border: '1px solid #2a2a3e',
                    borderRadius: '14px',
                    transition: 'border-color 0.2s, transform 0.2s',
                    '&:hover': {
                        borderColor: '#6c63ff',
                        transform: 'translateY(-2px)',
                    },
                },
            },
        },
        MuiIconButton: {
            styleOverrides: {
                root: { color: '#a0a0b0', '&:hover': { color: '#fff' } },
            },
        },
    },
});

export default function History() {
    const { getHistoryOfUser } = useContext(AuthContext);
    const [meetings, setMeetings] = useState([]);
    const routeTo = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const history = await getHistoryOfUser();
                setMeetings(history);
            } catch {
                // IMPLEMENT SNACKBAR
            }
        };
        fetchHistory();
    }, [getHistoryOfUser]);

    let formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const containerVariants = {
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
    };

    const cardVariants = {
        hidden: { opacity: 0, y: 30, scale: 0.96 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: 'easeOut' } },
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 50%, #1a0a2e 100%)',
                padding: '2rem',
            }}>
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginBottom: '2rem',
                        padding: '1rem 1.5rem',
                        background: 'rgba(17,17,24,0.9)',
                        backdropFilter: 'blur(12px)',
                        borderRadius: '14px',
                        border: '1px solid #2a2a3e',
                    }}
                >
                    <IconButton onClick={() => routeTo('/home')}>
                        <HomeIcon />
                    </IconButton>
                    <h2 style={{
                        background: 'linear-gradient(90deg, #FF9839, #6c63ff)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                        fontWeight: 700,
                        fontSize: '1.5rem',
                    }}>
                        Meeting History
                    </h2>
                </motion.div>

                {/* Cards */}
                {meetings.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        style={{
                            textAlign: 'center',
                            marginTop: '6rem',
                            color: '#a0a0b0',
                        }}
                    >
                        <p style={{ fontSize: '1.1rem' }}>No meeting history yet.</p>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                            gap: '1rem',
                            maxWidth: '900px',
                            margin: '0 auto',
                        }}
                    >
                        {meetings.map((e, i) => (
                            <motion.div key={i} variants={cardVariants} whileHover={{ y: -4 }}>
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography
                                            sx={{ fontSize: 12, color: '#a0a0b0', textTransform: 'uppercase', letterSpacing: 1, mb: 0.5 }}
                                            gutterBottom
                                        >
                                            Meeting Code
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            sx={{ color: '#FF9839', fontWeight: 700, mb: 1.5 }}
                                        >
                                            {e.meetingCode}
                                        </Typography>
                                        <Typography sx={{ color: '#a0a0b0', fontSize: '0.88rem' }}>
                                            {formatDate(e.date)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </ThemeProvider>
    );
}
