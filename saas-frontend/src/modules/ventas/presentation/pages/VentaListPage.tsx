import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, CircularProgress, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip } from '@mui/material';
import { Add, Edit, Visibility, Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Venta } from '../../domain/interfaces/venta.interface';
import { ventaRepository } from '../../infrastructure/venta.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import { toast } from 'sonner';
import { formatMoney } from '../../../../core/utils/formatMoney';

const VentasListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [ventas, setVentas] = useState<Venta[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const user = useAuthStore(state => state.user);

    const columns = [
        { id: 'created_at', name: 'Fecha', format: (value: any) => new Date(value).toLocaleString() },
        { id: 'cliente_nombre', name: 'Cliente', format: (value: any) => value ? value : 'C/F' },
        { id: 'total', name: 'Total', format: (value: any) => formatMoney(value) },
        { id: 'metodo_pago', name: 'Método' },
        { id: 'estado', name: 'Estado', format: (value: any) => <Chip label={value} color={value === 'COMPLETADA' ? 'secondary' : value === 'PENDIENTE' ? 'warning' : 'error'} size="small" /> },
    ];

    const fetchVentas = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ventaRepository.listar(limit, offset);
            setVentas(response.data);
            setTotal(response.meta?.total ??  0);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar las ventas');
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchVentas();
    }, [fetchVentas]);

    const handleAnular = async (row: Venta) => {
        if (!user?.sucursal_id) {
            toast.error('No se pudo determinar la sucursal del usuario');
            return;
        }
        if (!window.confirm('¿Está seguro de que desea anular esta venta? Esta acción devolverá el stock.')) return;
        try {
            await ventaRepository.anular(row.id, user.sucursal_id);
            toast.success('Venta anulada exitosamente');
            fetchVentas();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al anular la venta');
        }
    };

    const actions = [
        { name: 'Ver', icon: <Visibility fontSize="small" />, color: 'gray', onClick: (row: any) => navigate(`/ventas/${row.id}`) },
        { name: 'Editar', icon: <Edit fontSize="small" />, color: 'blue', onClick: (row: any) => navigate(`/ventas/editar/${row.id}`), visible: (row: any) => row.estado === 'PENDIENTE' },
        { name: 'Anular', icon: <Add fontSize="small" />, color: 'red', onClick: (row: any) => handleAnular(row), visible: (row: any) => row.estado !== 'ANULADA' },
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                En este módulo puedes administrar tus Ventas: ver detalles, crear nuevas ventas, editarlas o anularlas.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
            >
                <TextField fullWidth label="Buscar Venta" placeholder="Ej: Cliente o fecha" InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="primary" /></InputAdornment>) }} />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/ventas/nuevo')}>
                    Nueva Venta
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <ListTable
                        data={ventas}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                setSearchParams({ limit: limit.toString(), offset: newOffset.toString() });
                            },
                            onRowsPerPageChange: (newLimit) => {
                                setSearchParams({ limit: newLimit.toString(), offset: '0' });
                            }
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default VentasListPage;
