import { Box, Typography, Fade } from '@mui/material';

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
                    bgcolor: 'background.paper',
                    backdropFilter: 'blur(4px)',
                    zIndex: 9999,
                }}
            >
                {/* Contenedor del Spinner */}
                <Box
                    sx={(theme) => {
                        // 1. Extraemos el color primario del tema activo
                        const primaryColor = theme.palette.primary.main;
                        
                        // 2. Limpiamos el string del color (quitamos el '#' si viene en hex) para meterlo en el SVG seguro
                        const safeColor = primaryColor.startsWith('#') 
                            ? encodeURIComponent(primaryColor) 
                            : encodeURIComponent(primaryColor);

                        return {
                            position: 'relative',
                            width: '10em',
                            height: '10em',
                            mb: 4,
                            
                            '& .spinner:before, & .spinner:after': {
                                boxSizing: 'border-box',
                                content: '""',
                                display: 'block',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                marginTop: '-5em',
                                marginLeft: '-5em',
                                width: '100%',
                                height: '100%',
                                transformStyle: 'preserve-3d',
                                transformOrigin: '50% 50%',
                                perspectiveOrigin: '50% 50%',
                                perspective: '340px',
                                backgroundSize: '10em 10em',
                                backgroundRepeat: 'no-repeat',
                                /* INYECTAMOS EL COLOR DIRECTAMENTE:
                                   Cambiamos fill='currentColor' por fill='${safeColor}'.
                                   De esta forma obligamos al SVG a renderizar exactamente tu primary.main.
                                */
                                backgroundImage: `url("data:image/svg+xml;utf8,<svg width='266px' height='297px' viewBox='0 0 266 297' version='1.1' xmlns='http://www.w3.org/2000/svg'><g fill='none' fill-rule='evenodd'><path d='M171.507813,3.25000038 C226.208183,12.8577111 297.112722,71.4912823 250.895599,108.410155 C216.582204,135.82031 186.528405,97.0624964 156.800774,85.7734346 C127.073143,74.4843721 76.8884632,84.2161462 60.1289065,108.410153 C-15.9804685,218.281247 145.277344,296.667968 145.277344,296.667968 C145.277344,296.667968 -25.4492187,257.242198 3.3984375,108.410155 C16.3070661,41.8114174 84.7275829,-11.9922985 171.507813,3.25000038 Z' fill='${safeColor}'></path></g></svg>")`,
                            },

                            '& .spinner:before': {
                                transform: 'rotateX(60deg) rotateY(45deg) rotateZ(45deg)',
                                animation: 'rotateBefore 750ms infinite linear reverse',
                            },

                            '& .spinner:after': {
                                transform: 'rotateX(240deg) rotateY(45deg) rotateZ(45deg)',
                                animation: 'rotateAfter 750ms infinite linear',
                            },

                            '@keyframes rotateBefore': {
                                'from': { transform: 'rotateX(60deg) rotateY(45deg) rotateZ(0deg)' },
                                'to': { transform: 'rotateX(60deg) rotateY(45deg) rotateZ(-360deg)' },
                            },

                            '@keyframes rotateAfter': {
                                'from': { transform: 'rotateX(240deg) rotateY(45deg) rotateZ(0deg)' },
                                'to': { transform: 'rotateX(240deg) rotateY(45deg) rotateZ(360deg)' },
                            },
                        };
                    }}
                >
                    <div className="spinner" />
                </Box>

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