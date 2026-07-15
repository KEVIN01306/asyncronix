import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Chip,
    Divider,
    Grid,
    IconButton,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { ArrowBack, CheckCircleOutline, AccountBalanceWallet, SwapHoriz } from '@mui/icons-material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { movimientosRepository } from '../../infrastructure/movimientos.repository';
import type { MovimientoInternoEntity } from '../../domain/movimientos.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

export default function MovimientoDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movimiento, setMovimiento] = useState<MovimientoInternoEntity | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetalle = async () => {
            if (!id) return;
            try {
                const res = await movimientosRepository.obtenerDetalleMovimiento(id);
                setMovimiento(res.data);
            } catch (error) {
                toast.error('Error cargando los detalles del movimiento');
                navigate('/movimientos-internos');
            } finally {
                setLoading(false);
            }
        };

        fetchDetalle();
    }, [id, navigate]);

    if (loading) {
        return <Box py={8}><Loading /></Box>;
    }

    if (!movimiento) {
        return <Typography p={4} textAlign="center">Movimiento no encontrado</Typography>;
    }

    return (
        <Box py={{ xs: 2, sm: 4 }} px={{ xs: 2, sm: 4 }} maxWidth="900px" margin="auto">
            {/* Cabecera superior */}
            <Stack direction="row" alignItems="center" spacing={1.5} mb={4}>
                <IconButton
                    onClick={() => navigate('/movimientos-internos')}
                    sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        bgcolor: 'background.paper'
                    }}
                >
                    <ArrowBack fontSize="small" />
                </IconButton>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                        Módulo de Tesorería
                    </Typography>
                    <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: '-0.02em' }}>
                        Detalle de Movimiento
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                        ID Interno: {movimiento.id}
                    </Typography>
                </Box>
            </Stack>

            <Card>
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    {/* Bloque Identificador & Estado */}
                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                        gap={2}
                        mb={3}
                    >
                        <Box>
                            <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ letterSpacing: '-0.01em' }}>
                                {movimiento.codigo}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                                Registrado el {new Date(movimiento.fechas.transaccion).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </Typography>
                        </Box>
                        <Chip
                            icon={<CheckCircleOutline sx={{ fontSize: '1rem' }} />}
                            label="Completado"
                            sx={{
                                fontWeight: 600,
                                px: 1,
                                bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                                color: 'success.main',
                                border: 'none'
                            }}
                        />
                    </Stack>

                    <Divider sx={{ mb: 4 }} />

                    <Grid container spacing={3}>
                        {/* Flujo de Fondos (Origen / Destino) */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.text.primary, theme.palette.mode === 'dark' ? 0.02 : 0.015), border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
                                <Typography variant="body2" fontWeight={700} color="text.primary" mb={2.5} display="flex" alignItems="center" gap={1}>
                                    <AccountBalanceWallet sx={{ fontSize: 18, color: 'text.secondary' }} /> Flujo de Fondos
                                </Typography>
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                            Origen (Débito)
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="text.primary" mt={0.5}>
                                            {movimiento.origen?.nombre || 'N/A'}
                                        </Typography>
                                        {movimiento.origen?.tipo === 'CUENTA' && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {movimiento.origen.banco}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                            Destino (Crédito)
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600} color="text.primary" mt={0.5}>
                                            {movimiento.destino?.nombre || 'N/A'}
                                        </Typography>
                                        {movimiento.destino?.tipo === 'CUENTA' && (
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {movimiento.destino.banco}
                                            </Typography>
                                        )}
                                    </Box>
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Resumen Financiero e Importes */}
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Box sx={{ p: 3, bgcolor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.08 : 0.04), border: '1px solid', borderColor: (theme) => alpha(theme.palette.primary.main, 0.15), borderRadius: 3, height: '100%' }}>
                                <Typography variant="body2" fontWeight={700} color="primary.main" mb={2.5} display="flex" alignItems="center" gap={1}>
                                    <SwapHoriz sx={{ fontSize: 18 }} /> Resumen Financiero
                                </Typography>
                                <Stack spacing={2.5}>
                                    <Box>
                                        <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                            Monto Registrado
                                        </Typography>
                                        <Typography variant="h4" fontWeight={700} color="primary.main" mt={0.5} sx={{ letterSpacing: '-0.02em', fontFamily: 'monospace' }}>
                                            {formatMoney(movimiento.monto.original, movimiento.moneda?.codigo)}
                                        </Typography>
                                    </Box>

                                    {movimiento.moneda?.id !== movimiento.moneda_base?.id && (
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                                                Conversión a Moneda Base
                                            </Typography>
                                            <Typography variant="body1" fontWeight={700} color="text.primary" mt={0.5} sx={{ fontFamily: 'monospace' }}>
                                                {formatMoney(movimiento.monto.moneda_base, movimiento.moneda_base?.codigo)}
                                                <Box component="span" sx={{ ml: 1, fontSize: '0.75rem', fontWeight: 500, color: 'text.secondary', fontFamily: 'sans-serif' }}>
                                                    (TC: {movimiento.monto.tipo_cambio})
                                                </Box>
                                            </Typography>
                                        </Box>
                                    )}
                                </Stack>
                            </Box>
                        </Grid>

                        {/* Descripción o Glosa */}
                        <Grid size={{ xs: 12 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.02em', display: 'block', mb: 1 }}>
                                Glosa o Descripción de la Operación
                            </Typography>
                            <Paper sx={{ p: 2, minHeight: 80, border: '1px solid', borderColor: 'divider', bgcolor: 'transparent' }}>
                                <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6 }}>
                                    {movimiento.descripcion || 'Sin descripción adicional registrada.'}
                                </Typography>
                            </Paper>
                        </Grid>

                        {/* Auditoría inferior */}
                        <Grid size={{ xs: 12 }}>
                            <Divider sx={{ my: 1, borderStyle: 'dashed' }} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
                                **Operador:** {movimiento.usuario?.nombre} {movimiento.usuario?.apellido} •
                                Registrado en sistema: {new Date(movimiento.fechas.creacion).toLocaleString('es-ES')}
                            </Typography>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
}