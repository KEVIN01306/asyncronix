import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { TipoServicioRepository } from '../../infrastructure/repositories/tipo-servicio.repository';
import type { TipoServicio } from '../../domain/interfaces/tipo-servicio.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

const TipoServicioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tipoServicio, setTipoServicio] = useState<TipoServicio | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        TipoServicioRepository.Obtener(id)
            .then(setTipoServicio)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <Loading/>;

    if (!tipoServicio) return <ErrorPageLoading text="No se pudo cargar el tipo de servicio" navigate={() => navigate(-1)} />;

    return (
        <Box p={4} maxWidth="800px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack spacing={2}>
                    <Typography variant="h5" fontWeight={700}>{tipoServicio.nombre}</Typography>
                    <Typography variant="body2" color="text.secondary">Precio base: Q {tipoServicio.precio_base.toFixed(2)}</Typography>
                    <Typography variant="body2" color="text.secondary">Checklist automático: {tipoServicio.checklist ? 'Sí' : 'No'}</Typography>
                    <Typography variant="body2" color="text.secondary">Estado: {tipoServicio.activo ? 'Activo' : 'Inactivo'}</Typography>
                    <Typography variant="subtitle1" fontWeight={600}>Opciones del servicio</Typography>
                    {tipoServicio.opciones.length === 0 ? (
                        <Typography variant="body2" color="text.secondary">No hay opciones asignadas.</Typography>
                    ) : (
                        <Stack direction="row" gap={1} flexWrap="wrap">
                            {tipoServicio.opciones.map((opcion) => (
                                <Chip key={opcion.id} label={opcion.nombre} />
                            ))}
                        </Stack>
                    )}
                    <Typography variant="body2" color="text.secondary">Creado: {new Date(tipoServicio.created_at).toLocaleString()}</Typography>
                    <Typography variant="body2" color="text.secondary">Última actualización: {new Date(tipoServicio.updated_at).toLocaleString()}</Typography>
                </Stack>
            </Paper>
        </Box>
    );
};

export default TipoServicioDetailPage;
