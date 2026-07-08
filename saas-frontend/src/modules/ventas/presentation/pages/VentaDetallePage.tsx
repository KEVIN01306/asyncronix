import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, useTheme, Alert, AlertTitle } from '@mui/material';
import { Box, Card, CardContent, Typography, Button, Chip, Divider, Paper, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon, ShoppingBag, Receipt, Person, CalendarToday, CreditCard } from '@mui/icons-material';
import { toast } from 'sonner';
import { ventaRepository } from '../../infrastructure/venta.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import type { Venta } from '../../domain/interfaces/venta.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';

export default function VentaDetallePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venta, setVenta] = useState<Venta | null>(null);
    const user = useAuthStore(state => state.user);
    const theme = useTheme();

    useEffect(() => {
        if (id) {
            ventaRepository.obtener(id).then((res) => {
                setVenta(res.data);
            }).catch(() => {
                toast.error("Error al cargar la orden de venta");
                navigate('/ventas');
            });
        }
    }, [id, navigate]);

    if (!venta) return <Box py={8}><Loading /></Box>;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'COMPLETADA': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'ANULADA': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box py={4} px={{ xs: 2, md: 4 }} maxWidth="1300px" margin="auto">
            
            {/* Barra Superior de Navegación y Acciones */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Button 
                    variant="text" 
                    color="inherit"
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/ventas')} 
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Volver al registro de ventas
                </Button>
                <Button 
                    variant="outlined" 
                    color="inherit"
                    startIcon={<PrintIcon />} 
                    onClick={() => window.print()}
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Imprimir Comprobante
                </Button>
            </Box>

            {/* Alerta de Auditoría por Anulación */}
            {venta.estado === 'ANULADA' && user?.sucursal_id && (
                <Alert 
                    severity="error" 
                    variant="outlined"
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    <AlertTitle sx={{ fontWeight: 700 }}>Operación Anulada</AlertTitle>
                    Esta transacción fue cancelada y sus efectos contables han sido reversados en el inventario/caja. Para auditorías adicionales, contacte al administrador.
                </Alert>
            )}

            {/* Cabecera Principal del Invoice */}
            <Paper variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 2, borderColor: 'divider' }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
                    <Stack spacing={0.5}>
                        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.5, fontWeight: 600 }}>
                            COMPROBANTE INTERNO DE OPERACIÓN
                        </Typography>
                        <Typography variant="h5" component="h1" fontWeight={700}>
                            Orden de Venta #{id?.substring(0, 8).toUpperCase() || 'N/A'}
                        </Typography>
                    </Stack>
                    <Chip 
                        label={venta.estado} 
                        color={getEstadoColor(venta.estado)} 
                        size="medium" 
                        sx={{ fontWeight: 700, borderRadius: '6px', px: 1 }}
                    />
                </Box>
            </Paper>

            {/* Cuerpo del Detalle en Grid Asimétrico */}
            <Grid container spacing={3}>
                
                {/* COLUMNA IZQUIERDA: Metadatos y Actores (4 cols) */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2, height: '100%' }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="subtitle2" fontWeight={700} color="text.primary" mb={2.5}>
                                Datos del Registro
                            </Typography>
                            
                            <Stack spacing={2.5}>
                                <Box display="flex" gap={1.5}>
                                    <CalendarToday fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Fecha y Hora Registro</Typography>
                                        <Typography variant="body2" fontWeight={500}>{new Date(venta.created_at).toLocaleString('es-ES')}</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" gap={1.5}>
                                    <Person fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Efectuado por (Vendedor)</Typography>
                                        <Typography variant="body2" fontWeight={500}>{venta.vendedor_nombre}</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" gap={1.5}>
                                    <Receipt fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Receptor / Cliente</Typography>
                                        <Typography variant="body2" fontWeight={600}>{venta.cliente_nombre || 'Consumidor Final (General)'}</Typography>
                                    </Box>
                                </Box>

                                <Box display="flex" gap={1.5}>
                                    <CreditCard fontSize="small" color="action" sx={{ mt: 0.3 }} />
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" display="block">Canal de Liquidación / Pago</Typography>
                                        <Typography variant="body2" fontWeight={500}>{venta.metodo_pago}</Typography>
                                    </Box>
                                </Box>

                                {venta.comentarios && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Observaciones de Auditoría</Typography>
                                            <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic', color: 'text.secondary', bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
                                                {venta.comentarios}
                                            </Typography>
                                        </Box>
                                    </>
                                )}
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                {/* COLUMNA DERECHA: Partidas de Productos (8 cols) */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Box display="flex" alignItems="center" gap={1} mb={2.5}>
                                <ShoppingBag fontSize="small" color="action" />
                                <Typography variant="subtitle2" fontWeight={700}>Ítems Declarados / Partidas</Typography>
                            </Box>
                            
                            <ListTableSimple
                                columns={[
                                    { id: 'descripcion', name: 'Descripción del Producto / Servicio', format: (value: any) => value || '-' },
                                    { id: 'cantidad', name: 'Cant.', format: (value: any) => <Typography variant="body2" fontFamily="monospace">{value || '0'}</Typography> },
                                    { id: 'precio_unitario', name: 'Precio Unitario',format: (value: any) => <Typography variant="body2" fontFamily="monospace">{formatMoney(value)}</Typography> },
                                    { id: 'subtotal', name: 'Importe Neto', format: (value: any) => <Typography variant="body2" fontFamily="monospace" fontWeight={600}>{formatMoney(value)}</Typography> }
                                ]}
                                data={venta.detalles}
                                headerBgColor={theme.palette.action.hover}
                                headerTextColor={theme.palette.text.primary}
                                disableVerticalScroll={true}
                            />

                            {/* Bloque de Liquidación Monetaria Final */}
                            <Box display="flex" justifyContent="flex-end" mt={3} pt={2} borderTop="1px solid" borderColor="divider">
                                <Box width="280px">
                                    <Stack spacing={1.5}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Total Liquidado:</Typography>
                                            <Typography variant="h5" fontWeight={700} fontFamily="monospace" color="text.primary">
                                                {formatMoney(venta.total)}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}