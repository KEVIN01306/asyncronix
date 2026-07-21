import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    TextField,
    CircularProgress,
    IconButton,
    Stack,
    Paper,
    Divider,
    Alert
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    ArrowBack as ArrowBackIcon,
    MarkEmailReadOutlined as MarkEmailIcon,
    AccessTime as AccessTimeIcon,
    Refresh as RefreshIcon,
    ShieldOutlined as ShieldIcon
} from '@mui/icons-material';
import { toast } from 'sonner';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useAuthStore } from '../../../../core/store/authStore';
import { authRepository } from '../../../auth/infrastructure/repositories/auth.repository';
import { perfilRepository } from '../../infrastructure/perfil.repository';
import { verificarCorreoSchema, type VerificarCorreoFormValues } from '../../domain/schemas/perfil.schema';

export const VerificarCorreoPage = () => {
    const navigate = useNavigate();
    const userStore = useAuthStore((state) => state.user);
    const getMeStore = useAuthStore((state) => state.getMe);

    const [sending, setSending] = useState(false);
    const [isChecking, setIsChecking] = useState(true);
    const [timeLeft, setTimeLeft] = useState(15 * 60);

    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting, isValid }
    } = useForm<VerificarCorreoFormValues>({
        resolver: zodResolver(verificarCorreoSchema),
        defaultValues: { code: '' },
        mode: 'onChange'
    });

    const handleSendCode = useCallback(async (silent = false) => {
        try {
            setSending(true);
            await perfilRepository.sendVerificationCode();
            setTimeLeft(15 * 60);
            if (!silent) toast.success('Código reenviado con éxito');
        } catch (error: any) {
            console.log(error);
            if (!silent) toast.error(error.response?.data?.error || 'Error al enviar el código');
        } finally {
            setSending(false);
        }
    }, []);

    const hasRequestedCode = useRef(false);
    const hasFetchedMe = useRef(false);

    useEffect(() => {
        const fetchMeAndCheck = async () => {
            try {
                if (!hasFetchedMe.current) {
                    hasFetchedMe.current = true;
                    const latestUser = await authRepository.getMe();
                    getMeStore(latestUser);

                    if (latestUser?.verificado) {
                        navigate('/perfil', { replace: true });
                        return; // Redirigiendo, no quitamos el loader
                    }

                    if (!hasRequestedCode.current) {
                        hasRequestedCode.current = true;
                        await handleSendCode(true);
                    }
                    setIsChecking(false);
                }
            } catch (error) {
                console.error("Error fetching me on verify page", error);
                setIsChecking(false);
            }
        };
        fetchMeAndCheck();
    }, [handleSendCode, navigate, getMeStore]);

    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const onSubmit = async (data: VerificarCorreoFormValues) => {
        try {
            await perfilRepository.verifyVerificationCode(data.code);

            const globalUser = await authRepository.getMe();
            getMeStore(globalUser);

            navigate('/perfil/correo-verificado', { replace: true });
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.error || 'Error al verificar el código');
        }
    };

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
                    <Typography variant="body2" fontWeight={600}>
                        security / email-verification
                    </Typography>
                </Stack>

                <Box display={{ xs: 'none', sm: 'block' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <ShieldIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                            Autenticación de 2 Factores
                        </Typography>
                    </Stack>
                </Box>
            </Box>

            {/* Contenedor central a pantalla completa */}
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
                        {/* Panel Informativo (Se oculta o simplifica en móvil para evitar scroll innecesario) */}
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
                                        borderColor: 'divider',
                                        bgcolor: 'background.paper',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        mb: 2.5
                                    }}
                                >
                                    <MarkEmailIcon sx={{ fontSize: 22, color: 'text.primary' }} />
                                </Box>

                                <Typography variant="h6" fontWeight={600} letterSpacing="-0.02em" gutterBottom>
                                    Verifica tu dirección
                                </Typography>

                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', lineHeight: 1.5, mb: 2 }}>
                                    Hemos enviado un código de confirmación temporal a:
                                </Typography>

                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 1.5,
                                        borderRadius: '6px',
                                        bgcolor: (theme) => alpha(theme.palette.text.primary, 0.04),
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        fontFamily: 'monospace',
                                        fontSize: '0.825rem',
                                        wordBreak: 'break-all',
                                        fontWeight: 600
                                    }}
                                >
                                    {userStore?.email || 'usuario@dominio.com'}
                                </Paper>
                            </Box>

                            {/* Solo visible en pantallas medianas/grandes para no saturar el móvil */}
                            <Box display={{ xs: 'none', md: 'block' }} mt={4}>
                                <Divider sx={{ mb: 2 }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem', display: 'block', lineHeight: 1.4 }}>
                                    Si no recibes el correo en unos minutos, revisa tu carpeta de correo no deseado (Spam).
                                </Typography>
                            </Box>
                        </Box>

                        {/* Formulario de Acción Principal */}
                        <Box
                            sx={{
                                flex: 1,
                                p: { xs: 2.5, sm: 4 },
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                        >
                            <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                                <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color="text.secondary"
                                    sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.7rem', display: 'block', mb: 1 }}
                                >
                                    Código de verificación
                                </Typography>

                                <Controller
                                    name="code"
                                    control={control}
                                    render={({ field }) => (
                                        <TextField
                                            {...field}
                                            fullWidth
                                            autoFocus
                                            placeholder="000000"
                                            variant="outlined"
                                            error={!!errors.code}
                                            helperText={errors.code?.message}
                                            disabled={isSubmitting}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                                                field.onChange(val);
                                            }}
                                            sx={{
                                                mb: 2.5,
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: '6px',
                                                    fontFamily: 'monospace',
                                                    bgcolor: 'background.paper',
                                                    '& fieldset': {
                                                        borderColor: 'divider',
                                                    },
                                                    '&:hover fieldset': {
                                                        borderColor: 'text.secondary',
                                                    },
                                                    '&.Mui-focused fieldset': {
                                                        borderWidth: '1px',
                                                    }
                                                },
                                                '& input': {
                                                    textAlign: 'center',
                                                    fontSize: { xs: '1.5rem', sm: '1.8rem' },
                                                    fontWeight: 700,
                                                    letterSpacing: { xs: 6, sm: 10 },
                                                    py: 1.5
                                                }
                                            }}
                                        />
                                    )}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    disableElevation
                                    fullWidth
                                    disabled={!isValid || isSubmitting}
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
                                        },
                                        '&.Mui-disabled': {
                                            bgcolor: (theme) => alpha(theme.palette.text.primary, 0.1),
                                            color: 'text.disabled'
                                        }
                                    }}
                                >
                                    {isSubmitting ? <CircularProgress size={20} color="inherit" /> : 'Verificar código'}
                                </Button>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            {/* Acciones secundarias y expiración (Optimizado para móvil) */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                justifyContent="space-between"
                                spacing={1.5}
                            >
                                <Stack direction="row" alignItems="center" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                    <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" fontFamily="monospace" sx={{ fontSize: '0.8rem' }}>
                                        Expira en: <strong>{formatTime(timeLeft)}</strong>
                                    </Typography>
                                </Stack>

                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<RefreshIcon sx={{ fontSize: 14 }} />}
                                    disabled={timeLeft > 0 || sending}
                                    onClick={() => handleSendCode(false)}
                                    sx={{
                                        borderRadius: '6px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.775rem',
                                        borderColor: 'divider',
                                        color: 'text.primary',
                                        py: 0.8
                                    }}
                                >
                                    {sending ? 'Enviando...' : 'Reenviar código'}
                                </Button>
                            </Stack>

                            {timeLeft === 0 && (
                                <Alert
                                    severity="warning"
                                    variant="outlined"
                                    sx={{ mt: 2, borderRadius: '6px', fontSize: '0.8rem', py: 0 }}
                                >
                                    El código ha expirado. Genera uno nuevo.
                                </Alert>
                            )}
                        </Box>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
};