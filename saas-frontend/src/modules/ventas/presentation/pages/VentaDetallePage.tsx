import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Card, CardContent, Typography, Button, Grid, Table, TableHead, TableBody, TableRow, TableCell, Chip, Divider, Paper, TableContainer } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Print as PrintIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { ventaRepository } from '../../infrastructure/venta.repository';
import type { Venta } from '../../domain/interfaces/venta.interface';

export default function VentaDetallePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [venta, setVenta] = useState<Venta | null>(null);

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

    if (!venta) return <Typography>Cargando...</Typography>;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'COMPLETADA': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'ANULADA': return 'error';
            default: return 'default';
        }
    };

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Box display="flex" alignItems="center" gap={2}>
                    <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')}>
                        Volver
                    </Button>
                    <Typography variant="h4" fontWeight="bold">Detalle de Venta</Typography>
                </Box>
                <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
                    Imprimir
                </Button>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Información General</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Typography variant="body1"><strong>ID:</strong> {venta.id}</Typography>
                            <Typography variant="body1"><strong>Fecha:</strong> {new Date(venta.created_at).toLocaleString()}</Typography>
                            <Typography variant="body1"><strong>Vendedor:</strong> {venta.vendedor_nombre}</Typography>
                            <Typography variant="body1"><strong>Cliente:</strong> {venta.cliente_nombre || 'Consumidor Final'}</Typography>
                            <Typography variant="body1" mt={1}><strong>Método de Pago:</strong> {venta.metodo_pago}</Typography>
                            <Box mt={2}>
                                <Typography variant="body1" component="span"><strong>Estado: </strong></Typography>
                                <Chip label={venta.estado} color={getEstadoColor(venta.estado)} size="small" />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Productos</Typography>
                            <TableContainer component={Paper} variant="outlined" elevation={0}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'background.default' }}>
                                        <TableRow>
                                            <TableCell><strong>Producto</strong></TableCell>
                                            <TableCell align="right"><strong>Cantidad</strong></TableCell>
                                            <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                                            <TableCell align="right"><strong>Subtotal</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {venta.detalles.map((detalle) => (
                                            <TableRow key={detalle.id}>
                                                <TableCell>{detalle.descripcion}</TableCell>
                                                <TableCell align="right">{detalle.cantidad}</TableCell>
                                                <TableCell align="right">${detalle.precio_unitario.toFixed(2)}</TableCell>
                                                <TableCell align="right">${detalle.subtotal.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>

                            <Box display="flex" justifyContent="flex-end" mt={3}>
                                <Box textAlign="right">
                                    <Typography variant="h5" fontWeight="bold">Total: ${venta.total.toFixed(2)}</Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
