import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Add, FilterList, Search, Visibility } from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    InputAdornment,
    MenuItem,
    Paper,
    Stack,
    TableContainer,
    TextField,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { toast } from 'sonner';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import ingresoEgresoRepository from '../../infrastructure/ingresoEgreso.repository';
import type { IngresoEgreso } from '../../domain/interfaces/ingresoEgreso.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

type TipoMovimientoFilter = '' | 'INGRESO' | 'EGRESO';
type EntidadTipoFilter = '' | 'CAJA' | 'CUENTA';

const IngresoEgresoListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const [tipoMovimiento, setTipoMovimiento] = useState<TipoMovimientoFilter>(
        (searchParams.get('tipo_movimiento') as TipoMovimientoFilter) || ''
    );
    const [entidadTipo, setEntidadTipo] = useState<EntidadTipoFilter>(
        (searchParams.get('entidad_tipo') as EntidadTipoFilter) || ''
    );
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const abortableFetch = useAbortableFetch();
    const [movimientos, setMovimientos] = useState<IngresoEgreso[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [filtersOpen, setFiltersOpen] = useState(false);
    const [modalTipoMovimiento, setModalTipoMovimiento] = useState<TipoMovimientoFilter>('');
    const [modalEntidadTipo, setModalEntidadTipo] = useState<EntidadTipoFilter>('');

    const columns = useMemo(
        () => [
            {
                id: 'codigo',
                name: 'Código',
                format: (value: string) => (
                    <Typography variant="caption" fontFamily="monospace" fontWeight={700} color="text.secondary">
                        {value}
                    </Typography>
                ),
            },
            {
                id: 'fechas',
                name: 'Fecha',
                format: (_value: IngresoEgreso['fechas']) =>
                    new Date(_value?.transaccion).toLocaleDateString('es-ES'),
            },
            {
                id: 'tipo',
                name: 'Tipo',
                format: (value: string) =>
                    value === 'INGRESO' ? (
                        <Chip label="Ingreso" color="success" size="small" variant='outlined' sx={{ fontWeight: 600 }} />
                    ) : (
                        <Chip label="Egreso" color="error" size="small" variant='outlined' sx={{ fontWeight: 600 }} />
                    ),
            },
            {
                id: 'categoria',
                name: 'Categoría',
                format: (value: IngresoEgreso['categoria']) => value?.nombre ?? '—',
            },
            {
                id: 'entidad',
                name: 'Entidad',
                format: (value: IngresoEgreso['entidad']) => value?.nombre ?? '—',
            },
            {
                id: 'moneda',
                name: 'Moneda',
                format: (value: IngresoEgreso['moneda']) => value?.codigo ?? '—',
            },
            {
                id: 'monto',
                name: 'Monto',
                format: (value: IngresoEgreso['monto'], row: IngresoEgreso) =>
                    formatMoney(value?.original, row.moneda?.codigo),
            },
            {
                id: 'usuario',
                name: 'Usuario',
                format: (value: IngresoEgreso['usuario']) =>
                    value?.apellido ? `${value.nombre} ${value.apellido}` : value?.nombre ?? '—',
            },
        ],
        []
    );

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'info',
            onClick: (row: IngresoEgreso) => navigate(`/ingresos-egresos/${row.id}`),
        },
    ];

    const updateSearchParams = (override: {
        limit?: string;
        offset?: string;
        q?: string;
        tipo_movimiento?: string;
        entidad_tipo?: string;
    }) => {
        const params: Record<string, string> = {
            limit: override.limit ?? limit.toString(),
            offset: override.offset ?? offset.toString(),
        };

        const q = override.q ?? searchQuery;
        const tipo = override.tipo_movimiento ?? tipoMovimiento;
        const entidad = override.entidad_tipo ?? entidadTipo;

        if (q.trim()) params.q = q;
        if (tipo) params.tipo_movimiento = tipo;
        if (entidad) params.entidad_tipo = entidad;

        setSearchParams(params);
    };

    const fetchMovimientos = useCallback(
        async (signal: AbortSignal) => {
            setLoading(true);
            try {
                const response = await ingresoEgresoRepository.listar(
                    {
                        limit,
                        offset,
                        q: debouncedSearchQuery || undefined,
                        tipo_movimiento: tipoMovimiento || undefined,
                        entidad_tipo: entidadTipo || undefined,
                    },
                    signal
                );

                setMovimientos(response.data || []);
                setTotal(response.meta.total);
            } catch (error) {
                if (isAbortError(error)) return;
                toast.error('No se pudieron cargar los movimientos');
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [debouncedSearchQuery, entidadTipo, limit, offset, tipoMovimiento]
    );

    useEffect(() => {
        const q = searchParams.get('q') || '';
        const tipo = (searchParams.get('tipo_movimiento') as TipoMovimientoFilter) || '';
        const entidad = (searchParams.get('entidad_tipo') as EntidadTipoFilter) || '';

        // Sync local state from URL params only when params change.
        // Do NOT include local state in deps to avoid overwriting user selections while interacting with the UI.
        setSearchQuery(q);
        setTipoMovimiento(tipo);
        setEntidadTipo(entidad);
    }, [searchParams]);

    useEffect(() => {
        abortableFetch(fetchMovimientos);
    }, [abortableFetch, fetchMovimientos]);

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        updateSearchParams({ offset: '0', q: value });
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Ingresos y Egresos</AlertTitle>
                Registra y revisa los ingresos y egresos de tu negocio.
            </Alert>

            <Paper sx={{ bgcolor: 'background.paper', p: 2, mb: 2 }}>
                <Stack direction={isMobile ? 'column' : 'row'} spacing={2} alignItems="center">
                    <TextField
                        fullWidth
                        label="Buscar movimientos"
                        placeholder="Ej: nómina, caja, cuenta"
                        value={searchQuery}
                        onChange={(event) => handleSearchChange(event.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <Search color="primary" />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Stack direction={isMobile ? 'column' : 'row'} spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setModalTipoMovimiento(tipoMovimiento);
                                setModalEntidadTipo(entidadTipo);
                                setFiltersOpen(true);
                            }}
                            startIcon={<FilterList />}
                        >
                            Más filtros
                        </Button>
                        <Button variant="contained" startIcon={<Add />} onClick={() => navigate('/ingresos-egresos/nuevo')}>
                            Nuevo movimiento
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={movimientos}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => updateSearchParams({ offset: (newPage * limit).toString() }),
                            onRowsPerPageChange: (newLimit) => updateSearchParams({ limit: newLimit.toString(), offset: '0' }),
                        }}
                    />
                )}
            </TableContainer>

            <Dialog open={filtersOpen} onClose={() => setFiltersOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Más filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            select
                            fullWidth
                            label="Tipo de movimiento"
                            value={modalTipoMovimiento}
                            onChange={(event) => setModalTipoMovimiento(event.target.value as TipoMovimientoFilter)}
                        >
                            <MenuItem value="">Todos</MenuItem>
                            <MenuItem value="INGRESO">Ingreso</MenuItem>
                            <MenuItem value="EGRESO">Egreso</MenuItem>
                        </TextField>

                        <TextField
                            select
                            fullWidth
                            label="Entidad"
                            value={modalEntidadTipo}
                            onChange={(event) => setModalEntidadTipo(event.target.value as EntidadTipoFilter)}
                        >
                            <MenuItem value="">Todas</MenuItem>
                            <MenuItem value="CAJA">Caja</MenuItem>
                            <MenuItem value="CUENTA">Cuenta</MenuItem>
                        </TextField>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        // clear modal selections only
                        setModalTipoMovimiento('');
                        setModalEntidadTipo('');
                    }}>Limpiar</Button>
                    <Button variant="contained" onClick={() => {
                        // apply modal selections to global filters and trigger fetch
                        updateSearchParams({ offset: '0', q: searchQuery, tipo_movimiento: modalTipoMovimiento, entidad_tipo: modalEntidadTipo });
                        setFiltersOpen(false);
                    }}>
                        Aplicar
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default IngresoEgresoListPage;
