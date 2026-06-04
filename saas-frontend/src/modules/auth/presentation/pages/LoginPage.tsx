import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    Box, Typography, Paper,Container,
} from '@mui/material';
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

const LoginPage = () => {
    const setAuth = useAuthStore((state) => state.login);
    const goTo = useNavigate()
    const location = useLocation()
    const from = location.state?.from || {
        pathname: "/"
    };
    
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
            sx={{
                height: '100dvh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <Container maxWidth="sm">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, md: 6 },
                            textAlign: 'center',
                            bgcolor: 'background.paper',
                            backdropFilter: 'blur(10px)',
                            border: (theme) => `1px solid ${theme.palette.divider}`,
                            boxShadow: 'none',
                        }}
                    >           
                        <Header/>
                        <LoginForm 
                            register={register}
                            errors={errors}
                            onSubmit={handleSubmit(onSubmit)}
                            isSubmitting={isSubmitting}
                        />
                        <Typography variant="body2" sx={{ mt: 3, color: 'text.secondary' }}>
                                ¿Olvidaste tu acceso? Contacta al administrador del sistema.
                        </Typography>
                    </Paper>
                </motion.div>
            </Container>
        </Box>
    );
};

export default LoginPage;