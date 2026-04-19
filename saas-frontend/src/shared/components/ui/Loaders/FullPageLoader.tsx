import { Box, CircularProgress, Typography, Fade } from '@mui/material';

interface Props {
    message?: string;
}

export const FullPageLoader = ({ message = 'Cargando...' }: Props) => {
    return (
        <Fade in timeout={500}>
            <Box
                sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                }}
            >
                <CircularProgress size={60} thickness={4} sx={{ color: 'primary.main' }} />
                <Typography
                    variant="h6"
                    sx={{ mt: 2, color: 'primary.main', fontWeight: 600, letterSpacing: 1 }}
                >
                    {message}
                </Typography>
            </Box>
        </Fade>
    );
};