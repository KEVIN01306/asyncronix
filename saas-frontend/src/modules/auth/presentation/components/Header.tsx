import { Box, Typography } from "@mui/material";

const Header = () => {
    return (
        <Box sx={{ width: '100%' }}>
            {/* Contenedor del Logo con alineación a la izquierda y espaciado orgánico */}
            <Box display="flex" justifyContent="flex-start" mb={3}>
                <Box
                    component="img"
                    src="/icons/asyncronix_corto.png"
                    alt="Logo Asyncronix"
                    sx={{
                        height: 52, // Altura más estilizada y moderna tipo Apple ID
                        width: 'auto',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        // Sutil sombra suavizada sin sobrecargar la UI
                        filter: (theme) => theme.palette.mode === 'dark'
                            ? 'drop-shadow(0px 4px 12px rgba(255,255,255,0.05))'
                            : 'drop-shadow(0px 4px 12px rgba(0,0,0,0.06))'
                    }}
                />
            </Box>

            {/* Título Principal de Acceso */}
            <Typography
                variant="h2"
                sx={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    mb: 1,
                    color: 'text.primary'
                }}
            >
                Iniciar sesión
            </Typography>

            {/* Subtexto descriptivo */}
            <Typography
                variant="body2"
                sx={{
                    color: 'text.secondary',
                    lineHeight: 1.5
                }}
            >
                Introduce tus credenciales para acceder al panel de administración de tu negocio.
            </Typography>
        </Box>
    );
};

export default Header;