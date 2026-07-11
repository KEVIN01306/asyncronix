import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Stack,
    IconButton,
    Chip,
    TablePagination,
    useMediaQuery,
    useTheme,
    Divider,
    Button
} from '@mui/material';
import { ArrowBack, ArrowDownward, ArrowUpward, AccessTime } from '@mui/icons-material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { cajaRepository, type TransaccionHistorial } from '../../infrastructure/caja.repository';

const CajaHistorialPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();

    const backPath = '/cajas';

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const page = Math.floor(offset / limit);

    const abortableFetch = useAbortableFetch();
    const [movimientos, setMovimientos] = useState<TransaccionHistorial[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchHistorial = useCallback(
        async (signal: AbortSignal) => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await cajaRepository.obtenerHistorial(id, limit, offset, signal);
                setMovimientos(response.data || []);
                setTotal(response.meta?.total || 0);
            } catch (error) {
                if (isAbortError(error)) return;
                toast.error('Error al cargar el historial');
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [id, limit, offset]
    );

    useEffect(() => {
        abortableFetch(fetchHistorial);
    }, [abortableFetch, fetchHistorial]);

    const handlePageChange = (event: unknown, newPage: number) => {
        searchParams.set('offset', (newPage * limit).toString());
        setSearchParams(searchParams);
    };

    const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newLimit = parseInt(event.target.value, 10);
        searchParams.set('limit', newLimit.toString());
        searchParams.set('offset', '0');
        setSearchParams(searchParams);
    };

    const renderItem = (row: TransaccionHistorial) => {
        const isIngreso = row.destino_caja_id === id;

        return (
            <Paper
                key={row.id}
                elevation={0}
                sx={{
                    p: 2,
                    mb: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    '&:hover': {
                        borderColor: isIngreso ? 'success.main' : 'error.main',
                        boxShadow: `0 4px 12px ${isIngreso ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)'}`
                    }
                }}
            >
                <Stack direction={isMobile ? "column" : "row"} justifyContent="space-between" alignItems={isMobile ? "flex-start" : "center"} spacing={2}>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                            sx={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isIngreso ? 'success.light' : 'error.light',
                                color: isIngreso ? 'success.dark' : 'error.dark'
                            }}
                        >
                            {isIngreso ? <ArrowDownward /> : <ArrowUpward />}
                        </Box>
                        <Box>
                            <Typography variant="subtitle1" fontWeight="bold">
                                {row.origen_tipo === 'INGRESO_EGRESO' ? 'Movimiento Manual' :
                                    row.origen_tipo === 'VENTA' ? 'Venta' :
                                        row.origen_tipo === 'SERVICIO' ? 'Servicio' :
                                            row.origen_tipo.replace('_', ' ')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {row.descripcion || 'Sin descripción'}
                            </Typography>
                            <Stack direction="row" spacing={1} mt={0.5} alignItems="center">
                                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(row.fecha_transaccion).toLocaleString('es-ES')}
                                </Typography>
                                <Divider orientation="vertical" flexItem />
                                <Typography variant="caption" fontFamily="monospace" fontWeight="bold" color="text.secondary">
                                    {row.codigo}
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>

                    <Box textAlign={isMobile ? "left" : "right"} mt={isMobile ? 1 : 0} width={isMobile ? "100%" : "auto"}>
                        <Typography
                            variant="h6"
                            fontWeight="bold"
                            color={isIngreso ? 'success.main' : 'error.main'}
                        >
                            {isIngreso ? '+' : '-'}{formatMoney(row.monto_original)}
                        </Typography>
                        <Chip
                            size="small"
                            label={isIngreso ? 'Ingreso' : 'Egreso'}
                            color={isIngreso ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ mt: 0.5 }}
                        />
                    </Box>
                </Stack>
            </Paper>
        );
    };

    return (
        <Box p={isMobile ? 2 : 4} maxWidth="800px" mx="auto">
            <Stack direction="row" alignItems="center" spacing={2} mb={4}>
                <IconButton onClick={() => navigate(backPath)}>
                    <ArrowBack />
                </IconButton>
                <Box>
                    <Typography variant="h4" fontWeight="bold">
                        Historial de Transacciones
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Caja de Tesorería
                    </Typography>
                </Box>
            </Stack>

            {loading ? (
                <Loading />
            ) : movimientos.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }} elevation={0}>
                    <Typography variant="h6" color="text.secondary">No hay transacciones registradas</Typography>
                </Paper>
            ) : (
                <Box>
                    {movimientos.map(renderItem)}

                    <Paper sx={{ mt: 2 }}>
                        <TablePagination
                            component="div"
                            count={total}
                            page={page}
                            onPageChange={handlePageChange}
                            rowsPerPage={limit}
                            onRowsPerPageChange={handleRowsPerPageChange}
                            labelRowsPerPage="Filas por página"
                        />
                    </Paper>
                </Box>
            )}
        </Box>
    );
};

export default CajaHistorialPage;
