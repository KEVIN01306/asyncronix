import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Button,
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
    CircularProgress,
    TextField,
    InputAdornment,
} from '@mui/material';
import { ArrowBack, Save, Security, ViewModule, Search } from '@mui/icons-material';
import { toast } from 'sonner';

import { RolesRepository } from '../../infrastructure/repositories/rol.repository';
import type { Modulo, Permiso } from '../../domain/interfaces/rol.interface';
import { useAuthStore } from '../../../../core/store/authStore';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

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

    const [moduleSearchText, setModuleSearchText] = useState('');
    const [permissionSearchText, setPermissionSearchText] = useState('');

    const user = useAuthStore((state) => state.user);

    const filteredModulos = useMemo(() => {
        if (!moduleSearchText.trim()) return modulos;
        const search = moduleSearchText.toLowerCase();
        return modulos.filter((modulo) => modulo.nombre.toLowerCase().includes(search));
    }, [modulos, moduleSearchText]);

    const modulePermissions = useMemo(() => {
        if (permissionSearchText.trim()) {
            const search = permissionSearchText.toLowerCase();
            return permisos.filter((permiso) =>
                permiso.codigo.toLowerCase().includes(search) ||
                (permiso.descripcion && permiso.descripcion.toLowerCase().includes(search))
            );
        }
        return permisos.filter((permiso) => permiso.modulo_id === selectedModulo?.id);
    }, [permisos, selectedModulo, permissionSearchText]);

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

    const fetchPermisos = useCallback(async () => {
        setPermissionsLoading(true);
        try {
            const response = await RolesRepository.listarPermisos();
            setPermisos(response.data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los permisos');
        } finally {
            setPermissionsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!id) return;

        setLoading(true);
        Promise.all([fetchModulos(), fetchRolePermissions(), fetchPermisos()])
            .catch((error) => console.error(error))
            .finally(() => setLoading(false));
    }, [fetchModulos, fetchRolePermissions, fetchPermisos, id]);

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
        return <Loading />;
    }

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 2, px: { xs: 2, md: 4 }, pb: 4 }}>
            {/* Barra de Control y Título Combinado (ActionBar persistente superior) */}
            <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', md: 'center' }}
                spacing={2}
                mb={3}
            >
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', letterSpacing: 1, fontWeight: 600 }}>
                        Seguridad y Accesos
                    </Typography>
                    <Typography variant="h2" color="text.primary">
                        Matriz de Permisos
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1.5} justifyContent={{ xs: 'space-between', md: 'flex-end' }}>
                    <Button
                        startIcon={<ArrowBack />}
                        onClick={() => navigate('/roles')}
                        variant="outlined"
                        color="secondary"
                        size="small"
                        sx={{ borderRadius: 999, textTransform: 'none' }}
                    >
                        Volver
                    </Button>
                    {user?.permisos.includes('EDITAR_PERMISOS') && (
                        <Button
                            variant="contained"
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <Save />}
                            onClick={handleSavePermissions}
                            disabled={saving || !selectedModulo}
                            size="small"
                            sx={{ borderRadius: 999, px: 3, textTransform: 'none' }}
                        >
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </Button>
                    )}
                </Stack>
            </Stack>

            {/* Layout de Consola (Doble Columna con Scroll Interno) */}
            <Grid container spacing={3}>

                {/* COLUMNA IZQUIERDA: Módulos (Fija con scroll independiente) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: { xs: '300px', md: 'calc(100vh - 240px)' },
                            minHeight: '400px',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Cabecera Estática */}
                        <Box sx={{ p: 2.5, pb: 1, bgcolor: 'background.paper' }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <ViewModule color="primary" fontSize="small" />
                                <Typography variant="h3" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                    Módulos del Sistema
                                </Typography>
                            </Stack>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar módulo..."
                                value={moduleSearchText}
                                onChange={(e) => setModuleSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Box>
                        <Divider />

                        {/* Contenedor con Scroll */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1.5, bgcolor: 'paper.main' }}>
                            {filteredModulos.length === 0 ? (
                                <Alert severity="info">No hay módulos disponibles.</Alert>
                            ) : (
                                <List disablePadding>
                                    {filteredModulos.map((modulo) => {
                                        const isSelected = selectedModulo?.id === modulo.id && !permissionSearchText.trim();
                                        return (
                                            <ListItem key={modulo.id} disablePadding sx={{ mb: 0.5 }}>
                                                <ListItemButton
                                                    selected={isSelected}
                                                    onClick={() => {
                                                        setSelectedModulo(modulo);
                                                        setPermissionSearchText('');
                                                    }}
                                                    sx={{
                                                        borderRadius: 2,
                                                        py: 1.25,
                                                        transition: 'all 0.2s',
                                                        '&.Mui-selected': {
                                                            bgcolor: 'primary.main',
                                                            color: 'primary.contrastText',
                                                            '&:hover': {
                                                                bgcolor: 'primary.main',
                                                            },
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={modulo.nombre}
                                                        primaryTypographyProps={{
                                                            fontWeight: isSelected ? 600 : 500,
                                                            variant: 'body2',
                                                        }}
                                                    />
                                                </ListItemButton>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Grid>

                {/* COLUMNA DERECHA: Permisos del Módulo Seleccionado */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper
                        variant="outlined"
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: { xs: '500px', md: 'calc(100vh - 240px)' },
                            minHeight: '400px',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Cabecera Estática */}
                        <Box sx={{ p: 2.5, pb: 2 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                    <Security color="primary" fontSize="small" />
                                    <Typography variant="h3" sx={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                        {permissionSearchText.trim() ? 'Resultados de Búsqueda' : `Permisos asignados: ${selectedModulo?.nombre || ''}`}
                                    </Typography>
                                </Stack>
                                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                                    Total seleccionados en la sesión: {assignedPermissionIds.length}
                                </Typography>
                            </Box>

                            <TextField
                                fullWidth
                                size="small"
                                placeholder="Buscar permiso globalmente (ej. facturación)..."
                                value={permissionSearchText}
                                onChange={(e) => setPermissionSearchText(e.target.value)}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 2 }
                                }}
                            />
                        </Box>
                        <Divider />

                        {/* Contenedor con Scroll */}
                        <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 3, py: 1 }}>
                            {!selectedModulo && !permissionSearchText.trim() ? (
                                <Box sx={{ p: 2 }}><Alert severity="info">Selecciona un módulo o utiliza la barra de búsqueda.</Alert></Box>
                            ) : permissionsLoading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%" minHeight="200px">
                                    <CircularProgress size={32} />
                                </Box>
                            ) : modulePermissions.length === 0 ? (
                                <Box sx={{ mt: 2 }}><Alert severity="info">{permissionSearchText.trim() ? 'No se encontraron permisos para esta búsqueda.' : 'No hay permisos asignados a este módulo.'}</Alert></Box>
                            ) : (
                                <List disablePadding>
                                    {modulePermissions.map((permiso, index) => {
                                        const isAssigned = assignedPermissionIds.includes(permiso.id);
                                        const moduleName = modulos.find(m => m.id === permiso.modulo_id)?.nombre || 'Módulo Desconocido';

                                        return (
                                            <Box key={permiso.id}>
                                                <ListItem
                                                    disableGutters
                                                    sx={{
                                                        py: 2,
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            <Box>
                                                                {permissionSearchText.trim() && (
                                                                    <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block', mb: 0.5 }}>
                                                                        {moduleName} &gt; {permiso.codigo}
                                                                    </Typography>
                                                                )}
                                                                {!permissionSearchText.trim() && permiso.codigo}
                                                            </Box>
                                                        }
                                                        secondary={permiso.descripcion || 'Sin descripción descriptiva asignada'}
                                                        primaryTypographyProps={{ fontWeight: 600, color: 'text.primary', variant: 'body2', mb: 0.25 }}
                                                        secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                                                    />
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                disabled={!user?.permisos.includes('EDITAR_PERMISOS')}
                                                                checked={isAssigned}
                                                                onChange={() => handleTogglePermission(permiso.id)}
                                                                color="primary"
                                                                size="small"
                                                            />
                                                        }
                                                        label={isAssigned ? 'Permitido' : 'Restringido'}
                                                        labelPlacement="start"
                                                        sx={{
                                                            mr: 0,
                                                            '& .MuiFormControlLabel-label': {
                                                                fontWeight: 600,
                                                                fontSize: '0.75rem',
                                                                color: isAssigned ? 'primary.main' : 'text.secondary',
                                                                mr: 1,
                                                                display: { xs: 'none', sm: 'inline-block' }
                                                            }
                                                        }}
                                                    />
                                                </ListItem>
                                                {index < modulePermissions.length - 1 && <Divider />}
                                            </Box>
                                        );
                                    })}
                                </List>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RolePermissionsPage;