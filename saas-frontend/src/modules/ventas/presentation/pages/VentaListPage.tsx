import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Select, MenuItem, Stack, Checkbox, FormControlLabel } from '@mui/material';
import { Add, Visibility, Search, FilterList } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { PreVenta, Venta } from '../../domain/interfaces/venta.interface';
import { ventaRepository } from '../../infrastructure/venta.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { toast } from 'sonner';
import { formatMoney } from '../../../../core/utils/formatMoney';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const VentasListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [ventas, setVentas] = useState<Venta[]>([]);
    const [preventasPendientes, setPreventasPendientes] = useState<PreVenta[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [showAnularModal, setShowAnularModal] = useState(false);
    const [ventaToAnular, setVentaToAnular] = useState<Venta | null>(null);
    const [comentarioAnular, setComentarioAnular] = useState('');
    const [anularSaving, setAnularSaving] = useState(false);
    const [showFinalizePreVentaModal, setShowFinalizePreVentaModal] = useState(false);
    const [preventaToFinalize, setPreventaToFinalize] = useState<PreVenta | null>(null);
    const [overrideStock, setOverrideStock] = useState(false);
    const [pinCaja, setPinCaja] = useState('');
    const [showFaltantesModal, setShowFaltantesModal] = useState(false);
    const [faltantesList, setFaltantesList] = useState<any[]>([]);

    // filters
    const [filtroQ, setFiltroQ] = useState<string | null>(() => searchParams.get('q'));
    const debouncedFiltroQ = useDebounce(filtroQ, 300);
    const abortableFetch = useAbortableFetch();
    const [filtroMetodo, setFiltroMetodo] = useState<string | null>(() => searchParams.get('metodo_pago'));
    const [fechaInicio, setFechaInicio] = useState<string | null>(() => searchParams.get('fecha_inicio'));
    const [fechaFin, setFechaFin] = useState<string | null>(() => searchParams.get('fecha_fin'));
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [tempFiltroMetodo, setTempFiltroMetodo] = useState(filtroMetodo);
    const [tempFechaInicio, setTempFechaInicio] = useState(fechaInicio);
    const [tempFechaFin, setTempFechaFin] = useState(fechaFin);

    const user = useAuthStore(state => state.user);

    const columns = [
        { id: 'created_at', name: 'Fecha', format: (value: any) => new Date(value).toLocaleString() },
        { id: 'cliente_nombre', name: 'Cliente', format: (value: any) => value ? value : 'C/F' },
        { id: 'total', name: 'Total', format: (value: any) => formatMoney(value) },
        { id: 'metodo_pago', name: 'Método' },
        { id: 'estado', name: 'Estado', format: (value: any) => <Chip variant='outlined' label={value} color={value === 'COMPLETADA' ? 'success' : value === 'PENDIENTE' ? 'warning' : 'error'} size="small" /> },
    ];

    const fetchVentas = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const q = debouncedFiltroQ || null;
            const metodo = filtroMetodo || null;
            const fi = fechaInicio || null;
            const ff = fechaFin || null;
            const cliente_id = undefined;
            const response = await ventaRepository.listar(limit, offset, cliente_id, metodo, q, fi, ff, signal);
            setVentas(response.data);
            setTotal(response.meta?.total ?? 0);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error(error);
            toast.error('Error al cargar las ventas');
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedFiltroQ, filtroMetodo, fechaInicio, fechaFin]);

    const cargarPreventasPendientes = useCallback(async () => {
        try {
            const response = await ventaRepository.listarPreVentas();
            setPreventasPendientes(response.data ?? []);
        } catch (error) {
            console.error(error);
            toast.error('Error al cargar preventas pendientes');
        }
    }, []);

    useEffect(() => {
        abortableFetch(fetchVentas);
        cargarPreventasPendientes();
    }, [abortableFetch, fetchVentas, cargarPreventasPendientes]);

    const handleAnular = (row: Venta) => {
        setVentaToAnular(row);
        setComentarioAnular('');
        setShowAnularModal(true);
    };

    const applyFiltersToSearchParams = (overrides: { q?: string | null; metodo_pago?: string | null; fecha_inicio?: string | null; fecha_fin?: string | null } = {}) => {
        const params: any = { limit: limit.toString(), offset: '0' };
        const q = overrides.q !== undefined ? overrides.q : filtroQ;
        const metodo = overrides.metodo_pago !== undefined ? overrides.metodo_pago : filtroMetodo;
        const fi = overrides.fecha_inicio !== undefined ? overrides.fecha_inicio : fechaInicio;
        const ff = overrides.fecha_fin !== undefined ? overrides.fecha_fin : fechaFin;
        if (q) params.q = q;
        if (metodo) params.metodo_pago = metodo;
        if (fi) params.fecha_inicio = fi;
        if (ff) params.fecha_fin = ff;
        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setTempFiltroMetodo(null);
        setTempFechaInicio(null);
        setTempFechaFin(null);
        setFiltroMetodo(null);
        setFechaInicio(null);
        setFechaFin(null);
        applyFiltersToSearchParams({ metodo_pago: null, fecha_inicio: null, fecha_fin: null });
    };

    const handleApplyFilters = () => {
        setFiltroMetodo(tempFiltroMetodo);
        setFechaInicio(tempFechaInicio);
        setFechaFin(tempFechaFin);
        applyFiltersToSearchParams({ metodo_pago: tempFiltroMetodo, fecha_inicio: tempFechaInicio, fecha_fin: tempFechaFin });
        setFilterModalOpen(false);
    };

    const handleContinuarPreVenta = (id: string) => {
        navigate(`/ventas/nuevo?preventa_id=${id}`);
    };

    const confirmFinalizePreVenta = async () => {
        if (!preventaToFinalize) return;
        try {
            const result = await ventaRepository.finalizarPreVenta(preventaToFinalize.id, {
                metodo_pago: 'EFECTIVO',
                override_stock: overrideStock,
                pin_caja: overrideStock ? pinCaja : undefined
            });

            if (result?.faltantes) {
                // Mostrar lista de faltantes y ofrecer forzar
                setFaltantesList(result.faltantes);
                setShowFaltantesModal(true);
                return;
            }

            toast.success('Preventa finalizada');
            setShowFinalizePreVentaModal(false);
            setPreventaToFinalize(null);
            setOverrideStock(false);
            setPinCaja('');
            await cargarPreventasPendientes();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al finalizar la preventa');
        }
    };

    const confirmAnular = async () => {
        if (!ventaToAnular) return;
        if (!user?.sucursal_id) {
            toast.error('No se pudo determinar la sucursal del usuario');
            return;
        }
        if (!comentarioAnular.trim()) {
            toast.error('El comentario es obligatorio');
            return;
        }

        try {
            setAnularSaving(true);
            await ventaRepository.anular(ventaToAnular.id, user.sucursal_id, comentarioAnular.trim());
            toast.success('Venta anulada exitosamente');
            setShowAnularModal(false);
            setVentaToAnular(null);
            setComentarioAnular('');
            await abortableFetch(fetchVentas);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al anular la venta');
        } finally {
            setAnularSaving(false);
        }
    };

    const actions = [
        { name: 'Ver', icon: <Visibility fontSize="small" />, color: 'gray', onClick: (row: any) => navigate(`/ventas/${row.id}`) },
        { name: 'Continuar', icon: <Visibility fontSize="small" />, color: 'primary', onClick: (row: any) => navigate(`/ventas/editar/${row.id}`), visible: (row: any) => row.estado === 'PENDIENTE' },
        { name: 'Anular', icon: <Add fontSize="small" />, color: 'red', onClick: (row: any) => handleAnular(row), visible: (row: any) => row.estado !== 'ANULADA' },
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                En este módulo puedes administrar tus Ventas: ver detalles, crear nuevas ventas, editarlas o anularlas.
            </Alert>

            {preventasPendientes.length > 0 && (
                <Box component={Paper} sx={{ p: 2, mb: 3, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" gutterBottom>Preventas pendientes</Typography>
                    <Stack spacing={1.5}>
                        {preventasPendientes.map((preventa) => (
                            <Box key={preventa.id} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                <Box>
                                    <Typography fontWeight={600}>Preventa #{preventa.id.slice(0, 8)}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {preventa.detalles.length} productos • {new Date(preventa.created_at).toLocaleString()}
                                    </Typography>
                                </Box>
                                <Stack direction={isMobile ? 'column' : 'row'} spacing={1}>
                                    <Button size="small" variant="contained" onClick={() => handleContinuarPreVenta(preventa.id)}>Continuar</Button>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
            >
                <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ flex: 1, width: isMobile ? '100%' : 'auto' }}>
                    {/* Agregamos sx={{ flex: 1 }} aquí */}
                    <TextField 
                        value={filtroQ ?? ''} 
                        onChange={(e) => {
                            const v = e.target.value || null;
                            setFiltroQ(v);
                            applyFiltersToSearchParams({ q: v });
                        }} 
                        label="Buscar" 
                        placeholder="Ej: Cliente, producto o id" 
                        InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="primary" /></InputAdornment>) }} 
                        sx={{ flex: 1 }} 
                    />
                    <Button
                        variant="outlined"
                        startIcon={<FilterList />}
                        onClick={() => setFilterModalOpen(true)}
                    >
                        Más filtros
                    </Button>
                </Stack>
                <Button variant="contained" sx={{ minWidth: 160, width: isMobile ? '100%' : 'auto' }} startIcon={<Add />} onClick={() => navigate('/ventas/nuevo')}>
                    Nueva Venta
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Loading/>                
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
            <Dialog open={showAnularModal} onClose={() => setShowAnularModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Anular Venta</DialogTitle>
                <DialogContent>
                    <Typography mb={2}>Indica el motivo por el cual anulas esta venta. Esta información es obligatoria.</Typography>
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        label="Comentario"
                        value={comentarioAnular}
                        onChange={(e) => setComentarioAnular(e.target.value)}
                        disabled={anularSaving}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowAnularModal(false)} disabled={anularSaving}>Cancelar</Button>
                    <Button onClick={confirmAnular} variant="contained" color="error" disabled={anularSaving || comentarioAnular.trim().length === 0}>
                        {anularSaving ? 'Anulando...' : 'Confirmar anulación'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={showFinalizePreVentaModal} onClose={() => setShowFinalizePreVentaModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Finalizar preventa</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Typography variant="body2" color="text.secondary">
                            ¿Deseas finalizar esta preventa y convertirla en venta?
                        </Typography>
                        <FormControlLabel
                            control={<Checkbox checked={overrideStock} onChange={(_, checked) => setOverrideStock(checked)} />}
                            label="Forzar finalización aunque haya stock insuficiente"
                        />
                        {overrideStock && (
                            <TextField
                                fullWidth
                                label="PIN de caja"
                                type="password"
                                inputMode="numeric"
                                value={pinCaja}
                                onChange={(e) => setPinCaja(e.target.value)}
                            />
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFinalizePreVentaModal(false)}>Cancelar</Button>
                    <Button onClick={confirmFinalizePreVenta} variant="contained">Confirmar</Button>
                </DialogActions>
            </Dialog>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <Select value={tempFiltroMetodo ?? ''} displayEmpty onChange={(e) => {
                            const v = e.target.value || null;
                            setTempFiltroMetodo(v);
                        }}>
                            <MenuItem value="">Todos los métodos</MenuItem>
                            <MenuItem value="EFECTIVO">Efectivo</MenuItem>
                            <MenuItem value="TARJETA">Tarjeta</MenuItem>
                            <MenuItem value="TRANSFERENCIA">Transferencia</MenuItem>
                            <MenuItem value="OTRO">Otro</MenuItem>
                        </Select>

                        <TextField type="date" label="Desde" InputLabelProps={{ shrink: true }} value={tempFechaInicio ?? ''} onChange={(e) => {
                            const v = e.target.value || null;
                            setTempFechaInicio(v);
                        }} />
                        <TextField type="date" label="Hasta" InputLabelProps={{ shrink: true }} value={tempFechaFin ?? ''} onChange={(e) => {
                            const v = e.target.value || null;
                            setTempFechaFin(v);
                        }} />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleClearFilters} variant="outlined">Limpiar</Button>
                    <Button onClick={handleApplyFilters} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>
            <Dialog open={showFaltantesModal} onClose={() => setShowFaltantesModal(false)} fullWidth maxWidth="sm">
                <DialogTitle>Faltantes de stock</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="text.secondary">Las siguientes variantes no poseen stock suficiente:</Typography>
                    <Stack spacing={1} mt={2}>
                        {faltantesList.map((f, idx) => (
                            <Box key={idx} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Typography>{f.descripcion}</Typography>
                                <Typography color="text.secondary">Solicitado: {f.solicitado} • Disponible: {f.disponible}</Typography>
                            </Box>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setShowFaltantesModal(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        setShowFaltantesModal(false);
                        setShowFinalizePreVentaModal(true);
                        setOverrideStock(true);
                    }} variant="contained">Forzar stock</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default VentasListPage;
