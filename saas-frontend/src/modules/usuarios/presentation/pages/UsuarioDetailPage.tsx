import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
    Stack,
    Grid,
    Chip,
    Breadcrumbs,
    Link,
    Avatar,
    Card,
    CardContent,
} from '@mui/material';
import { ArrowBack, Edit, Phone, Email, Lock } from '@mui/icons-material';
import { toast } from 'sonner';

import { usuarioRepository } from '../../infrastructure/repositories/usuario.repository';
import type { Usuario } from '../../domain/interfaces/usuario.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { useAuthStore } from '../../../../core/store/authStore';
import { ChangePasswordModal } from '../../../perfil/presentation/components/ChangePasswordModal';
import type { CambiarPasswordForm } from '../../../perfil/domain/interfaces/perfil.interface';
import { formatImage } from '../../../../core/utils/formatImage';


const UsuarioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = useAuthStore((state: any) => state.user);
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [loading, setLoading] = useState(true);
    const [openRestablecerPassword, setOpenRestablecerPassword] = useState(false);
    const AvatarSource = usuario?.avatar_url ? formatImage(usuario.avatar_url) : undefined;

    const canRestablecerPassword = user?.permisos?.includes('ADMIN_USUARIOS');

    const fetchUsuario = useCallback(async () => {
        if (!id) return;
        try {
            const data = await usuarioRepository.obtener(id);
            setUsuario(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el usuario');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const handleRestablecerPassword = async (data: CambiarPasswordForm) => {
        if (!id) return;
        try {
            await usuarioRepository.restablecerContrasena(id, data);
            toast.success('Contraseña restablecida exitosamente');
            setOpenRestablecerPassword(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al restablecer contraseña');
        }
    };

    useEffect(() => {
        if (id) fetchUsuario();
    }, [fetchUsuario, id]);

    if (loading) {
        return <Loading />;
    }

    if (!usuario) {
        return <ErrorPageLoading text='No se encontro al usuario' navigate={() => navigate('/usuarios')} />;
    }

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                            onClick={() => navigate('/usuarios')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Usuarios
                        </Link>
                        <Typography color="text.primary">Detalle de Usuario</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {usuario.nombre} {usuario.apellido ? usuario.apellido : ''}
                    </Typography>
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {canRestablecerPassword && (
                        <Button
                            variant="outlined"
                            startIcon={<Lock />}
                            onClick={() => setOpenRestablecerPassword(true)}
                        >
                            Restablecer Contraseña
                        </Button>
                    )}
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/usuarios/${id}/editar`)}
                    >
                        Editar
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={3} mb={4}>
                            <Avatar
                                src={AvatarSource}
                                sx={{
                                    fontSize: 50,
                                    width: 100,
                                    height: 100,
                                    border: AvatarSource ? '2px solid' : "",
                                    borderColor: 'secondary.main',
                                    background: AvatarSource ? "#ffffff" : "#876543cc",
                                }}
                            >
                                {usuario.nombre[0]}
                            </Avatar>
                            <Box>
                                <Typography variant="overline" color="primary" fontWeight={700}>Módulo de Usuarios</Typography>
                                <Typography variant="h5" fontWeight={700}>{usuario.nombre}</Typography>
                                <Chip variant="outlined" label={usuario.verificado ? 'Verificado' : 'No verificado'} color={usuario.verificado ? 'success' : 'warning'} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <Phone sx={{ fontSize: 16 }} /> TELÉFONO
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                    {usuario.telefono}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                                    <Email sx={{ fontSize: 16 }} /> EMAIL
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                    {usuario.email}
                                </Typography>
                            </Box>

                            {usuario.sucursal && (
                                <Box>
                                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>SUCURSAL</Typography>
                                    <Chip label={usuario.sucursal.nombre} />
                                </Box>
                            )}

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>ROLES ASIGNADOS</Typography>
                                {usuario.roles && usuario.roles.length > 0 ? (
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {usuario.roles.map((rol) => (
                                            <Chip key={rol.id} label={rol.nombre} color="primary" />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No se han asignado roles a este usuario.</Typography>
                                )}
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }} >
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen del Usuario</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Nombre</Typography>
                                    <Typography variant="body2" fontWeight={700}>{usuario.nombre}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Teléfono</Typography>
                                    <Typography variant="body2" fontWeight={700}>{usuario.telefono}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Roles</Typography>
                                    <Typography variant="body2" fontWeight={700}>{usuario.roles?.length ?? 0}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Verificado</Typography>
                                    <Chip variant='outlined' label={usuario.verificado ? 'Sí' : 'No'} size="small" color={usuario.verificado ? 'success' : 'error'} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            <ChangePasswordModal
                open={openRestablecerPassword}
                onClose={() => setOpenRestablecerPassword(false)}
                onSubmit={handleRestablecerPassword}
            />
        </Box>
    );
};

export default UsuarioDetailPage;
