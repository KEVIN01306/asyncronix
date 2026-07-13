import { Box, Typography } from "@mui/material";

const Header = () => {
    return (
        <Box sx={{ width: '100%' }}>
            <Box display="flex" justifyContent="center" mb={3}>
                <Box
                    component="img"
                    src="/icons/asyncronix_corto.png"
                    alt="Logo Asyncronix"
                    sx={{
                        height: 60,
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: (theme) => theme.palette.mode === 'dark'
                            ? 'drop-shadow(0px 4px 12px rgba(255,255,255,0.05))'
                            : 'drop-shadow(0px 4px 12px rgba(0,0,0,0.06))'
                    }}
                />
            </Box>

            <Typography
                variant="h2"
                sx={{
                    fontSize: '1.6rem',
                    fontWeight: 600,
                    letterSpacing: '-0.02em',
                    mb: 1,
                    color: 'text.primary',
                    textAlign: 'center'
                }}
            >
                Iniciar sesión
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    lineHeight: 1.5,
                    textAlign: 'center'
                }}
            >
                Introduce tus credenciales
            </Typography>
        </Box>
    );
};

export default Header;