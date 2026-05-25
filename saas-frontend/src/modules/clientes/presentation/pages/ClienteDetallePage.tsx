import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Grid, useTheme, useMediaQuery, Alert, AlertTitle } from '@mui/material';
import { Box, Card, CardContent, Typography, Button, Table, TableHead, TableBody, TableRow, TableCell, Chip, Divider, Paper, TableContainer, Pagination } from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { clienteRepository } from '../../infrastructure/clientes.repository';
import { ventaRepository } from '../../../ventas/infrastructure/venta.repository';
import type { Cliente } from '../../domain/interfaces/cliente.interface';
import type { Venta } from '../../../ventas/domain/interfaces/venta.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

export default function ClienteDetallePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loadingCliente, setLoadingCliente] = useState(true);
    const [loadingVentas, setLoadingVentas] = useState(true);
    const [page, setPage] = useState(1);
    const [totalVentas, setTotalVentas] = useState(0);
    const itemsPerPage = 5;

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        if (id) {
            // Cargar cliente
            clienteRepository.obtener(id)
                .then((res) => {
                    setCliente(res.data);
                })
                .catch(() => {
                    toast.error("Error al cargar el cliente");
                    navigate('/clientes');
                })
                .finally(() => setLoadingCliente(false));

            // Cargar ventas del cliente
            cargarVentas(id, 1);
        }
    }, [id, navigate]);

    const cargarVentas = async (clienteId: string, pageNum: number) => {
        setLoadingVentas(true);
        try {
            const offset = (pageNum - 1) * itemsPerPage;
            const res = await ventaRepository.listar(itemsPerPage, offset, clienteId);
            setVentas(res.data);
            setTotalVentas(res.meta?.total ?? 0);
        } catch {
            toast.error("Error al cargar ventas del cliente");
            setVentas([]);
            setTotalVentas(0);
        } finally {
            setLoadingVentas(false);
        }
    };

    const handlePageChange = (_event: any, newPage: number) => {
        setPage(newPage);
        if (id) {
            cargarVentas(id, newPage);
        }
    };

    if (loadingCliente) return <Loading />;
    if (!cliente) return <Loading />;

    const getEstadoColor = (estado: string) => {
        switch (estado) {
            case 'COMPLETADA': return 'success';
            case 'PENDIENTE': return 'warning';
            case 'ANULADA': return 'error';
            default: return 'default';
        }
    };

    const getMetodoPagoLabel = (metodo: string) => {
        const metodos: Record<string, string> = {
            EFECTIVO: 'Efectivo',
            TARJETA: 'Tarjeta',
            TRANSFERENCIA: 'Transferencia',
            CHEQUE: 'Cheque',
            OTRO: 'Otro',
        };
        return metodos[metodo] || metodo;
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/clientes')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>Detalle de Cliente</Typography>
            </Paper>

            <Grid container spacing={3}>
                {/* Información General del Cliente */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Información General</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <Box sx={{ display: 'grid', gap: 1.5 }}>
                                <Box>
                                    <Typography variant="caption" color="textSecondary">Nombre</Typography>
                                    <Typography variant="body1">{cliente.nombre}</Typography>
                                </Box>

                                {cliente.apellido && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Apellido</Typography>
                                        <Typography variant="body1">{cliente.apellido}</Typography>
                                    </Box>
                                )}

                                {cliente.nit && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">NIT</Typography>
                                        <Typography variant="body1">{cliente.nit}</Typography>
                                    </Box>
                                )}

                                {cliente.dpi && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">DPI</Typography>
                                        <Typography variant="body1">{cliente.dpi}</Typography>
                                    </Box>
                                )}

                                {cliente.email && (
                                    <Box>
                                        <Typography variant="caption" color="textSecondary">Email</Typography>
                                        <Typography variant="body1">{cliente.email}</Typography>
                                    </Box>
                                )}

                                <Box>
                                    <Typography variant="caption" color="textSecondary">Teléfono</Typography>
                                    <Typography variant="body1">{cliente.telefono}</Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="textSecondary">Fecha de Creación</Typography>
                                    <Typography variant="body1">
                                        {new Date(cliente.created_at).toLocaleDateString()}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="textSecondary">Última Actualización</Typography>
                                    <Typography variant="body1">
                                        {new Date(cliente.updated_at).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Historial de Ventas */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Historial de Ventas</Typography>
                            <Divider sx={{ mb: 2 }} />

                            {loadingVentas ? (
                                <Box sx={{ textAlign: 'center', py: 2 }}>
                                    <Typography color="textSecondary">Cargando ventas...</Typography>
                                </Box>
                            ) : ventas.length === 0 ? (
                                <Alert severity="info">
                                    <AlertTitle>Sin ventas</AlertTitle>
                                    Este cliente no tiene ventas registradas.
                                </Alert>
                            ) : (
                                <>
                                    <TableContainer component={Paper} variant="outlined" elevation={0}>
                                        <Table size="small">
                                            <TableHead sx={{ bgcolor: 'secondary.main' }}>
                                                <TableRow>
                                                    <TableCell><strong>Código</strong></TableCell>
                                                    <TableCell><strong>Fecha</strong></TableCell>
                                                    <TableCell><strong>Vendedor</strong></TableCell>
                                                    <TableCell align="right"><strong>Total</strong></TableCell>
                                                    <TableCell><strong>Método Pago</strong></TableCell>
                                                    <TableCell><strong>Estado</strong></TableCell>
                                                    <TableCell align="center"><strong>Acción</strong></TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {ventas.map((venta: any) => (
                                                    <TableRow key={venta.id} hover>
                                                        <TableCell>
                                                            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                                                {venta.id.substring(0, 8).toUpperCase()}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell>
                                                            {new Date(venta.created_at).toLocaleDateString()}
                                                        </TableCell>
                                                        <TableCell>{venta.vendedor_nombre || 'N/A'}</TableCell>
                                                        <TableCell align="right">
                                                            <strong>{formatMoney(venta.total)}</strong>
                                                        </TableCell>
                                                        <TableCell>
                                                            {getMetodoPagoLabel(venta.metodo_pago)}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Chip
                                                                label={venta.estado}
                                                                color={getEstadoColor(venta.estado) as any}
                                                                variant="outlined"
                                                                size="small"
                                                            />
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Button
                                                                size="small"
                                                                onClick={() => navigate(`/ventas/${venta.id}`)}
                                                                sx={{ textTransform: 'none' }}
                                                            >
                                                                Ver
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>

                                    {Math.ceil(totalVentas / itemsPerPage) > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <Pagination
                                                count={Math.ceil(totalVentas / itemsPerPage)}
                                                page={page}
                                                onChange={handlePageChange}
                                                color="primary"
                                            />
                                        </Box>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
