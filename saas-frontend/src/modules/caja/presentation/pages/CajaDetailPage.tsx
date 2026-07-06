import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { cajaRepository } from '../../infrastructure/caja.repository';
import type { Caja } from '../../domain/interfaces/caja.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

export default function CajaDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caja, setCaja] = useState<Caja | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            cajaRepository.obtener(id)
                .then((res) => setCaja(res.data))
                .catch(() => navigate('/cajas'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    if (loading) return <Loading />;
    if (!caja) return <Box p={4}>Caja no encontrada.</Box>;

    return (
        <Box p={4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/cajas')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700}>Detalle de Caja</Typography>
                <Box mt={2}>
                    <Typography variant="subtitle2">Nombre</Typography>
                    <Typography variant="body1">{caja.nombre}</Typography>
                    <Typography variant="subtitle2" mt={2}>Tipo</Typography>
                    <Typography variant="body1">{caja.tipo}</Typography>
                    <Typography variant="subtitle2" mt={2}>Saldo</Typography>
                    <Typography variant="body1">{caja.saldo}</Typography>
                    <Typography variant="subtitle2" mt={2}>Activo</Typography>
                    <Typography variant="body1">{caja.activo ? 'Sí' : 'No'}</Typography>
                </Box>
            </Paper>
        </Box>
    );
}
