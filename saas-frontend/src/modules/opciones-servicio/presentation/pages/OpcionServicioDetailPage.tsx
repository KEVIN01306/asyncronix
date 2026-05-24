import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CircularProgress, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { OpcionServicioRepository } from '../../infrastructure/repositories/opcion-servicio.repository';
import type { OpcionServicio } from '../../domain/interfaces/opcion-servicio.interface';

const OpcionServicioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [opcion, setOpcion] = useState<OpcionServicio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        OpcionServicioRepository.Obtener(id)
            .then(setOpcion)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    if (!opcion) return <Box p={4}><Typography>No se encontró la opción de servicio.</Typography></Box>;

    return (
        <Box p={4} maxWidth="760px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={700}>{opcion.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">Estado: {opcion.activo ? 'Activo' : 'Inactivo'}</Typography>
                    <Typography variant="body1">{opcion.descripcion || 'No hay descripción disponible.'}</Typography>
                    <Typography variant="body2" color="text.secondary">Creado: {new Date(opcion.created_at).toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Última actualización: {new Date(opcion.updated_at).toLocaleString()}</Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default OpcionServicioDetailPage;
