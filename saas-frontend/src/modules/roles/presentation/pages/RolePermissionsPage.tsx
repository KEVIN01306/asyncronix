import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Stack,
    Typography,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemText,
    Switch,
    FormControlLabel,
    ListItemButton,
} from '@mui/material';
import { ArrowBack, Save, Security, ViewModule } from '@mui/icons-material';
import { toast } from 'sonner';

import { RolesRepository } from '../../infrastructure/repositories/rol.repository';
import type { Modulo, Permiso } from '../../domain/interfaces/rol.interface';
import { useAuthStore } from '../../../../core/store/authStore';

const RolePermissionsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [modulos, setModulos] = useState<Modulo[]>([]);
    const [selectedModulo, setSelectedModulo] = useState<Modulo | null>(null);
    const [permisos, setPermisos] = useState<Permiso[]>([]);
    const [assignedPermissionIds, setAssignedPermissionIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [permissionsLoading, setPermissionsLoading] = useState(false);

    const user = useAuthStore((state) => state.user);

    const modulePermissions = useMemo(
        () => permisos.filter((permiso) => permiso.modulo_id === selectedModulo?.id),
        [permisos, selectedModulo]
    );

    const fetchRolePermissions = useCallback(async () => {
        if (!id) return;
        try {
            const response = await RolesRepository.obtenerPermisosRol(id);
            setAssignedPermissionIds(response.map((permiso) => permiso.id));
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los permisos del rol');
        }
    }, [id]);

    const fetchModulos = useCallback(async () => {
        try {
            const response = await RolesRepository.listarModulos();
            setModulos(response.data);
            if (response.data.length > 0) {
                setSelectedModulo(response.data[0]);
            }
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los módulos');
        }
    }, []);

    const fetchPermisos = useCallback(async (moduloId?: string) => {
        if (!id || !moduloId) return;

        setPermissionsLoading(true);
        try {
            const response = await RolesRepository.listarPermisos(moduloId);
            setPermisos(response.data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los permisos');
        } finally {
            setPermissionsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        Promise.all([fetchModulos(), fetchRolePermissions()])
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, [fetchModulos, fetchRolePermissions, id]);

    useEffect(() => {
        if (selectedModulo) {
            fetchPermisos(selectedModulo.id);
        }
    }, [selectedModulo, fetchPermisos]);

    const handleTogglePermission = (permisoId: string) => {
        setAssignedPermissionIds((current) =>
            current.includes(permisoId)
                ? current.filter((idPermiso) => idPermiso !== permisoId)
                : [...current, permisoId]
        );
    };

    const handleSavePermissions = async () => {
        if (!id) return;
        setSaving(true);
        try {
            await RolesRepository.asignarPermisosRol(id, assignedPermissionIds);
            toast.success('Permisos actualizados correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo actualizar los permisos');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" mt={10}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
                <Box>
                    <Typography variant="h4" fontWeight={800} gutterBottom>
                        Permisos del Rol
                    </Typography>
                    <Typography color="text.secondary">
                        Selecciona un módulo del negocio y asigna los permisos que este rol puede usar.
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<ArrowBack />} onClick={() => navigate('/roles')}>
                    Volver a roles
                </Button>
            </Stack>

            <Grid container spacing={3}>
                {/* LADO IZQUIERDO: Menú de Módulos Mejorado */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <ViewModule color="primary" />
                            <Typography variant="h6" fontWeight={700}>Módulos del negocio</Typography>
                        </Stack>

                        <Divider sx={{ mb: 1 }} />

                        {modulos.length === 0 ? (
                            <Alert severity="info" sx={{ mt: 1 }}>No hay módulos disponibles para este negocio.</Alert>
                        ) : (
                            <List disablePadding>
                                {modulos.map((modulo) => {
                                    const isSelected = selectedModulo?.id === modulo.id;
                                    return (
                                        <ListItem key={modulo.id} disablePadding sx={{ mb: 0.5 }}>
                                            <ListItemButton
                                                selected={isSelected}
                                                onClick={() => setSelectedModulo(modulo)}
                                                sx={{
                                                    borderRadius: 1.5,
                                                    '&.Mui-selected': {
                                                        bgcolor: 'primary.main',
                                                        color: 'primary.contrastText',
                                                        '&:hover': {
                                                            bgcolor: 'primary.dark',
                                                        },
                                                    },
                                                }}
                                            >
                                                <ListItemText
                                                    primary={modulo.nombre}
                                                    primaryTypographyProps={{
                                                        fontWeight: isSelected ? 600 : 500,
                                                        variant: 'body2'
                                                    }}
                                                />
                                            </ListItemButton>
                                        </ListItem>
                                    );
                                })}
                            </List>
                        )}
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <Security color="primary" />
                            <Typography variant="h6" fontWeight={700}>Permisos del módulo</Typography>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {!selectedModulo ? (
                            <Alert severity="info">Selecciona un módulo para ver los permisos asociados.</Alert>
                        ) : permissionsLoading ? (
                            <Box display="flex" justifyContent="center" py={4}><CircularProgress /></Box>
                        ) : modulePermissions.length === 0 ? (
                            <Alert severity="info">No hay permisos disponibles para este módulo.</Alert>
                        ) : (
                            <List disablePadding>
                                {modulePermissions.map((permiso, index) => (
                                    <Box key={permiso.id}>
                                        <ListItem
                                            disableGutters
                                            sx={{ py: 2 }}
                                            secondaryAction={
                                                <FormControlLabel
                                                    control={
                                                        <Switch
                                                            disabled={!user?.permisos.includes('EDITAR_PERMISOS')}
                                                            checked={assignedPermissionIds.includes(permiso.id)}
                                                            onChange={() => handleTogglePermission(permiso.id)}
                                                            color="primary"
                                                        />
                                                    }
                                                    label={assignedPermissionIds.includes(permiso.id) ? 'Asignado' : 'No asignado'}
                                                    labelPlacement="start"
                                                    sx={{
                                                        mr: 0,
                                                        // Aquí controlamos la distribución del texto según el tamaño de pantalla
                                                        '& .MuiFormControlLabel-label': {
                                                            display: { xs: 'none', sm: 'inline-block' },
                                                            fontWeight: 500,
                                                            fontSize: '0.875rem'
                                                        }
                                                    }}
                                                />
                                            }
                                        >
                                            <ListItemText
                                                primary={permiso.codigo}
                                                secondary={permiso.descripcion || 'Sin descripción'}
                                                primaryTypographyProps={{ fontWeight: 600, color: 'text.primary', mb: 0.5 }}
                                                secondaryTypographyProps={{ variant: 'body2' }}
                                            />
                                        </ListItem>
                                        {index < modulePermissions.length - 1 && <Divider />}
                                    </Box>
                                ))}
                            </List>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography variant="body2" color="text.secondary">
                                {assignedPermissionIds.length} permisos seleccionados en total para este rol.
                            </Typography>
                            {
                                user?.permisos.includes('EDITAR_PERMISOS') && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        onClick={handleSavePermissions}
                                        disabled={saving || !selectedModulo}
                                        sx={{ minWidth: 160 }}
                                    >
                                        {saving ? 'Guardando...' : 'Guardar cambios'}
                                    </Button>
                                )
                            }
                        </Stack>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RolePermissionsPage;