import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Box, Typography, Paper, Button, Divider, Stack, Grid, Chip, Breadcrumbs, Link, Avatar, Card, CardContent, Alert
} from '@mui/material';
import { 
    Edit, Delete, StoreMallDirectoryOutlined, 
    ArrowBack, LocationOn, VerifiedUser
} from '@mui/icons-material';
import { toast } from 'sonner';

import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';
import type { Sucursal } from '../../domain/interfaces/sucursal.interface';

const SucursalDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [sucursal, setSucursal] = useState<Sucursal | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchSucursal = useCallback(async () => {
        try {
            const data = await sucursalRepository.obtener(String(id));
            setSucursal(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchSucursal();
    }, [id, fetchSucursal]);

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            toast.success('Sucursal eliminada correctamente');
            navigate('/sucursales');
        } catch (error) {
            console.error(error);
            toast.error('Error al intentar eliminar la sucursal');
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }
    };

    if (loading) return <Loading />;
    if (!sucursal) return <ErrorPageLoading text="Sucursal no encontrada" navigate={() => navigate('/sucursales')} />;
    
    return (
        <Box p={{ xs: 2, md: 4 }}>
            {/* Header: Breadcrumbs y Acciones */}
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link 
                            underline="hover" 
                            color="inherit" 
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} 
                            onClick={() => navigate('/sucursales')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Sucursales
                        </Link>
                        <Typography color="text.primary">Vista Detallada</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {sucursal.nombre}
                    </Typography>
                </Box>

                <Stack direction="row" spacing={1} width={{ xs: '100%', sm: 'auto' }}>
                    <Button 
                        variant="outlined" 
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        startIcon={<Edit />} 
                        onClick={() => navigate(`/sucursales/${id}/editar`)}
                    >
                        Editar
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                        startIcon={<Delete />} 
                        onClick={() => setOpenDelete(true)}
                    >
                        Eliminar
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                {/* Panel Izquierdo: Información Principal */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                        <Box display="flex" alignItems="center" gap={3} mb={4}>
                            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, borderRadius: 2 }}>
                                <StoreMallDirectoryOutlined sx={{ fontSize: 35 }} />
                            </Avatar>
                            <Box>
                                <Typography variant="overline" color="primary" fontWeight={700}>Punto de Venta / Servicio</Typography>
                                <Typography variant="h5" fontWeight={700}>{sucursal.nombre}</Typography>
                                <Stack direction="row" spacing={1} mt={0.5}>
                                    <Chip 
                                        label={sucursal.es_principal ? "Sede Principal" : "Sucursal"} 
                                        color={sucursal.es_principal ? "primary" : "default"} 
                                        size="small" 
                                        sx={{ fontWeight: 600 }}
                                    />
                                    <Chip label="Activa" color="success" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                </Stack>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: 1 }}>
                                        <LocationOn sx={{ fontSize: 16 }} /> DIRECCIÓN FÍSICA
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                        {sucursal.direccion}
                                    </Typography>
                                    {sucursal.division_nivel_2 && (
                                        <Typography variant="body2" color="text.secondary">
                                            {sucursal.division_nivel_2.nombre}, {sucursal.division_nivel_2.division_nivel_1.nombre} 
                                            {sucursal.codigo_postal ? ` (${sucursal.codigo_postal})` : ''}
                                        </Typography>
                                    )}
                                </Stack>
                            </Grid>
                            
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, letterSpacing: 1 }}>
                                        <StoreMallDirectoryOutlined sx={{ fontSize: 16 }} /> DATOS FISCALES / FEL
                                    </Typography>
                                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 500 }}>
                                        Establecimiento {sucursal.codigo_establecimiento || 'N/A'}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>

                {/* Panel Derecho: Info de Control */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3}>
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent>
                                <Typography variant="subtitle2" gutterBottom fontWeight={700}>Control Operativo</Typography>
                                <Divider sx={{ mb: 2 }} />
                                <Stack spacing={2}>
                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VerifiedUser fontSize="small" color="success" />
                                            <Typography variant="body2">Estatus</Typography>
                                        </Stack>
                                        <Typography variant="body2" fontWeight={700}>Operativo</Typography>
                                    </Box>
                                    {sucursal.es_principal && (
                                        <Alert icon={false} severity="info" sx={{ py: 0, '& .MuiAlert-message': { fontSize: '0.75rem' } }}>
                                            Esta sucursal centraliza la facturación global.
                                        </Alert>
                                    )}
                                </Stack>
                            </CardContent>
                        </Card>

                        <Alert severity="warning" variant="outlined" sx={{ borderRadius: 2 }}>
                            La eliminación de una sucursal es permanente y podría desvincular inventarios activos.
                        </Alert>
                    </Stack>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openDelete}
                title="¿Confirmar eliminación?"
                description={
                    <Typography variant="body2">
                        Estás a punto de eliminar la sucursal <strong>{sucursal.nombre}</strong>. 
                        Esta acción no se puede deshacer y afectará la visualización de los reportes locales.
                    </Typography>
                }
                onClose={() => !isDeleting && setOpenDelete(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default SucursalDetailPage;