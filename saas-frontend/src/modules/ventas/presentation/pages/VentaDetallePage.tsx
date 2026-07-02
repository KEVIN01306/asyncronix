import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, useTheme, useMediaQuery, Alert, AlertTitle } from '@mui/material';
import { Box, Card, CardContent, Typography, Button, Chip, Divider, Paper } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';
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
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (id) {
            ventaRepository.obtener(id).then((res) => {
                setVenta(res.data);
            }).catch(() => {
                toast.error("Error al cargar la venta");
                navigate('/ventas');
            });
        }
    }, [id, navigate]);

    if (!venta) return <Loading />;
;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'COMPLETADA': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'ANULADA': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5" fontWeight={700}>Detalle de Venta</Typography>
                    <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
                        Imprimir
                    </Button>
                </Box>
            </Paper>

            {
                venta.estado === 'ANULADA' && user?.sucursal_id && (
                    <Alert severity="error" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                        <AlertTitle>Información</AlertTitle>
                        Esta venta fue anulada. Si necesitas más información, por favor contacta al administrador de tu cuenta.
                    </Alert>
                )
            }
            

            <Grid container spacing={5}>
                <Grid size={{ xs: 12, md: 4}}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Información General</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1"><strong>Fecha:</strong> {new Date(venta.created_at).toLocaleString()}</Typography>
                            <Typography variant="body1"><strong>Vendedor:</strong> {venta.vendedor_nombre}</Typography>
                            <Typography variant="body1"><strong>Cliente:</strong> {venta.cliente_nombre || 'Consumidor Final'}</Typography>
                            <Typography variant="body1" mt={1}><strong>Método de Pago:</strong> {venta.metodo_pago}</Typography>
                            {
                                venta.comentarios && (
                                    <Typography variant="body1" mt={1}><strong>Comentarios:</strong> {venta.comentarios}</Typography>
                                )
                            }
                            <Box mt={2}>
                                <Typography variant="body1" component="span"><strong>Estado: </strong></Typography>
                                <Chip variant='outlined' label={venta.estado} color={getEstadoColor(venta.estado)} size="small" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8}}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Productos</Typography>
                            <ListTableSimple
                                columns={[
                                    { id: 'descripcion', name: 'Producto', format: (value: any) => value || '-' },
                                    { id: 'cantidad', name: 'Cantidad', format: (value: any) => value || '-' },
                                    { id: 'precio_unitario', name: 'Precio Unit.', format: (value:any ) => formatMoney(value) },
                                    { id: 'subtotal', name: 'Subtotal', format: (value: any) => formatMoney(value) }
                                ]}
                                data={venta.detalles}
                                headerBgColor={theme.palette.primary.main}
                                headerTextColor="#fff"
                                disableVerticalScroll={true}
                            />
                            <Box display="flex" justifyContent="flex-end" mt={3}>
                                <Box textAlign="right">
                                    <Typography variant="h5" fontWeight="bold">Total: {formatMoney(venta.total)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
