import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Grid, Divider, Paper } from '@mui/material';
import { motion } from 'framer-motion';

import { loginSchema, type LoginFormValues } from '../../domain/schemas/login.schema';
import { authRepository } from '../../infrastructure/repositories/auth.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import Header from '../components/Header';
import LoginForm from '../components/LoginForm';
import { obtenerTokenFCM } from '../../../../core/notificaciones/notificaciones.config';
import { notificacionRepository } from '../../../notificaciones/infrastructure/repositories/notificacion.repository';

const ILLUSTRATION_URL = '/icons/asyncronix_imagen_login.png';

const LoginPage = () => {
    const setAuth = useAuthStore((state) => state.login);
    const goTo = useNavigate();
    const location = useLocation();
    const from = location.state?.from || { pathname: "/" };

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
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                borderRadius: 'inherit'
            }}
        >
            <Grid container
                component={Paper}
            >

                <Grid
                    component={Paper}
                    size={{ xs: 12, md: 4 }}
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        p: { xs: 4, sm: 6, md: 5, lg: 6 },
                        bgcolor: 'background.paper',
                        border: 'none'
                    }}
                >
                    <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                        <Header />
                    </Box>

                    <Box sx={{ width: '100%' }}>
                        <LoginForm
                            register={register}
                            errors={errors}
                            onSubmit={handleSubmit(onSubmit)}
                            isSubmitting={isSubmitting}
                        />
                    </Box>

                    <Divider sx={{ my: 3 }} />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', textAlign: 'center', lineHeight: 1.5 }}
                    >
                        ¿Olvidaste tu acceso?{' '}
                        <Box component="span" sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                            Contacta al administrador.
                        </Box>
                    </Typography>
                </Grid>
                <Grid
                    size={{ xs: 0, md: 8 }}
                    sx={{
                        display: { xs: 'none', md: 'flex' },
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        p: 0,
                        overflow: 'hidden',
                        border: 'none'
                    }}
                >
                    <Box
                        component={motion.img}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        src={ILLUSTRATION_URL}
                        alt="Workspace Illustration"
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            mixBlendMode: (theme) => theme.palette.mode === 'dark' ? 'normal' : 'multiply', // Elimina fondos blancos si la ilustración los tiene
                            filter: (theme) => theme.palette.mode === 'dark' ? 'brightness(0.9) contrast(1.1)' : 'none'
                        }}
                    />
                </Grid>

            </Grid>
        </Box>
    );
};

export default LoginPage;