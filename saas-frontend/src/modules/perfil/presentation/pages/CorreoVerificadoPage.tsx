import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../../core/store/authStore';
import {
    Box,
    Typography,
    Button,
    Stack,
    Paper,
    Divider,
    IconButton,
    CircularProgress
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    CheckCircleOutlined as CheckCircleIcon,
    ArrowBack as ArrowBackIcon,
    ArrowForward as ArrowForwardIcon,
    ShieldOutlined as ShieldIcon,
    LockOutlined as LockIcon
} from '@mui/icons-material';
import { authRepository } from '../../../auth/infrastructure/repositories/auth.repository';

export const CorreoVerificadoPage = () => {
    const navigate = useNavigate();
    const getMeStore = useAuthStore((state) => state.getMe);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const fetchMeAndCheck = async () => {
            try {
                const latestUser = await authRepository.getMe();
                getMeStore(latestUser);

                if (!latestUser?.verificado) {
                    navigate('/perfil', { replace: true });
                    return;
                }
                setIsChecking(false);
            } catch (error) {
                console.error("Error fetching me", error);
                navigate('/perfil', { replace: true });
            }
        };
        fetchMeAndCheck();
    }, [navigate, getMeStore]);

    if (isChecking) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    width: '100%',
                    bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <CircularProgress size={32} sx={{ color: 'text.secondary' }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#0d1117' : '#f6f8fa',
                color: 'text.primary',
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            {/* Header minimalista estilo GitHub */}
            <Box
                sx={{
                    py: 1.5,
                    px: { xs: 2, sm: 4 },
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}
            >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                    <IconButton
                        onClick={() => navigate('/perfil')}
                        size="small"
                        sx={{
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: '6px',
                            p: '4px'
                        }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                    <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: '-0.01em' }}>
                        security / email-verified
                    </Typography>
                </Stack>

                <Box display={{ xs: 'none', sm: 'block' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <ShieldIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            Autenticación Completa
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Contenedor Central */}
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: { xs: 2, sm: 4 }
                }}
            >
                <Paper
                    elevation={0}
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: 840 },
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper',
                        overflow: 'hidden'
                    }}
                >
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' }
                        }}
                    >
                        {/* Panel Izquierdo: Resumen de estado de seguridad */}
                        <Box
                            sx={{
                                width: { xs: '100%', md: '45%' },
                                p: { xs: 2.5, sm: 4 },
                                bgcolor: (theme) => alpha(theme.palette.action.hover, 0.03),
                                borderRight: { md: '1px solid' },
                                borderBottom: { xs: '1px solid', md: 'none' },
                                borderColor: 'divider',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: '6px',
                                        border: '1px solid',
                                        borderColor: (theme) => theme.palette.mode === 'dark' ? '#238636' : '#2da44e',
                                        bgcolor: (theme) => alpha(theme.palette.success.main, 0.08),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2.5,
                                        color: (theme) => theme.palette.mode === 'dark' ? '#3fb950' : '#2da44e'
                                    }}
                                >
                                    <CheckCircleIcon sx={{ fontSize: 22 }} />
                                </Box>

                                <Typography variant="h6" fontWeight={600} letterSpacing="-0.02em" gutterBottom>
                                    ¡Correo Verificado! 🎉
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5, mb: 3 }}>
                                    Tu dirección de correo ha sido confirmada con éxito. Todos los permisos operativos y notificaciones de tu cuenta están activos.
                                </Typography>

                                {/* Tag de estado tipo GitHub */}
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '6px',
                                        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1.5
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: '50%',
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#3fb950' : '#2da44e'
                                        }}
                                    />
                                    <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
                                        status: active_and_verified
                                    </Typography>
                                </Paper>
                            </Box>

                            <Box display={{ xs: 'none', md: 'block' }} mt={4}>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', lineHeight: 1.4 }}>
                                    Esta verificación garantiza que puedas recuperar tu cuenta y recibir alertas de seguridad en tiempo real.
                                </Typography>
                            </Box>
                        </Box>

                        {/* Panel Derecho: Checkbox de beneficios y CTAs */}
                        <Box
                            sx={{
                                flex: 1,
                                p: { xs: 2.5, sm: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between'
                            }}
                        >
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color="text.secondary"
                                    sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', display: 'block', mb: 2 }}
                                >
                                    Funcionalidades Habilitadas
                                </Typography>

                                <Stack spacing={1.5} mb={4}>
                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '6px',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}
                                    >
                                        <LockIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
                                            Acceso a módulos restringidos de la plataforma
                                        </Typography>
                                    </Paper>

                                    <Paper
                                        elevation={0}
                                        sx={{
                                            p: 1.5,
                                            borderRadius: '6px',
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5
                                        }}
                                    >
                                        <ShieldIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2" fontWeight={500} fontSize="0.85rem">
                                            Notificaciones de auditoría y seguridad activas
                                        </Typography>
                                    </Paper>
                                </Stack>
                            </Box>

                            <Box>
                                <Divider sx={{ mb: 3 }} />

                                <Stack spacing={1.5}>
                                    <Button
                                        variant="contained"
                                        disableElevation
                                        fullWidth
                                        endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
                                        onClick={() => navigate('/perfil')}
                                        sx={{
                                            py: 1.2,
                                            borderRadius: '6px',
                                            fontWeight: 600,
                                            fontSize: '0.875rem',
                                            textTransform: 'none',
                                            bgcolor: (theme) => theme.palette.mode === 'dark' ? '#238636' : '#2da44e',
                                            color: '#ffffff',
                                            '&:hover': {
                                                bgcolor: (theme) => theme.palette.mode === 'dark' ? '#2ea043' : '#2c974b',
                                            }
                                        }}
                                    >
                                        Ir a mi Perfil
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size="small"
                                        fullWidth
                                        onClick={() => navigate('/app')}
                                        sx={{
                                            py: 1,
                                            borderRadius: '6px',
                                            textTransform: 'none',
                                            fontWeight: 600,
                                            fontSize: '0.85rem',
                                            borderColor: 'divider',
                                            color: 'text.primary'
                                        }}
                                    >
                                        Ir al Panel Principal
                                    </Button>
                                </Stack>
                            </Box>
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};