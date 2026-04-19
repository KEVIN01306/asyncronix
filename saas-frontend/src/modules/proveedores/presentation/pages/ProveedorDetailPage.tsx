import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
    Box, Typography, Paper, Button, Divider, Stack, Grid, Chip, Breadcrumbs, Link,
    useMediaQuery
} from '@mui/material';
import { 
        Edit, Delete, Phone, Business, 
        Fingerprint 
} from '@mui/icons-material';
import { toast } from 'sonner';

import { proveedorRepository } from '../../infrastructure/repositories/proveedor.repository';
import type { Proveedor } from '../../domain/interfaces/proveedor.interface';
import ConfirmDialog from '../../../../shared/components/ui/dialog/ConfirmDialog';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

const ProveedorDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));
    
    const [proveedor, setProveedor] = useState<Proveedor | null>(null);
    const [loading, setLoading] = useState(true);
    const [openDelete, setOpenDelete] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchProveedor = useCallback(async () => {
        try {
                const data = await proveedorRepository.Obtener(String(id));
                    setProveedor(data);
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
    },[id]);

    useEffect(() => {
            if (id) fetchProveedor();
    }, [id, fetchProveedor]);

    const handleDelete = async () => {
        if (!id) return;
        setIsDeleting(true);
        try {
            toast.success('Proveedor eliminado correctamente');
            navigate('/proveedores');
        } catch (error) {
            console.error(error);
        } finally {
            setIsDeleting(false);
            setOpenDelete(false);
        }
    };

    if (loading) return <Loading />;

    if (!proveedor) return <ErrorPageLoading text="Proveedor no encontrado" navigate={() => navigate('/proveedores')} />;

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" mb={3} spacing={2}>
                <Breadcrumbs aria-label="breadcrumb">
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/proveedores')}>
                        Proveedores
                    </Link>
                    <Typography color="text.primary">Detalle</Typography>
                </Breadcrumbs>

                <Stack direction="row" spacing={1} width={{ xs: '100%', sm: 'auto' }}>
                    <Button 
                        variant="outlined" 
                        fullWidth={isMobile}
                        startIcon={<Edit />} 
                        onClick={() => navigate(`/proveedores/${id}/editar`)}
                    >
                        Editar
                    </Button>
                    <Button 
                        variant="contained" 
                        color="error" 
                        fullWidth={isMobile}
                        startIcon={<Delete />} 
                        onClick={() => setOpenDelete(true)}
                    >
                        Eliminar
                    </Button>
                </Stack>
            </Stack>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper sx={{ p: 4}} >
                        <Box display="flex" alignItems="center" gap={2} mb={3}>
                            <Business color="primary" sx={{ fontSize: 40 }} />
                            <Box>
                                <Typography variant="h4" fontWeight={800}>{proveedor.nombre}</Typography>
                                <Chip label="Proveedor Activo" color="success" size="small" variant="outlined" />
                            </Box>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Grid container spacing={4}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Fingerprint sx={{ fontSize: 16 }} /> ID DEL SISTEMA
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500} sx={{ wordBreak: 'break-all' }}>
                                        {proveedor.id}
                                    </Typography>
                                </Stack>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Stack spacing={1}>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <Phone sx={{ fontSize: 16 }} /> TELÉFONO DE CONTACTO
                                    </Typography>
                                    <Typography variant="h6" color="primary.main" fontWeight={700}>
                                        {proveedor.telefono}
                                    </Typography>
                                </Stack>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>

            <ConfirmDialog
                open={openDelete}
                title="¿Confirmar eliminación?"
                description={<Typography variant="body2">Estás a punto de eliminar a <strong>{proveedor.nombre}</strong>. Esta acción no se puede deshacer y podría afectar registros históricos de compras.</Typography>}
                onClose={() => !isDeleting && setOpenDelete(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </Box>
    );
};

export default ProveedorDetailPage;