import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack, ReceiptLong, CalendarToday, AccountBalance, Shield, DataObject } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Stack, Typography, Grid, Divider, Paper } from '@mui/material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import movimientoRepository from '../../infrastructure/movimiento.repository';
import type { TransaccionDetalle } from '../../domain/interfaces/movimiento.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

export default function MovimientoDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [movimiento, setMovimiento] = useState<TransaccionDetalle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadMovimiento = async () => {
            if (!id) return;
            try {
                const result = await movimientoRepository.obtener(id);
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
                <Button variant="outlined" startIcon={<ArrowBack />} onClick={() => navigate('/movimientos')}>
                    Volver
                </Button>
                <Box mt={3}>
                    <Alert severity="error">{error || 'Movimiento no encontrado'}</Alert>
                </Box>
            </Box>
        );
    }

    const isIngreso = movimiento.tipo_movimiento === 'INGRESO';
    const tipoLabel = isIngreso ? 'Flujo de Ingreso' : 'Erogación / Egreso';
    const tipoColor = isIngreso ? 'success' : 'error';

    return (
        <Box py={4} px={{ xs: 2, md: 4 }} maxWidth="1200px" margin="auto">
            {/* Barra Superior de Control */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button 
                    variant="text" 
                    color="inherit"
                    startIcon={<ArrowBack />} 
                    onClick={() => navigate('/movimientos')}
                    sx={{ fontWeight: 500 }}
                >

                </Button>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <Shield fontSize="inherit" color="action" />
                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace', letterSpacing: 1 }}>
                        REF-ID: {id?.toUpperCase() || 'N/A'}
                    </Typography>
                </Stack>
            </Box>

            {/* Layout Principal Asimétrico */}
            <Grid container spacing={3}>
                
                {/* COLUMNA IZQUIERDA: Detalles Técnicos y Orígenes (8 cols) */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Stack spacing={3}>
                        
                        {/* Bloque Principal: Identificación Operacional */}
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

                        {/* Bloque: Trazabilidad y Auditoría */}
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
                                            {new Date(movimiento.fecha_transaccion).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Registrado Por</Typography>
                                        <Typography variant="body2" fontWeight={500}>{movimiento.usuario?.nombre || 'Sistema Automatizado'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Bloque: Estructura Financiera Interna */}
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
                                            {isIngreso
                                                ? (movimiento.destino_entidad === 'CAJA' ? 'Caja / Efectivo' : 'Cuenta Financiera')
                                                : (movimiento.origen_entidad === 'CAJA' ? 'Caja / Efectivo' : 'Cuenta Financiera')}
                                        </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Origen / Destinatario</Typography>
                                        <Typography variant="body2" fontWeight={500}>{movimiento.entidad_nombre || 'N/A'}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 4 }}>
                                        <Typography variant="caption" color="text.secondary" display="block">Código Divisa ISO</Typography>
                                        <Typography variant="body2" fontWeight={600} fontFamily="monospace">{movimiento.moneda?.codigo || 'N/A'}</Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>

                        {/* Bloque: Instrumento Bancario Relacionado (Opcional) */}
                        {movimiento.cuenta && (
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                                        <AccountBalance fontSize="small" color="action" />
                                        <Typography variant="subtitle2" fontWeight={600}>Instrumento Bancario Vinculado</Typography>
                                    </Box>
                                    <Grid container spacing={2.5}>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Institución Financiera</Typography>
                                            <Typography variant="body2" fontWeight={500}>{movimiento.cuenta.banco?.nombre_comercial || 'N/A'}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Número de Cuenta / IBAN</Typography>
                                            <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{movimiento.cuenta.numero_cuenta}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Titular Autorizado</Typography>
                                            <Typography variant="body2" fontWeight={500}>{movimiento.cuenta.nombre_titular}</Typography>
                                        </Grid>
                                        <Grid size={{ xs: 12, sm: 6 }}>
                                            <Typography variant="caption" color="text.secondary" display="block">Divisa de Cuenta</Typography>
                                            <Typography variant="body2" fontWeight={500}>{movimiento.cuenta.moneda?.codigo || 'N/A'}</Typography>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        )}
                    </Stack>
                </Grid>

                {/* COLUMNA DERECHA: Liquidación de Montos & Estados (4 cols) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Stack spacing={3} sx={{ position: 'sticky', top: 24 }}>
                        
                        {/* Tarjeta de Liquidación Monetaria */}
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
                                        {isIngreso ? '+' : '-'} {formatMoney(movimiento.monto_original, movimiento.moneda?.codigo)}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                        Moneda origen: {movimiento.moneda?.codigo}
                                    </Typography>
                                </Box>

                                {/* Desglose FX si aplica multimoneda */}
                                {movimiento.tipo_cambio !== 1.0 && (
                                    <Paper  sx={{ p: 2, mt: 2, bgcolor: 'action.hover', borderRadius: 1.5 }}>
                                        <Stack spacing={1.5}>
                                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                                <Typography variant="caption" color="text.secondary">Tasa de Cambio (FX)</Typography>
                                                <Typography variant="caption" fontFamily="monospace" fontWeight={600}>
                                                    1.00 = {movimiento.tipo_cambio.toFixed(4)}
                                                </Typography>
                                            </Box>
                                            <Divider sx={{ borderStyle: 'dashed' }} />
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" display="block">Liquidación en Moneda Base</Typography>
                                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">
                                                    {formatMoney(movimiento.monto_moneda_base, movimiento.moneda_actual?.codigo)}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                    </Paper>
                                )}
                            </CardContent>
                        </Card>

                        {/* Pequeño footer de conformidad de datos */}
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