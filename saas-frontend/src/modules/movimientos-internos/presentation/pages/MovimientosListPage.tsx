import { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, Alert, AlertTitle, InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Visibility, Search, FilterList } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { MovimientoInternoEntity } from '../../domain/movimientos.interface';
import { movimientosRepository } from '../../infrastructure/movimientos.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatMoney } from '../../../../core/utils/formatMoney';

const MovimientosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const [searchText, setSearchText] = useState('');
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Temp filters for modal
    const [tempEntidadTipo, setTempEntidadTipo] = useState('');
    const [tempFechaInicio, setTempFechaInicio] = useState('');
    const [tempFechaFin, setTempFechaFin] = useState('');

    const [movimientos, setMovimientos] = useState<MovimientoInternoEntity[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = useMemo(
        () => [
            { id: 'codigo', name: 'Código' },
            { id: 'fechas', name: 'Fecha', format: (_value: MovimientoInternoEntity['fechas']) => new Date(_value?.transaccion).toLocaleDateString('es-ES') },
            { id: 'origen', name: 'Origen', format: (value: MovimientoInternoEntity['origen']) => value?.nombre ?? '—' },
            { id: 'destino', name: 'Destino', format: (value: MovimientoInternoEntity['destino']) => value?.nombre ?? '—' },
            { id: 'moneda', name: 'Moneda', format: (value: MovimientoInternoEntity['moneda']) => value?.codigo ?? '—' },
            { id: 'monto', name: 'Monto', format: (value: MovimientoInternoEntity['monto'], row: MovimientoInternoEntity) => formatMoney(value?.original, row.moneda?.codigo) },
            { id: 'usuario', name: 'Usuario', format: (value: MovimientoInternoEntity['usuario']) => value?.apellido ? `${value.nombre} ${value.apellido}` : value?.nombre ?? '—' },
        ],
        []
    );

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: MovimientoInternoEntity) => navigate(`/movimientos-internos/${row.id}`),
        },
    ];

    const fetchMovimientos = useCallback(async () => {
        setLoading(true);
        try {
            const paramsObj = Object.fromEntries(searchParams.entries());
            const filters: Record<string, any> = {};
            if (paramsObj.q) filters.q = paramsObj.q;
            if (paramsObj.entidad_tipo) filters.entidad_tipo = paramsObj.entidad_tipo;
            if (paramsObj.entidad_id) filters.entidad_id = paramsObj.entidad_id;
            if (paramsObj.fecha_inicio) filters.fecha_inicio = paramsObj.fecha_inicio;
            if (paramsObj.fecha_fin) filters.fecha_fin = paramsObj.fecha_fin;

            const response = await movimientosRepository.obtenerMovimientos(limit, offset, filters);
            setMovimientos(response.data ?? []);
            setTotal(response.meta?.total ?? response.count ?? 0);
        } catch (error) {
            console.error("Error al obtener movimientos:", error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, searchParams]);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        setSearchText(q);

        // Setup AbortController for cleaning up fetch logic
        const controller = new AbortController();
        fetchMovimientos();
        return () => controller.abort();
    }, [fetchMovimientos, searchParams]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                En este módulo puedes administrar los movimientos internos de fondos entre las cajas y cuentas de la empresa.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
                elevation={0}
            >
                <TextField
                    fullWidth
                    label="Buscar movimientos"
                    placeholder="Ej: CAJA GENERAL"
                    value={searchText}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearchText(value);
                        const current = Object.fromEntries(searchParams.entries());
                        const newParams: Record<string, string> = { ...current, limit: limit.toString(), offset: '0' };
                        if (value) newParams.q = value; else delete newParams.q;
                        setSearchParams(newParams);
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box display="flex" gap={1} width={isMobile ? '100%' : 'auto'}>
                    <Button variant="outlined" startIcon={<FilterList />} onClick={() => {
                        const params = Object.fromEntries(searchParams.entries());
                        setTempEntidadTipo(params.entidad_tipo || '');
                        setTempFechaInicio(params.fecha_inicio || '');
                        setTempFechaFin(params.fecha_fin || '');
                        setFilterModalOpen(true);
                    }}>
                        Más filtros
                    </Button>
                    <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/movimientos-internos/nuevo')} sx={{ whiteSpace: 'nowrap' }}>
                        Nuevo Movimiento
                    </Button>
                </Box>
            </Box>

            <TableContainer>
                {loading && movimientos.length === 0 ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                        <Loading />
                    </Box>
                ) : (
                    <ListTable
                        data={movimientos}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                const current = Object.fromEntries(searchParams.entries());
                                const params = { ...current, limit: limit.toString(), offset: newOffset.toString() } as Record<string, string>;
                                setSearchParams(params);
                            },
                            onRowsPerPageChange: (newLimit) => {
                                const current = Object.fromEntries(searchParams.entries());
                                const params = { ...current, limit: newLimit.toString(), offset: '0' } as Record<string, string>;
                                setSearchParams(params);
                            },
                        }}
                    />
                )}
            </TableContainer>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros Avanzados</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField
                            select
                            label="Tipo de Entidad"
                            value={tempEntidadTipo}
                            onChange={(e) => setTempEntidadTipo(e.target.value)}
                            SelectProps={{ native: true }}
                        >
                            <option value=""></option>
                            <option value="CAJA">Caja General</option>
                            <option value="CUENTA">Cuenta Bancaria</option>
                        </TextField>

                        <Box display="flex" gap={2}>
                            <TextField label="Desde (Fecha)" type="date" value={tempFechaInicio} onChange={(e) => setTempFechaInicio(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                            <TextField label="Hasta (Fecha)" type="date" value={tempFechaFin} onChange={(e) => setTempFechaFin(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        setTempEntidadTipo('');
                        setTempFechaInicio('');
                        setTempFechaFin('');

                        const current = Object.fromEntries(searchParams.entries());
                        const preserved: Record<string, string> = { limit: limit.toString(), offset: '0' };
                        if (current.q) preserved.q = current.q;
                        setSearchParams(preserved);
                        setFilterModalOpen(false);
                    }}>Limpiar</Button>
                    <Button variant="contained" onClick={() => {
                        const current = Object.fromEntries(searchParams.entries());
                        const params: Record<string, string> = { limit: limit.toString(), offset: '0' };
                        if (current.q) params.q = current.q;
                        if (tempEntidadTipo) params.entidad_tipo = tempEntidadTipo;
                        if (tempFechaInicio) params.fecha_inicio = tempFechaInicio;
                        if (tempFechaFin) params.fecha_fin = tempFechaFin;
                        setSearchParams(params);
                        setFilterModalOpen(false);
                    }}>Aplicar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MovimientosListPage;
