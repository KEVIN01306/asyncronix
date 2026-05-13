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
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                            <ViewModule color="primary" />
                            <Typography variant="h6" fontWeight={700}>Módulos del negocio</Typography>
                        </Stack>

                        <Divider sx={{ mb: 2 }} />

                        {modulos.length === 0 ? (
                            <Alert severity="info">No hay módulos disponibles para este negocio.</Alert>
                        ) : (
                            <Stack spacing={1}>
                                {modulos.map((modulo) => (
                                    <Button
                                        key={modulo.id}
                                        variant={selectedModulo?.id === modulo.id ? 'contained' : 'outlined'}
                                        fullWidth
                                        onClick={() => setSelectedModulo(modulo)}
                                        sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                                    >
                                        {modulo.nombre}
                                    </Button>
                                ))}
                            </Stack>
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
                            <Box display="flex" justifyContent="center" mt={4}><CircularProgress /></Box>
                        ) : modulePermissions.length === 0 ? (
                            <Alert severity="info">No hay permisos disponibles para este módulo.</Alert>
                        ) : (
                            <List>
                                {modulePermissions.map((permiso) => (
                                    <ListItem key={permiso.id} disableGutters secondaryAction={
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
                                        />
                                    }>
                                        <ListItemText
                                            primary={permiso.codigo}
                                            secondary={permiso.descripcion || 'Sin descripción'}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        <Divider sx={{ my: 3 }} />

                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" spacing={2}>
                            <Typography color="text.secondary">
                                {assignedPermissionIds.length} permisos seleccionados para este rol.
                            </Typography>
                            {
                                user?.permisos.includes('EDITAR_PERMISOS') && (
                                    <Button
                                        variant="contained"
                                        startIcon={<Save />}
                                        onClick={handleSavePermissions}
                                        disabled={saving || !selectedModulo}
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
