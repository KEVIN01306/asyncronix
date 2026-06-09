import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Paper, Typography, Button, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { proveedoresRepository } from '../../infrastructure/proveedores.repository';
import type { Proveedor } from '../../domain/interfaces/proveedor.interface';

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

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;
    if (!proveedor) return <Box p={4}>Proveedor no encontrado</Box>;

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
