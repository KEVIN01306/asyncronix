import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Typography, Paper, Button, Divider, Stack, Grid, Chip, Breadcrumbs, Link, Avatar, Card, CardContent, Alert } from '@mui/material';
import { ArrowBack, Security, Edit } from '@mui/icons-material';
import { toast } from 'sonner';

import { RolesRepository } from '../../infrastructure/repositories/rol.repository';
import type { Rol } from '../../domain/interfaces/rol.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

const RolesDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [role, setRole] = useState<Rol | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRole = useCallback(async () => {
        if (!id) return;
        try {
            const data = await RolesRepository.obtener(id);
            setRole(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el rol');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchRole();
    }, [fetchRole, id]);

    if (loading) {
        return <Loading />;
    }

    if (!role) {
        return <ErrorPageLoading text="No se pudo cargar el rol" navigate={() => navigate(-1)} />;
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
                            onClick={() => navigate('/roles')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Roles
                        </Link>
                        <Typography color="text.primary">Detalle de Rol</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {role.nombre}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={2}>
                    <Button
                        variant="outlined"
                        startIcon={<Security />}
                        onClick={() => navigate(`/roles/${id}/permisos`)}
                    >
                        Administrar permisos
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<Edit />}
                        onClick={() => navigate(`/roles/${id}/editar`)}
                    >
                        Editar
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }} >
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={3} mb={4}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: 2 }}>
                                <Security sx={{ fontSize: 35 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" color="primary" fontWeight={700}>Módulo de Roles</Typography>
                                <Typography variant="h5" fontWeight={700}>{role.nombre}</Typography>
                                <Chip label={role.permisos?.length ? `${role.permisos.length} permisos` : 'Sin permisos'} color={role.permisos?.length ? 'success' : 'default'} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Stack spacing={3}>
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>DESCRIPCIÓN</Typography>
                                <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                    {role.descripcion || 'No hay descripción para este rol.'}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>PERMISOS</Typography>
                                {role.permisos && role.permisos.length > 0 ? (
                                    <Stack direction="row" flexWrap="wrap" gap={1}>
                                        {role.permisos.map((permiso) => (
                                            <Chip key={permiso.id} label={permiso.codigo} size="small" />
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">Aún no se han asociado permisos a este rol.</Typography>
                                )}
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }} >
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent>
                            <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen del Rol</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Nombre</Typography>
                                    <Typography variant="body2" fontWeight={700}>{role.nombre}</Typography>
                                </Box>
                                <Box display="flex" justifyContent="space-between">
                                    <Typography variant="body2">Permisos</Typography>
                                    <Typography variant="body2" fontWeight={700}>{role.permisos?.length ?? 0}</Typography>
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>

                    <Alert severity="info" variant="outlined" sx={{ borderRadius: 2, mt: 3 }}>
                        Usa el botón "Administrar permisos" para asignar permisos de negocio al rol.
                    </Alert>
                </Grid>
            </Grid>
        </Box>
    );
};

export default RolesDetailPage;
