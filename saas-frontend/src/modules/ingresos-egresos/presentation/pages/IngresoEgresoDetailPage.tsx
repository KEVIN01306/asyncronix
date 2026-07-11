import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, ReceiptLong, CalendarToday, AccountBalance, Shield, DataObject } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography, Grid, Divider, Paper } from '@mui/material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ingresoEgresoRepository from '../../infrastructure/ingresoEgreso.repository';
import type { IngresoEgreso } from '../../domain/interfaces/ingresoEgreso.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

export default function IngresoEgresoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movimiento, setMovimiento] = useState<IngresoEgreso | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMovimiento = async () => {
            if (!id) return;
            try {
                const result = await ingresoEgresoRepository.obtener(id);
                setMovimiento(result.data);
            } catch (err: any) {
                toast.error('No se pudo cargar el movimiento');
                setError(err.message || 'Error cargando movimiento');
            } finally {
                setLoading(false);
            }
        };

        loadMovimiento();
    }, [id]);

    if (loading) return <Loading />;

    if (error || !movimiento) {
        return (
            <Box p={4} maxWidth="600px" mx="auto">
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/ingresos-egresos')}>
                    Volver
                </Button>
                <Box mt={3}>
                    <Alert severity="error">{error || 'Movimiento no encontrado'}</Alert>
                </Box>
            </Box>
        );
    }

    const isIngreso = movimiento.tipo === 'INGRESO';
    const tipoLabel = isIngreso ? 'Flujo de Ingreso' : 'Erogación / Egreso';
    const tipoColor = isIngreso ? 'success' : 'error';

    // The financial entity (destination for INGRESO, origin for EGRESO)
    const entidad = movimiento.entidad;

    return (
        <Box py={4} px={{ xs: 2, md: 4 }} maxWidth="1200px" margin="auto">
            {/* Top Control Bar */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button
                    variant="text"
                    color="inherit"
                    startIcon={<ArrowBack />}
                    onClick={() => navigate('/ingresos-egresos')}
                    sx={{ fontWeight: 500 }}
                >
                </Button>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Shield fontSize="inherit" color="action" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                        {movimiento.codigo || id?.toUpperCase() || 'N/A'}
                    </Typography>
                </Stack>
            </Box>

            {/* Asymmetric Main Layout */}
            <Grid container spacing={3}>

                {/* LEFT COLUMN: Technical Details & Origins (8 cols) */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>

                        {/* Block: Operational Identification */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ letterSpacing: 0.5, fontWeight: 600 }}>
                                    CLASIFICACIÓN CONTABLE
                                </Typography>
                                <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
                                    {movimiento.categoria?.nombre || 'Sin Clasificar'}
                                </Typography>

                                {movimiento.descripcion && (
                                    <Box mt={2} pt={2} borderTop="1px dashed" borderColor="divider">
                                        <Typography variant="caption" color="text.secondary" display="block">Concepto / Glosa</Typography>
                                        <Typography variant="body2" color="text.primary" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                                            {movimiento.descripcion}
                                        </Typography>
                                    </Box>
                                )}
                            </CardContent>
                        </Card>

                        {/* Block: Traceability & Audit */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                                    <CalendarToday fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600}>Fechas y Auditoría de Sistema</Typography>
                                </Box>
                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Fecha Efectiva (Valor)</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {new Date(movimiento.fechas.transaccion).toLocaleDateString('es-ES', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Registrado Por</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {movimiento.usuario?.apellido
                                                ? `${movimiento.usuario.nombre} ${movimiento.usuario.apellido}`
                                                : movimiento.usuario?.nombre || 'Sistema Automatizado'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Fecha de Registro</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {new Date(movimiento.fechas.creacion).toLocaleDateString('es-ES', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                            })}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Block: Internal Financial Structure */}
                        <Card variant="outlined" sx={{ borderRadius: 2 }}>
                            <CardContent sx={{ p: 3 }}>
                                <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                                    <ReceiptLong fontSize="small" color="action" />
                                    <Typography variant="subtitle2" fontWeight={600}>Ruta de Fondos & Tesorería</Typography>
                                </Box>
                                <Grid container spacing={2.5}>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Tipo de Canal</Typography>
                                        <Typography variant="body2" fontWeight={500}>
                                            {entidad?.tipo === 'CAJA' ? 'Caja / Efectivo' : entidad?.tipo === 'CUENTA' ? 'Cuenta Financiera' : 'N/A'}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">
                                            {isIngreso ? 'Destinatario' : 'Origen'}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={500}>{entidad?.nombre || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Código Divisa ISO</Typography>
                                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">
                                            {movimiento.moneda?.codigo || 'N/A'}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Block: Bank Account Details (optional — only for CUENTA) */}
                        {entidad?.tipo === 'CUENTA' && entidad.banco && (
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                                        <AccountBalance fontSize="small" color="action" />
                                        <Typography variant="subtitle2" fontWeight={600}>Instrumento Bancario Vinculado</Typography>
                                    </Box>
                                    <Grid container spacing={2.5}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Institución Financiera</Typography>
                                            <Typography variant="body2" fontWeight={500}>{entidad.banco}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Número de Cuenta / IBAN</Typography>
                                            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{entidad.nombre}</Typography>
                                        </Grid>
                                        {entidad.moneda_codigo && (
                                            <Grid size={{ xs: 12, sm: 6 }}>
                                                <Typography variant="caption" color="text.secondary" display="block">Divisa de Cuenta</Typography>
                                                <Typography variant="body2" fontWeight={500}>{entidad.moneda_codigo}</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Stack>
                </Grid>

                {/* RIGHT COLUMN: Monetary Settlement & Status (4 cols) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>

                        {/* Monetary Settlement Card */}
                        <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: 'background.paper' }}>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="caption" color="text.secondary" display="block" gutterBottom sx={{ fontWeight: 600 }}>
                                    ESTADO DE OPERACIÓN
                                </Typography>
                                <Chip
                                    label={tipoLabel.toUpperCase()}
                                    color={tipoColor}
                                    size="small"
                                    sx={{ fontWeight: 700, borderRadius: '4px', fontSize: '0.75rem', mb: 3 }}
                                />

                                <Divider sx={{ my: 2 }} />

                                <Box my={2}>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Importe Original de Transacción
                                    </Typography>
                                    <Typography variant="h4" component="div" sx={{ fontWeight: 700, my: 0.5 }}>
                                        {isIngreso ? '+' : '-'} {formatMoney(movimiento.monto.original, movimiento.moneda?.codigo)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                        Moneda origen: {movimiento.moneda?.codigo}
                                    </Typography>
                                </Box>

                                {/* FX breakdown (only when exchange rate differs from 1) */}
                                {movimiento.monto.tipo_cambio !== 1.0 && (
                                    <Paper sx={{ p: 2, mt: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" color="text.secondary">Tasa de Cambio (FX)</Typography>
                                                <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
                                                    1.00 = {movimiento.monto.tipo_cambio.toFixed(4)}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ borderStyle: 'dashed' }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Liquidación en Moneda Base</Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                                    {formatMoney(movimiento.monto.moneda_base, movimiento.moneda_base?.codigo)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                )}
                            </CardContent>
                        </Card>

                        {/* Data conformity footer */}
                        <Box px={1} display="flex" alignItems="flex-start" gap={1}>
                            <DataObject fontSize="small" color="disabled" />
                            <Typography variant="caption" color="text.disabled" sx={{ lineHeight: 1.3 }}>
                                Este registro representa un movimiento contable inmutable indexado en el sistema central. Cualquier cambio requiere un contraasiento de ajuste.
                            </Typography>
                        </Box>

                    </Stack>
                </Grid>

            </Grid>
        </Box>
    );
}