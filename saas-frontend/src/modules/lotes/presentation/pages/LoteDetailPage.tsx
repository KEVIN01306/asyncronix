import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Divider, Button, Stack, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LoteDetailHeader from './components/LoteDetailHeader';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { LoteRepository } from '../../infrastructure/repositories/lote.repository';
import type { Lote } from '../../domain/interfaces/lote.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

const LoteDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [lote, setLote] = useState<Lote | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            if (!id) return;
            try {
                const data = await LoteRepository.obtener(id);
                setLote(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    if (loading) return <Loading />;
    if (!lote) return <ErrorPageLoading text="Lote no encontrado" navigate={() => navigate(-1)} />;

    return (
        <Box p={isMobile ? 2 : 4} maxWidth="900px" mx="auto">
            <LoteDetailHeader
                title={`Lote ${lote.codigo_lote ?? ''}`}
                subtitle={lote.variante?.producto_nombre ?? ''}
                onBack={() => navigate('/lotes')}
                onCreate={() => navigate('/lotes/crear?producto_id=' + (lote.variante?.producto_id || ''))}
            />

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
                    <Box flex={2}>
                        <Typography variant="h6" fontWeight={700} mb={1}>Detalles</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Typography><strong>Producto:</strong> {lote.variante?.producto_nombre ?? lote.variante?.producto_id ?? lote.variante_id}</Typography>
                            <Typography><strong>Sucursal:</strong> {lote.sucursal?.nombre ?? lote.sucursal_id}</Typography>
                            <Typography><strong>Cantidad actual:</strong> {lote.cantidad_actual}</Typography>
                            <Typography><strong>Código de lote:</strong> {lote.codigo_lote}</Typography>
                            <Typography><strong>Costo compra (Lote):</strong>{formatMoney(lote.costo_compra)}</Typography>
                            <Typography><strong>Precio venta (U):</strong>{formatMoney(lote.precio_venta)}</Typography>
                            <Typography><strong>Fecha ingreso:</strong> {new Date(lote.fecha_ingreso).toLocaleString()}</Typography>
                            <Typography><strong>Fecha vigencia:</strong> {lote.fecha_vencimiento ? new Date(lote.fecha_vencimiento).toLocaleDateString() : 'No aplica'}</Typography>
                        </Stack>
                    </Box>

                    <Box flex={1}>
                        <Typography variant="h6" fontWeight={700} mb={1}>Resumen</Typography>
                        <Divider sx={{ mb: 2 }} />
                        <Stack spacing={2}>
                            <Typography><strong>Estado:</strong> {lote.activo ? 'Activo' : 'Inactivo'}</Typography>
                            <Typography><strong>Sucursal:</strong> {lote.sucursal?.nombre ?? lote.sucursal_id}</Typography>
                            <Button variant="contained" onClick={() => navigate(-1)} sx={{ mt: 2 }}>Volver</Button>
                        </Stack>
                    </Box>
                </Stack>
            </Paper>
        </Box>
    );
};

export default LoteDetailPage;
