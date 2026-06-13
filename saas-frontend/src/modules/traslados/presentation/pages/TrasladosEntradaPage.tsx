import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    TableContainer,
    CircularProgress,
    useTheme,
    useMediaQuery,
    TextField,
    InputAdornment,
    Alert,
    AlertTitle,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Select,
    MenuItem,
} from '@mui/material';
import { Visibility, Download, Search, FilterList } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { useAuthStore } from '../../../../core/store/authStore';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { trasladoRepository } from '../../infrastructure/traslado.repository';
import type { TrasladoDetalle, EstadoTraslado } from '../../domain/interfaces/traslado.interface';

const ESTADO_COLORS: Record<EstadoTraslado, 'default' | 'warning' | 'success' | 'error'> = {
    PENDIENTE: 'warning',
    COMPLETADO: 'success',
    CANCELADO: 'error',
};

export const TrasladosEntradaPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = useAuthStore((state) => state.user);
    const [traslados, setTraslados] = useState<TrasladoDetalle[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedTraslado, setSelectedTraslado] = useState<TrasladoDetalle | null>(null);
    const [openReceiveDialog, setOpenReceiveDialog] = useState(false);
    const [receiveLoading, setReceiveLoading] = useState(false);
    const [filtroQ, setFiltroQ] = useState<string | null>(() => searchParams.get('q'));
    const debouncedFiltroQ = useDebounce(filtroQ, 300);
    const abortableFetch = useAbortableFetch();
    const [comentarioRecibir, setComentarioRecibir] = useState('');
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [filtroEstado, setFiltroEstado] = useState<string | null>(() => searchParams.get('estado'));
    const [filtroCreador, setFiltroCreador] = useState<string | null>(() => searchParams.get('creador'));
    const [filtroRecibidor, setFiltroRecibidor] = useState<string | null>(() => searchParams.get('recibidor'));
    const [fechaInicio, setFechaInicio] = useState<string | null>(() => searchParams.get('fecha_inicio'));
    const [fechaFin, setFechaFin] = useState<string | null>(() => searchParams.get('fecha_fin'));
    const [fechaRecibidoInicio, setFechaRecibidoInicio] = useState<string | null>(() => searchParams.get('fecha_recibido_inicio'));
    const [fechaRecibidoFin, setFechaRecibidoFin] = useState<string | null>(() => searchParams.get('fecha_recibido_fin'));
    const [tempFiltroEstado, setTempFiltroEstado] = useState(filtroEstado);
    const [tempFiltroCreador, setTempFiltroCreador] = useState(filtroCreador);
    const [tempFiltroRecibidor, setTempFiltroRecibidor] = useState(filtroRecibidor);
    const [tempFechaInicio, setTempFechaInicio] = useState(fechaInicio);
    const [tempFechaFin, setTempFechaFin] = useState(fechaFin);
    const [tempFechaRecibidoInicio, setTempFechaRecibidoInicio] = useState(fechaRecibidoInicio);
    const [tempFechaRecibidoFin, setTempFechaRecibidoFin] = useState(fechaRecibidoFin);

    const columns = [
        { 
            id: 'consecutivo', 
            name: 'Guía', 
            format: (value: any) => `#${value}` 
        },
        { 
            id: 'origen', 
            name: 'Origen', 
            format: (value: any) => value?.nombre || '-' 
        },
        { 
            id: 'creador', 
            name: 'Creador', 
            format: (value: any) => value?.nombre || '-' 
        },
        { 
            id: 'estado', 
            name: 'Estado', 
            format: (value: EstadoTraslado) => (
                <Chip 
                    variant='outlined'
                    label={value} 
                    color={ESTADO_COLORS[value]} 
                    size="small" 
                />
            ) 
        },
        { 
            id: 'created_at', 
            name: 'Fecha', 
            format: (value: any) => new Date(value).toLocaleDateString() 
        },
    ];

    const fetchTraslados = useCallback(async (signal: AbortSignal) => {
        if (!user?.sucursal_id) return;
        setLoading(true);
        try {
            const q = debouncedFiltroQ || null;
            const estado = filtroEstado || null;
            const creador = filtroCreador || null;
            const recibidor = filtroRecibidor || null;
            const fi = fechaInicio || null;
            const ff = fechaFin || null;
            const fri = fechaRecibidoInicio || null;
            const frf = fechaRecibidoFin || null;
            const response = await trasladoRepository.listarPorDestino(user.sucursal_id, limit, offset, {
                q,
                estado,
                creador,
                recibidor,
                fecha_inicio: fi,
                fecha_fin: ff,
                fecha_recibido_inicio: fri,
                fecha_recibido_fin: frf,
            }, signal);
            setTraslados(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error('Error al cargar traslados de entrada:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.sucursal_id, limit, offset, debouncedFiltroQ, filtroEstado, filtroCreador, filtroRecibidor, fechaInicio, fechaFin, fechaRecibidoInicio, fechaRecibidoFin]);

    useEffect(() => {
        abortableFetch(fetchTraslados);
    }, [abortableFetch, fetchTraslados]);

    const handleRecibir = async () => {
        if (!selectedTraslado) return;
        if (!comentarioRecibir.trim()) return;
        setReceiveLoading(true);
        try {
            await trasladoRepository.recibir(selectedTraslado.id, comentarioRecibir.trim());
            setOpenReceiveDialog(false);
            setSelectedTraslado(null);
            setComentarioRecibir('');
            await abortableFetch(fetchTraslados);
        } catch (error) {
            console.error('Error al recibir traslado:', error);
        } finally {
            setReceiveLoading(false);
        }
    };

    const applyFiltersToSearchParams = (overrides: { q?: string | null; estado?: string | null; creador?: string | null; recibidor?: string | null; fecha_inicio?: string | null; fecha_fin?: string | null; fecha_recibido_inicio?: string | null; fecha_recibido_fin?: string | null } = {}) => {
        const params: any = { limit: limit.toString(), offset: '0' };
        const q = overrides.q !== undefined ? overrides.q : filtroQ;
        const estado = overrides.estado !== undefined ? overrides.estado : filtroEstado;
        const creador = overrides.creador !== undefined ? overrides.creador : filtroCreador;
        const recibidor = overrides.recibidor !== undefined ? overrides.recibidor : filtroRecibidor;
        const fi = overrides.fecha_inicio !== undefined ? overrides.fecha_inicio : fechaInicio;
        const ff = overrides.fecha_fin !== undefined ? overrides.fecha_fin : fechaFin;
        const fri = overrides.fecha_recibido_inicio !== undefined ? overrides.fecha_recibido_inicio : fechaRecibidoInicio;
        const frf = overrides.fecha_recibido_fin !== undefined ? overrides.fecha_recibido_fin : fechaRecibidoFin;
        if (q) params.q = q;
        if (estado) params.estado = estado;
        if (creador) params.creador = creador;
        if (recibidor) params.recibidor = recibidor;
        if (fi) params.fecha_inicio = fi;
        if (ff) params.fecha_fin = ff;
        if (fri) params.fecha_recibido_inicio = fri;
        if (frf) params.fecha_recibido_fin = frf;
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setTempFiltroEstado(null);
        setTempFiltroCreador(null);
        setTempFiltroRecibidor(null);
        setTempFechaInicio(null);
        setTempFechaFin(null);
        setTempFechaRecibidoInicio(null);
        setTempFechaRecibidoFin(null);
        setFiltroEstado(null);
        setFiltroCreador(null);
        setFiltroRecibidor(null);
        setFechaInicio(null);
        setFechaFin(null);
        setFechaRecibidoInicio(null);
        setFechaRecibidoFin(null);
        applyFiltersToSearchParams({ estado: null, creador: null, recibidor: null, fecha_inicio: null, fecha_fin: null, fecha_recibido_inicio: null, fecha_recibido_fin: null });
    };

    const handleApplyFilters = () => {
        setFiltroEstado(tempFiltroEstado);
        setFiltroCreador(tempFiltroCreador);
        setFiltroRecibidor(tempFiltroRecibidor);
        setFechaInicio(tempFechaInicio);
        setFechaFin(tempFechaFin);
        setFechaRecibidoInicio(tempFechaRecibidoInicio);
        setFechaRecibidoFin(tempFechaRecibidoFin);
        applyFiltersToSearchParams({ estado: tempFiltroEstado, creador: tempFiltroCreador, recibidor: tempFiltroRecibidor, fecha_inicio: tempFechaInicio, fecha_fin: tempFechaFin, fecha_recibido_inicio: tempFechaRecibidoInicio, fecha_recibido_fin: tempFechaRecibidoFin });
        setFilterModalOpen(false);
    };

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/traslados/${row.id}`),
        },
        {
            name: 'Recibir',
            icon: <Download fontSize="small" />,
            color: 'green',
            onClick: (row: any) => {
                if (row.estado === 'PENDIENTE') {
                    setSelectedTraslado(row);
                    setOpenReceiveDialog(true);
                }
            },
            visible: (row: any) => row.estado == 'PENDIENTE',
        },
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                En este módulo puedes administrar tus traslados de entrada. Visualiza los traslados recibidos en esta sucursal, consulta detalles y completa el recibimiento de traslados pendientes.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    <TextField
                        fullWidth
                        value={filtroQ ?? ''}
                        onChange={(e) => {
                            const v = e.target.value || null;
                            setFiltroQ(v);
                            applyFiltersToSearchParams({ q: v });
                        }}
                        label="Buscar Traslado"
                        placeholder="Ej: Guía #1, Origen"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setFilterModalOpen(true)}
                    >
                        Más filtros
                    </Button>
                </Stack>
                <Box sx={{ minWidth: isMobile ? 'auto' : '200px' }} />
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <>
                        <ListTable
                            data={traslados}
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
                                },
                            }}
                        />
                    </>
                )}
            </TableContainer>

            <Dialog open={openReceiveDialog} onClose={() => setOpenReceiveDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Recibir Traslado</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        ¿Está seguro de que desea recibir el traslado #{selectedTraslado?.consecutivo}? Los lotes se agregarán al inventario de esta sucursal.
                    </Box>
                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        label="Comentario"
                        value={comentarioRecibir}
                        onChange={(e) => setComentarioRecibir(e.target.value)}
                        sx={{ mt: 2 }}
                        disabled={receiveLoading}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReceiveDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={handleRecibir}
                        color="success"
                        variant="outlined"
                        disabled={receiveLoading || comentarioRecibir.trim().length === 0}
                    >
                        {receiveLoading ? <CircularProgress size={24} /> : 'Sí, Recibir'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Select value={tempFiltroEstado ?? ''} displayEmpty onChange={(e) => {
                            const v = e.target.value || null;
                            setTempFiltroEstado(v);
                        }}>
                            <MenuItem value="">Todos los estados</MenuItem>
                            <MenuItem value="PENDIENTE">Pendiente</MenuItem>
                            <MenuItem value="COMPLETADO">Completado</MenuItem>
                            <MenuItem value="CANCELADO">Cancelado</MenuItem>
                        </Select>

                        <TextField 
                            label="Creador" 
                            value={tempFiltroCreador ?? ''} 
                            onChange={(e) => {
                                const v = e.target.value || null;
                                setTempFiltroCreador(v);
                            }} 
                            placeholder="Nombre del creador" 
                        />

                        <TextField 
                            label="Recibidor" 
                            value={tempFiltroRecibidor ?? ''} 
                            onChange={(e) => {
                                const v = e.target.value || null;
                                setTempFiltroRecibidor(v);
                            }} 
                            placeholder="Nombre del recibidor" 
                        />

                        <Box>
                            <Box sx={{ fontWeight: 600, mb: 1 }}>Fecha de Envío</Box>
                            <Stack direction="row" spacing={1}>
                                <TextField type="date" label="Desde" InputLabelProps={{ shrink: true }} value={tempFechaInicio ?? ''} onChange={(e) => {
                                    const v = e.target.value || null;
                                    setTempFechaInicio(v);
                                }} sx={{ flex: 1 }} />
                                <TextField type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={tempFechaFin ?? ''} onChange={(e) => {
                                    const v = e.target.value || null;
                                    setTempFechaFin(v);
                                }} sx={{ flex: 1 }} />
                            </Stack>
                        </Box>

                        <Box>
                            <Box sx={{ fontWeight: 600, mb: 1 }}>Fecha de Recepción</Box>
                            <Stack direction="row" spacing={1}>
                                <TextField type="date" label="Desde" InputLabelProps={{ shrink: true }} value={tempFechaRecibidoInicio ?? ''} onChange={(e) => {
                                    const v = e.target.value || null;
                                    setTempFechaRecibidoInicio(v);
                                }} sx={{ flex: 1 }} />
                                <TextField type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={tempFechaRecibidoFin ?? ''} onChange={(e) => {
                                    const v = e.target.value || null;
                                    setTempFechaRecibidoFin(v);
                                }} sx={{ flex: 1 }} />
                            </Stack>
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleClearFilters} variant="outlined">Limpiar</Button>
                    <Button onClick={handleApplyFilters} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TrasladosEntradaPage;
