import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Avatar, Button, Grid, Divider, List, ListItem, ListItemText, IconButton } from '@mui/material';
import {
    Edit as EditIcon,
    VpnKey as VpnKeyIcon,
    Person as PersonIcon,
    Business as BusinessIcon,
    Badge as BadgeIcon,
    ChevronRight as ChevronRightIcon,
    CameraAlt as CameraAltIcon
} from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { authRepository } from '../../../auth/infrastructure/repositories/auth.repository';
import { perfilRepository } from '../../infrastructure/perfil.repository';
import { toast } from 'sonner';
import type { ActualizarPerfilForm, CambiarPasswordForm, Perfil } from '../../domain/interfaces/perfil.interface';
import type { ActualizarPinCajaFormValues, ActualizarPinModeloFormValues, ActualizarPinSucursalFormValues } from '../../domain/schemas/perfil.schema';
import { EditProfileModal } from '../components/EditProfileModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ChangePinCajaModal } from '../components/ChangePinCajaModal';
import { ChangePinModeloModal } from '../components/ChangePinModeloModal';
import { ChangePinSucursalModal } from '../components/ChangePinSucursalModal.tsx';
import { EditAvatarModal } from '../components/EditAvatarModal';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatImage } from '../../../../core/utils/formatImage';
import { VerifiedUser as VerifiedUserIcon, ErrorOutline as ErrorOutlineIcon } from '@mui/icons-material';


export const PerfilPage = () => {
    const navigate = useNavigate();
    const userStore = useAuthStore((state) => state.user);
    const getMeStore = useAuthStore((state) => state.getMe);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);

    const [openEditProfile, setOpenEditProfile] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openChangePinCaja, setOpenChangePinCaja] = useState(false);
    const [openChangePinModelo, setOpenChangePinModelo] = useState(false);
    const [openChangePinSucursal, setOpenChangePinSucursal] = useState(false);
    const [openEditAvatar, setOpenEditAvatar] = useState(false);

    const AvatarSource = perfil?.avatar_url ? formatImage(perfil.avatar_url) : undefined;

    const cargarPerfil = async () => {
        try {
            setLoading(true);
            const data = await perfilRepository.obtenerPerfil();
            setPerfil(data);
        } catch (error) {
            console.log(error);
            toast.error("Error al cargar el perfil");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarPerfil();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleUpdateProfile = async (data: ActualizarPerfilForm) => {
        try {
            const payload = {
                ...data,
                email: data.email === '' ? null : data.email,
                apellido: data.apellido === '' ? null : data.apellido
            };
            await perfilRepository.actualizarPerfil(payload);
            toast.success("Perfil actualizado con éxito");
            setOpenEditProfile(false);
            cargarPerfil();
            const globalUser = await authRepository.getMe();
            getMeStore(globalUser);
        } catch (error) {
            console.log(error);
            toast.error("Error al actualizar el perfil");
        }
    };

    const handleUpdateAvatar = async (file: File) => {
        try {
            await perfilRepository.actualizarAvatar(file);
            toast.success("Avatar actualizado con éxito");
            setOpenEditAvatar(false);
            cargarPerfil();
            const globalUser = await authRepository.getMe();
            getMeStore(globalUser);
        } catch (error) {
            console.log(error);
            toast.error("Error al actualizar el avatar");
        }
    };

    const handleChangePassword = async (data: CambiarPasswordForm) => {
        try {
            await perfilRepository.cambiarPassword(data);
            toast.success("Contraseña cambiada con éxito");
            setOpenChangePassword(false);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error al cambiar contraseña");
        }
    };

    const handleChangePinCaja = async (data: ActualizarPinCajaFormValues) => {
        try {
            await perfilRepository.actualizarPinCaja(data);
            toast.success("Pin de caja actualizado con éxito");
            setOpenChangePinCaja(false);
            cargarPerfil();
            const globalUser = await authRepository.getMe();
            getMeStore(globalUser);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error al actualizar el pin de caja");
        }
    };

    const handleChangePinModelo = async (data: ActualizarPinModeloFormValues) => {
        try {
            await perfilRepository.actualizarPinModelo(data);
            toast.success("Pin de modelo actualizado con éxito");
            setOpenChangePinModelo(false);
            cargarPerfil();
            const globalUser = await authRepository.getMe();
            getMeStore(globalUser);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error al actualizar el pin de modelo");
        }
    };

    const handleChangePinSucursal = async (data: ActualizarPinSucursalFormValues) => {
        try {
            await perfilRepository.actualizarPinSucursal(data);
            toast.success("Pin de sucursal actualizado con éxito");
            setOpenChangePinSucursal(false);
            cargarPerfil();
            const globalUser = await authRepository.getMe();
            getMeStore(globalUser);
        } catch (error: any) {
            console.log(error);
            toast.error(error.response?.data?.message || "Error al actualizar el pin de sucursal");
        }
    };

    if (loading) return <Loading />;

    return (
        <Box sx={{ maxWidth: 1024, mx: 'auto', mt: 4, px: 2, pb: 6 }}>
            {/* Cabecera estilo Apple Account */}
            <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={5}>
                <Box position="relative" mb={2}>
                    <Avatar
                        src={AvatarSource ? AvatarSource : "/static/images/avatar/1.jpg"}
                        sx={{
                            width: 110,
                            height: 110,
                            fontSize: '2.5rem',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                    >
                        {perfil?.nombre?.[0]}
                    </Avatar>
                    <IconButton
                        onClick={() => setOpenEditAvatar(true)}
                        sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            backgroundColor: 'background.paper',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            border: '1px solid',
                            borderColor: 'divider',
                            '&:hover': { backgroundColor: 'action.hover' }
                        }}
                        size="small"
                    >
                        <CameraAltIcon fontSize="small" color="primary" />
                    </IconButton>
                </Box>
                <Typography variant="h2" color="text.primary">
                    {perfil?.nombre} {perfil?.apellido}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Gestiona la información de tu cuenta y los accesos de seguridad.
                </Typography>
            </Box>

            {/* Layout de distribución tipo Google Workspace Grid */}
            <Grid container spacing={3}>

                {/* Bloque 1: Información Personal */}
                <Grid size={{ xs: 12, md: 6 }} sx={{ height: '100%' }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" fontSize="small" /> Información del Perfil
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<EditIcon />}
                                    onClick={() => setOpenEditProfile(true)}
                                    sx={{ borderRadius: 999 }}
                                >
                                    Editar
                                </Button>
                            </Box>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Datos básicos de contacto registrados en la plataforma.
                            </Typography>
                            <Divider />
                            <List disablePadding>
                                <ListItem disableGutters secondaryAction={
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography variant="body2" color="text.primary">{perfil?.email || 'N/A'}</Typography>
                                        {perfil?.email && (
                                            perfil?.verificado ? (
                                                <Box display="flex" alignItems="center" gap={0.5} sx={{ color: 'success.main', ml: 1 }}>
                                                    <VerifiedUserIcon fontSize="small" />
                                                    <Typography variant="caption" fontWeight={600}>Verificado</Typography>
                                                </Box>
                                            ) : (
                                                <Button
                                                    variant="text"
                                                    size="small"
                                                    color="warning"
                                                    startIcon={<ErrorOutlineIcon />}
                                                    onClick={() => navigate('/perfil/verificar-correo')}
                                                    sx={{ ml: 1, textTransform: 'none', borderRadius: 2 }}
                                                >
                                                    Verificar
                                                </Button>
                                            )
                                        )}
                                    </Box>
                                }>
                                    <ListItemText primary="Correo electrónico" slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }} />
                                </ListItem>
                                <Divider />
                                <ListItem disableGutters secondaryAction={<Typography variant="body2" color="text.primary">{perfil?.telefono || 'N/A'}</Typography>}>
                                    <ListItemText primary="Teléfono" slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }} />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bloque 2: Organización y Roles */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.2rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <BusinessIcon color="primary" fontSize="small" /> Entorno de Trabajo
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={2}>
                                Información correspondiente a tu negocio asignado y privilegios.
                            </Typography>
                            <Divider />
                            <List disablePadding>
                                <ListItem disableGutters secondaryAction={<Typography variant="body2" color="text.primary" fontWeight="600">{userStore?.negocio?.nombre_comercial || 'N/A'}</Typography>}>
                                    <ListItemText primary="Negocio" slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }} />
                                </ListItem>
                                <Divider />
                                <ListItem disableGutters secondaryAction={
                                    <Box display="flex" gap={0.5} flexWrap="wrap" justifyContent="flex-end">
                                        {userStore?.roles?.map((rol, idx) => (
                                            <Typography key={idx} variant="caption" sx={{ bg: 'action.selected', px: 1, py: 0.5, borderRadius: 1, border: '1px solid', borderColor: 'divider', fontWeight: 500 }}>
                                                {rol}
                                            </Typography>
                                        ))}
                                    </Box>
                                }>
                                    <ListItemText primary="Roles" slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }} />
                                </ListItem>
                            </List>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Bloque 3: Seguridad de Cuenta (Distribución de menú Apple System Settings) */}
                <Grid size={{ xs: 12 }}>
                    <Card>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h3" color="text.primary" sx={{ fontSize: '1.2rem', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                                <VpnKeyIcon color="primary" fontSize="small" /> Seguridad y Credenciales
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={3}>
                                Mantén actualizadas tus llaves de acceso, firmas y códigos PIN autorizados de manera segura.
                            </Typography>

                            <List disablePadding sx={{ '& > component': { borderRadius: 2 } }}>
                                <ListItem
                                    onClick={() => setOpenChangePassword(true)}
                                    sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                >
                                    <Box display="flex" alignItems="center" gap={2}>
                                        <VpnKeyIcon color="secondary" />
                                        <ListItemText primary="Contraseña de la cuenta" secondary="Cambia periódicamente tu clave para asegurar el acceso" />
                                    </Box>
                                    <ChevronRightIcon color="disabled" />
                                </ListItem>

                                {userStore?.permisos?.includes('VENTAS_FORZAR_STOCK') && (
                                    <ListItem
                                        onClick={() => setOpenChangePinCaja(true)}
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <BadgeIcon color="secondary" />
                                            <ListItemText primary="PIN de Caja" secondary="Código de seguridad requerido para autorizar ventas sin stock" />
                                        </Box>
                                        <ChevronRightIcon color="disabled" />
                                    </ListItem>
                                )}

                                {userStore?.permisos?.includes('ADMIN_SUCURSAL') && (
                                    <ListItem
                                        onClick={() => setOpenChangePinSucursal(true)}
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 1.5, justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <BadgeIcon color="secondary" />
                                            <ListItemText primary="PIN de Sucursal" secondary="Código de autorización para gestiones administrativas de sucursal" />
                                        </Box>
                                        <ChevronRightIcon color="disabled" />
                                    </ListItem>
                                )}

                                {userStore?.permisos?.includes('ADMIN_MODELO') && (
                                    <ListItem
                                        onClick={() => setOpenChangePinModelo(true)}
                                        sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, justifyContent: 'space-between', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                                    >
                                        <Box display="flex" alignItems="center" gap={2}>
                                            <BadgeIcon color="secondary" />
                                            <ListItemText primary="PIN de Modelo" secondary="Código de autorización global para parámetros de modelo" />
                                        </Box>
                                        <ChevronRightIcon color="disabled" />
                                    </ListItem>
                                )}
                            </List>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Modales Clientes */}
            <EditProfileModal
                open={openEditProfile}
                onClose={() => setOpenEditProfile(false)}
                onSubmit={handleUpdateProfile}
                initialData={perfil ? { nombre: perfil.nombre, apellido: perfil.apellido, email: perfil.email, telefono: perfil.telefono } : null}
            />

            <ChangePinCajaModal
                open={openChangePinCaja}
                onClose={() => setOpenChangePinCaja(false)}
                onSubmit={handleChangePinCaja}
            />

            <ChangePinSucursalModal
                open={openChangePinSucursal}
                onClose={() => setOpenChangePinSucursal(false)}
                onSubmit={handleChangePinSucursal}
            />

            <ChangePinModeloModal
                open={openChangePinModelo}
                onClose={() => setOpenChangePinModelo(false)}
                onSubmit={handleChangePinModelo}
            />

            <EditAvatarModal
                open={openEditAvatar}
                onClose={() => setOpenEditAvatar(false)}
                onSubmit={handleUpdateAvatar}
                initialUrl={perfil?.avatar_url || ''}
            />

            <ChangePasswordModal
                open={openChangePassword}
                onClose={() => setOpenChangePassword(false)}
                onSubmit={handleChangePassword}
            />
        </Box>
    );
};

export default PerfilPage;