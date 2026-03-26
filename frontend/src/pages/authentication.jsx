import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';
import { Snackbar } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: { main: '#FF9839' },
        secondary: { main: '#6c63ff' },
        background: {
            default: '#0a0a0f',
            paper: '#111118',
        },
        text: {
            primary: '#ffffff',
            secondary: '#a0a0b0',
        },
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
            },
        },
    },
});

export default function Authentication() {
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [name, setName] = React.useState('');
    const [error, setError] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [formState, setFormState] = React.useState(0);
    const [open, setOpen] = React.useState(false);
    const orbitRef = React.useRef(null);

    const { handleRegister, handleLogin } = React.useContext(AuthContext);

    React.useEffect(() => {
        // GSAP rotating orbit on the left panel decorative element
        if (orbitRef.current) {
            gsap.to(orbitRef.current, {
                rotation: 360,
                duration: 20,
                ease: 'none',
                repeat: -1,
            });
        }
    }, []);

    let handleAuth = async () => {
        try {
            if (formState === 0) {
                await handleLogin(username, password);
            }
            if (formState === 1) {
                let result = await handleRegister(name, username, password);
                setUsername('');
                setMessage(result);
                setOpen(true);
                setError('');
                setFormState(0);
                setPassword('');
            }
        } catch (err) {
            let msg = err.response?.data?.message || 'Something went wrong';
            setError(msg);
        }
    };

    const panelVariants = {
        hidden: { opacity: 0, x: 60 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: 'easeOut' } },
    };

    const fieldVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: (i) => ({
            opacity: 1,
            y: 0,
            transition: { delay: i * 0.12, duration: 0.45, ease: 'easeOut' },
        }),
    };

    return (
        <ThemeProvider theme={darkTheme}>
            <Grid container component="main" sx={{ height: '100vh' }}>
                <CssBaseline />

                {/* Left decorative panel */}
                <Grid
                    item xs={false} sm={4} md={7}
                    sx={{
                        background: 'linear-gradient(135deg, #0a0a0f 0%, #0f0f1a 40%, #1a0a2e 100%)',
                        display: { xs: 'none', sm: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        overflow: 'hidden',
                    }}
                >
                    {/* Animated decorative circles */}
                    <div ref={orbitRef} style={{
                        position: 'absolute',
                        width: '500px',
                        height: '500px',
                        border: '1px solid rgba(108,99,255,0.15)',
                        borderRadius: '50%',
                    }} />
                    <div style={{
                        position: 'absolute',
                        width: '350px',
                        height: '350px',
                        border: '1px solid rgba(255,152,57,0.1)',
                        borderRadius: '50%',
                    }} />
                    <div style={{
                        position: 'absolute',
                        width: '200px',
                        height: '200px',
                        background: 'radial-gradient(circle, rgba(108,99,255,0.15) 0%, transparent 70%)',
                        borderRadius: '50%',
                    }} />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        style={{ textAlign: 'center', zIndex: 1, padding: '2rem' }}
                    >
                        <motion.h1
                            animate={{ opacity: [0.7, 1, 0.7] }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                            style={{
                                fontSize: '2.8rem',
                                fontWeight: 800,
                                background: 'linear-gradient(90deg, #FF9839, #6c63ff)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text',
                                marginBottom: '1rem',
                            }}
                        >
                            MeetHub
                        </motion.h1>
                        <p style={{ color: '#a0a0b0', fontSize: '1.1rem' }}>
                            Connect with anyone, anywhere
                        </p>
                    </motion.div>
                </Grid>

                {/* Right form panel */}
                <Grid
                    item xs={12} sm={8} md={5}
                    component={Paper}
                    elevation={0}
                    square
                    sx={{ background: '#111118' }}
                >
                    <motion.div variants={panelVariants} initial="hidden" animate="visible">
                        <Box sx={{ my: 8, mx: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                            >
                                <Avatar sx={{ m: 1, bgcolor: '#6c63ff', width: 52, height: 52 }}>
                                    <LockOutlinedIcon />
                                </Avatar>
                            </motion.div>

                            {/* Tab switcher */}
                            <motion.div
                                custom={0}
                                variants={fieldVariants}
                                initial="hidden"
                                animate="visible"
                                style={{
                                    display: 'flex',
                                    background: '#0a0a0f',
                                    borderRadius: '10px',
                                    padding: '4px',
                                    gap: '4px',
                                    marginTop: '1rem',
                                    border: '1px solid #2a2a3e',
                                }}
                            >
                                {['Sign In', 'Sign Up'].map((label, i) => (
                                    <motion.button
                                        key={label}
                                        onClick={() => setFormState(i)}
                                        whileTap={{ scale: 0.96 }}
                                        style={{
                                            padding: '0.5rem 1.5rem',
                                            borderRadius: '8px',
                                            border: 'none',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            fontSize: '0.9rem',
                                            background: formState === i
                                                ? 'linear-gradient(135deg, #FF9839, #e07820)'
                                                : 'transparent',
                                            color: formState === i ? '#fff' : '#a0a0b0',
                                            transition: 'all 0.25s ease',
                                        }}
                                    >
                                        {label}
                                    </motion.button>
                                ))}
                            </motion.div>

                            <Box component="form" noValidate sx={{ mt: 2, width: '100%' }}>
                                <AnimatePresence mode="wait">
                                    {formState === 1 && (
                                        <motion.div
                                            key="name-field"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <TextField
                                                margin="normal"
                                                required
                                                fullWidth
                                                label="Full Name"
                                                value={name}
                                                autoFocus
                                                onChange={(e) => setName(e.target.value)}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        label="Username"
                                        value={username}
                                        autoFocus={formState === 0}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </motion.div>

                                <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                                    <TextField
                                        margin="normal"
                                        required
                                        fullWidth
                                        label="Password"
                                        value={password}
                                        type="password"
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </motion.div>

                                <AnimatePresence>
                                    {error && (
                                        <motion.p
                                            initial={{ opacity: 0, y: -8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -8 }}
                                            style={{ color: '#ff5555', marginTop: '0.5rem', fontSize: '0.88rem' }}
                                        >
                                            {error}
                                        </motion.p>
                                    )}
                                </AnimatePresence>

                                <motion.div
                                    custom={3}
                                    variants={fieldVariants}
                                    initial="hidden"
                                    animate="visible"
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <Button
                                        type="button"
                                        fullWidth
                                        variant="contained"
                                        sx={{ mt: 3, mb: 2, py: 1.4, fontSize: '1rem', fontWeight: 700, borderRadius: '10px' }}
                                        onClick={handleAuth}
                                    >
                                        {formState === 0 ? 'Login' : 'Register'}
                                    </Button>
                                </motion.div>
                            </Box>
                        </Box>
                    </motion.div>
                </Grid>
            </Grid>

            <Snackbar open={open} autoHideDuration={4000} message={message} />
        </ThemeProvider>
    );
}
