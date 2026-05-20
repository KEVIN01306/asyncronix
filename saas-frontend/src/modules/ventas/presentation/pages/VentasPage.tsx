import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Typography
} from '@mui/material';
import { Add as AddIcon, Visibility as VisibilityIcon, Edit as EditIcon, Cancel as CancelIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { ventaRepository } from '../../infrastructure/venta.repository';
import type { Venta } from '../../domain/interfaces/venta.interface';

export default function VentasPage() {
    const navigate = useNavigate();
    const [ventas, setVentas] = useState<Venta[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [total, setTotal] = useState(0);

    const cargarVentas = async () => {
        try {
            setLoading(true);
            const data = await ventaRepository.listar(page + 1, rowsPerPage);
            setVentas(data.data);
            setTotal(data.total);
        } catch (error) {
            toast.error("Error al cargar las ventas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        cargarVentas();
    }, [page, rowsPerPage]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleAnular = async (id: string) => {
        if (window.confirm('¿Está seguro de que desea anular esta venta? Esta acción devolverá el stock.')) {
            try {
                await ventaRepository.anular(id);
                toast.success('Venta anulada exitosamente');
                cargarVentas();
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Error al anular la venta');
            }
        }
    };

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
                <Typography variant="h4" fontWeight="bold">Ventas</Typography>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/ventas/nuevo')}
                >
                    Nueva Venta
                </Button>
            </Box>

            <Card>
                <CardContent>
                    {loading ? (
                        <Box display="flex" justifyContent="center" p={3}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            <TableContainer component={Paper} elevation={0} variant="outlined">
                                <Table>
                                    <TableHead sx={{ bgcolor: 'background.default' }}>
                                        <TableRow>
                                            <TableCell><strong>Fecha</strong></TableCell>
                                            <TableCell><strong>Cliente</strong></TableCell>
                                            <TableCell><strong>Total</strong></TableCell>
                                            <TableCell><strong>Método</strong></TableCell>
                                            <TableCell><strong>Estado</strong></TableCell>
                                            <TableCell align="right"><strong>Acciones</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {ventas.map((venta) => (
                                            <TableRow key={venta.id}>
                                                <TableCell>{new Date(venta.created_at).toLocaleString()}</TableCell>
                                                <TableCell>{venta.cliente_nombre || 'Consumidor Final'}</TableCell>
                                                <TableCell>${venta.total.toFixed(2)}</TableCell>
                                                <TableCell>{venta.metodo_pago}</TableCell>
                                                <TableCell>
                                                    <Chip label={venta.estado} color={getEstadoColor(venta.estado)} size="small" />
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton color="info" onClick={() => navigate(`/ventas/${venta.id}`)}>
                                                        <VisibilityIcon />
                                                    </IconButton>
                                                    {venta.estado === 'PENDIENTE' && (
                                                        <IconButton color="primary" onClick={() => navigate(`/ventas/editar/${venta.id}`)}>
                                                            <EditIcon />
                                                        </IconButton>
                                                    )}
                                                    {venta.estado !== 'ANULADA' && (
                                                        <IconButton color="error" onClick={() => handleAnular(venta.id)}>
                                                            <CancelIcon />
                                                        </IconButton>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {ventas.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    No hay ventas registradas
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                component="div"
                                count={total}
                                rowsPerPage={rowsPerPage}
                                page={page}
                                onPageChange={handleChangePage}
                                onRowsPerPageChange={handleChangeRowsPerPage}
                                labelRowsPerPage="Filas por página"
                            />
                        </>
                    )}
                </CardContent>
            </Card>
        </Box>
    );
}
