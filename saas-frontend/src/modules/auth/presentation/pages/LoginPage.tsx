import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Grid, Paper, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

import { loginSchema, type LoginFormValues } from '../../domain/schemas/login.schema';
import { authRepository } from '../../infrastructure/repositories/auth.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import LoginForm from '../components/LoginForm';
import { obtenerTokenFCM } from '../../../../core/notificaciones/notificaciones.config';
import { notificacionRepository } from '../../../notificaciones/infrastructure/repositories/notificacion.repository';

const LoginPage = () => {
    const setAuth = useAuthStore((state) => state.login);
    const goTo = useNavigate();
    const location = useLocation();
    const from = location.state?.from || { pathname: "/" };
    const theme = useTheme();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginFormValues) => {
        try {
            const response = await authRepository.signIn(data);
            setAuth(response.usuario, response.accessToken);

            const tokenFCM = await obtenerTokenFCM();
            if (tokenFCM) {
                try {
                    await notificacionRepository.guardarTokenFCM(tokenFCM);
                } catch {
                    // no-op
                }
            }

            goTo(from, { replace: true });

            toast.success('Login Exitoso', {
                description: 'Hola, Bienvenido',
            });
        } catch (error: any) {
            const backendMessage = error?.response?.data?.message || 'Usuario o contraseña incorrectos.';
            toast.error('Error de acceso', {
                description: backendMessage,
            });
            console.error('Error en el inicio de sesión', error);
        }
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            sx={{
                width: '100%',
                height: '100dvh',
                display: 'flex',
                overflow: 'hidden',
                borderRadius: 'inherit'
            }}
        >
            <Grid container sx={{ flexGrow: 1 }}>

                <Grid
                    size={{ xs: 12, md: 7 }}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: { md: 8, lg: 12 },
                        position: 'relative',
                        overflow: 'hidden',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        color: 'primary.contrastText',
                    }}
                >
                    <Box sx={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(255,255,255,0.05) 0%, transparent 40%)',
                        pointerEvents: 'none'
                    }} />

                    <Box sx={{
                        position: 'absolute', top: '10%', left: '10%', width: '150%', height: '150%',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none'
                    }} />
                    <Box sx={{
                        position: 'absolute', top: '5%', left: '15%', width: '150%', height: '150%',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none'
                    }} />
                    <Box sx={{
                        position: 'absolute', top: '0%', left: '20%', width: '150%', height: '150%',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none'
                    }} />
                    <Box sx={{
                        position: 'absolute', top: '-5%', left: '25%', width: '150%', height: '150%',
                        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50%', pointerEvents: 'none'
                    }} />

                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography variant="h2" sx={{ fontWeight: 800, fontSize: { md: '3.5rem', lg: '4.5rem' }, mb: 3, lineHeight: 1.1 }}>
                            Hola<br />Asyncronix!
                        </Typography>
                        <Typography variant="body1" sx={{ fontSize: '1.25rem', maxWidth: '450px', opacity: 0.9, mt: 4, lineHeight: 1.6 }}>
                            Omite tareas manuales y repetitivas. ¡Sé altamente productivo a través de la automatización y ahorra toneladas de tiempo!
                        </Typography>
                    </Box>

                    <Box sx={{ position: 'absolute', bottom: { md: 40, lg: 60 }, left: { md: 64, lg: 96 }, zIndex: 1 }}>
                        <Typography variant="body2" sx={{ opacity: 0.6, fontSize: '1rem' }}>
                            © {new Date().getFullYear()} Asyncronix. Todos los derechos reservados.
                        </Typography>
                    </Box>
                </Grid>

                <Grid
                    component={Paper}
                    elevation={0}
                    square
                    size={{ xs: 12, md: 5 }}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: { xs: 4, sm: 8, md: 8, lg: 10 },
                        bgcolor: 'background.paper',
                        border: 'none',
                        position: 'relative'
                    }}
                >
                    <Box sx={{ width: '100%', maxWidth: '400px', mx: 'auto' }}>
                        <Box sx={{ mb: 8, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                                component="img"
                                src="/icons/asyncronix_corto.png"
                                alt="Logo Asyncronix"
                                sx={{ height: 32, objectFit: 'contain' }}
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px', color: 'text.primary' }}>
                                Asyncronix
                            </Typography>
                        </Box>

                        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, color: 'text.primary' }}>
                            ¡Bienvenido de vuelta!
                        </Typography>

                        <Box sx={{ width: '100%' }}>
                            <LoginForm
                                register={register}
                                errors={errors}
                                onSubmit={handleSubmit(onSubmit)}
                                isSubmitting={isSubmitting}
                            />
                        </Box>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', textAlign: 'center', mt: 4, fontSize: '0.9rem' }}
                        >
                            ¿Olvidaste tu contraseña?{' '}
                            <Box component="span" sx={{ color: 'text.primary', fontWeight: 700, cursor: 'pointer' }}>
                                comunicate con tu administrador de sistema
                            </Box>
                        </Typography>
                    </Box>
                </Grid>

            </Grid>
        </Box>
    );
};

export default LoginPage;