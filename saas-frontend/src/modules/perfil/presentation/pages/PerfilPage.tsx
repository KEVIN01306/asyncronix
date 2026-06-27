import { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, Avatar, Button, Grid, Divider } from '@mui/material';
import { Edit as EditIcon, VpnKey as VpnKeyIcon, Person as PersonIcon } from '@mui/icons-material';
import { useAuthStore } from '../../../../core/store/authStore';
import { authRepository } from '../../../auth/infrastructure/repositories/auth.repository';
import { perfilRepository } from '../../infrastructure/perfil.repository';
import { toast } from 'sonner';
import type { ActualizarPerfilForm, CambiarPasswordForm, Perfil } from '../../domain/interfaces/perfil.interface'
import type { ActualizarPinCajaFormValues } from '../../domain/schemas/perfil.schema'
import { EditProfileModal } from '../components/EditProfileModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { ChangePinCajaModal } from '../components/ChangePinCajaModal';
import { EditAvatarModal } from '../components/EditAvatarModal';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

export const PerfilPage = () => {
    const userStore = useAuthStore((state) => state.user);
    const getMeStore = useAuthStore((state) => state.getMe);
    const [perfil, setPerfil] = useState<Perfil | null>(null);
    const [loading, setLoading] = useState(true);

    const [openEditProfile, setOpenEditProfile] = useState(false);
    const [openChangePassword, setOpenChangePassword] = useState(false);
    const [openChangePinCaja, setOpenChangePinCaja] = useState(false);
    const [openEditAvatar, setOpenEditAvatar] = useState(false);

    const AvatarSource = perfil?.avatar_url ? `${import.meta.env.VITE_API_URL}/${perfil.avatar_url}` : undefined;


    const cargarPerfil = async () => {
        try {
            setLoading(true);
            const data = await perfilRepository.obtenerPerfil();
            setPerfil(data);
            console.log("data perfil: ", perfil)

        } catch (error) {
            console.log(error)
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
                        console.log(error)

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
                        console.log(error)

            toast.error("Error al actualizar el avatar");
        }
    };

    const handleChangePassword = async (data: CambiarPasswordForm) => {
        try {
            await perfilRepository.cambiarPassword(data);
            toast.success("Contraseña cambiada con éxito");
            setOpenChangePassword(false);
        } catch (error: any) {
            console.log(error)
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
            console.log(error)
            toast.error(error.response?.data?.message || "Error al actualizar el pin de caja");
        }
    };

    if (loading) return <Loading />;
    
    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                    Mi Perfil
                </Typography>
            </Box>

            <Card elevation={3} sx={{ borderRadius: 3, mb: 4 }}>
                <CardContent>
                    <Grid container spacing={4} alignItems="center">
                        <Grid size={{ xs: 12, sm: 4 }} display="flex" flexDirection="column" alignItems="center">
                            <Avatar
                                src={AvatarSource ? AvatarSource : "/static/images/avatar/1.jpg"}
                                sx={{ width: 200, height: 200, mb: 2, border: AvatarSource ?   '2px solid' : "",  borderColor: 'secondary.main' }}
                            >
                                {perfil?.nombre?.[0]}
                            </Avatar>
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<PersonIcon />}
                                onClick={() => setOpenEditAvatar(true)}
                            >
                                Cambiar Avatar
                            </Button>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 8 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h5" fontWeight="bold">
                                    {perfil?.nombre} {perfil?.apellido}
                                </Typography>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<EditIcon />}
                                    onClick={() => setOpenEditProfile(true)}
                                >
                                    Editar Perfil
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Grid container spacing={2}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                                    <Typography variant="body1">{perfil?.email || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Teléfono</Typography>
                                    <Typography variant="body1">{perfil?.telefono || 'N/A'}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Negocio</Typography>
                                    <Typography variant="body1">{userStore?.negocio?.nombre_comercial}</Typography>
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Typography variant="subtitle2" color="text.secondary">Roles</Typography>
                                    <Typography variant="body1">{userStore?.roles?.join(', ')}</Typography>
                                </Grid>
                            </Grid>

                            <Box mt={4} display="flex" gap={2} flexWrap="wrap">
                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    startIcon={<VpnKeyIcon />}
                                    onClick={() => setOpenChangePassword(true)}
                                >
                                    Cambiar Contraseña
                                </Button>
                                {userStore?.permisos?.includes('VENTAS_FORZAR_STOCK') && (
                                    <Button
                                        variant="outlined"
                                        color="secondary"
                                        startIcon={<PersonIcon />}
                                        onClick={() => setOpenChangePinCaja(true)}
                                    >
                                        Cambiar Pin de Caja
                                    </Button>
                                )}
                            </Box>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>

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
