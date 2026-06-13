import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { proveedoresRepository } from '../../infrastructure/proveedores.repository';
import type { Proveedor } from '../../domain/interfaces/proveedor.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

export default function ProveedorDetallePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [proveedor, setProveedor] = useState<Proveedor | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            proveedoresRepository.obtener(id)
                .then(res => setProveedor(res.data))
                .catch(() => navigate('/proveedores'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    if (loading) return <Loading />
    if (!proveedor) return <ErrorPageLoading text="No se pudo cargar el proveedor" navigate={() => navigate(-1)} />;

    return (
        <Box p={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/proveedores')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700}>Detalle de Proveedor</Typography>

                <Box mt={2}>
                    <Typography variant="subtitle2">Nombre</Typography>
                    <Typography variant="body1">{proveedor.nombre}</Typography>

                    {proveedor.contacto && (
                        <>
                            <Typography variant="subtitle2" mt={2}>Contacto</Typography>
                            <Typography variant="body1">{proveedor.contacto}</Typography>
                        </>
                    )}

                    <Typography variant="subtitle2" mt={2}>Teléfono</Typography>
                    <Typography variant="body1">{proveedor.telefono}</Typography>

                    {proveedor.email && (
                        <>
                            <Typography variant="subtitle2" mt={2}>Email</Typography>
                            <Typography variant="body1">{proveedor.email}</Typography>
                        </>
                    )}

                    {proveedor.nit && (
                        <>
                            <Typography variant="subtitle2" mt={2}>NIT</Typography>
                            <Typography variant="body1">{proveedor.nit}</Typography>
                        </>
                    )}
                </Box>
            </Paper>
        </Box>
    );
}
