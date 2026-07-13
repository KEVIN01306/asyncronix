import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
    Box,
    Paper,
    Typography,
    Stack,
    IconButton,
    Chip,
    useMediaQuery,
    useTheme,
    Divider,
    Grid,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    OutlinedInput,
    Checkbox,
    ListItemText,
    Button,
    InputAdornment
} from '@mui/material';
import { ArrowBack, ArrowDownward, ArrowUpward, AccessTime, ShieldOutlined, Search } from '@mui/icons-material';
import { toast } from 'sonner';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { cuentaBancariaRepository, type TransaccionHistorial } from '../../infrastructure/cuenta-bancaria.repository';
import StandalonePagination from '../../../../shared/components/ui/pagination/StandalonePagination';
import type { CuentaBancaria } from '../../domain/interfaces/cuenta-bancaria.interface';

const ORIGEN_TIPOS_OPTIONS = [
    { value: 'VENTA', label: 'Venta' },
    { value: 'SERVICIO', label: 'Servicio' },
    { value: 'INGRESO_EGRESO', label: 'Movimiento Manual' },
    { value: 'MOVIMIENTO_INTERNO', label: 'Movimiento Interno' },
];

const FECHA_PRESETS = [
    { value: '', label: 'Cualquier fecha' },
    { value: 'hoy', label: 'Hoy' },
    { value: 'ayer', label: 'Ayer' },
    { value: 'ultimos_7_dias', label: 'Últimos 7 días' },
    { value: 'este_mes', label: 'Este mes' },
    { value: 'este_anio', label: 'Este año' },
    { value: 'custom', label: 'Personalizado' },
];

const getGroupingLabel = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    const label = date.toLocaleDateString('es-ES', options);
    return label.charAt(0).toUpperCase() + label.slice(1);
};

const CuentaBancariaHistorialPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();

    const backPath = '/cuentas-bancarias';

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const page = Math.floor(offset / limit);

    // Filters
    const q = searchParams.get('q') || '';
    const tipo_movimiento = searchParams.get('tipo_movimiento') || '';
    const origen_tipos = searchParams.getAll('origen_tipos');
    const fecha_preset = searchParams.get('fecha_preset') || '';
    const fecha_inicio = searchParams.get('fecha_inicio') || '';
    const fecha_fin = searchParams.get('fecha_fin') || '';

    const abortableFetch = useAbortableFetch();
    const [movimientos, setMovimientos] = useState<TransaccionHistorial[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [cuentaBancaria, setCuentaBancaria] = useState<CuentaBancaria | null>(null);

    const updateFilters = (newFilters: Record<string, string | string[]>) => {
        const currentParams = new URLSearchParams(searchParams);
        currentParams.set('offset', '0'); // Reset page

        Object.entries(newFilters).forEach(([key, value]) => {
            currentParams.delete(key);
            if (Array.isArray(value)) {
                value.forEach(v => currentParams.append(key, v));
            } else if (value) {
                currentParams.set(key, value);
            }
        });

        setSearchParams(currentParams);
    };

    const handleDatePresetChange = (preset: string) => {
        const today = new Date();
        let inicio = '';
        let fin = '';

        if (preset === 'hoy') {
            inicio = new Date(today.setHours(0, 0, 0, 0)).toISOString();
            fin = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        } else if (preset === 'ayer') {
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            inicio = new Date(yesterday.setHours(0, 0, 0, 0)).toISOString();
            fin = new Date(yesterday.setHours(23, 59, 59, 999)).toISOString();
        } else if (preset === 'ultimos_7_dias') {
            const last7 = new Date(today);
            last7.setDate(last7.getDate() - 7);
            inicio = new Date(last7.setHours(0, 0, 0, 0)).toISOString();
            fin = new Date(today.setHours(23, 59, 59, 999)).toISOString();
        } else if (preset === 'este_mes') {
            inicio = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
            fin = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
        } else if (preset === 'este_anio') {
            inicio = new Date(today.getFullYear(), 0, 1).toISOString();
            fin = new Date(today.getFullYear(), 11, 31, 23, 59, 59, 999).toISOString();
        }

        if (preset === 'custom') {
            updateFilters({ fecha_preset: preset });
        } else {
            updateFilters({ fecha_preset: preset, fecha_inicio: inicio, fecha_fin: fin });
        }
    };

    const fetchHistorial = useCallback(
        async (signal: AbortSignal) => {
            if (!id) return;
            setLoading(true);
            try {
                const [historialRes, cuentaBancariaRes] = await Promise.all([
                    cuentaBancariaRepository.obtenerHistorial(id, limit, offset, {
                        q,
                        tipo_movimiento,
                        origen_tipos,
                        fecha_inicio,
                        fecha_fin
                    }, signal),
                    cuentaBancariaRepository.obtener(id)
                ]);

                setMovimientos(historialRes.data || []);
                setTotal(historialRes.meta?.total || 0);
                setCuentaBancaria(cuentaBancariaRes.data);
            } catch (error) {
                if (isAbortError(error)) return;
                toast.error('Error al cargar el historial');
                console.error(error);
            } finally {
                setLoading(false);
            }
        },
        [id, limit, offset, q, tipo_movimiento, origen_tipos.join(','), fecha_inicio, fecha_fin]
    );

    useEffect(() => {
        abortableFetch(fetchHistorial);
    }, [abortableFetch, fetchHistorial]);

    const renderItem = (row: TransaccionHistorial) => {
        const isIngreso = row.destino_cuenta_id === id;
        const statusColor = isIngreso ? theme.palette.success.main : theme.palette.error.main;
        const statusBg = isIngreso ? 'success.dark' : 'error.dark';

        return (
            <Box
                key={row.id}
                sx={{
                    p: 2.5,
                    mb: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    borderRadius: 2,
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    '&:hover': {
                        bgcolor: 'action.hover',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                        borderColor: isIngreso ? 'success.main' : 'error.main',
                    }
                }}
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 2.5 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 1.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    bgcolor: isIngreso ? 'success.light' : 'error.light',
                                    color: statusColor,
                                }}
                            >
                                {isIngreso ? <ArrowDownward fontSize="small" /> : <ArrowUpward fontSize="small" />}
                            </Box>
                            <Chip
                                label={isIngreso ? 'INGRESO' : 'EGRESO'}
                                size="small"
                                sx={{
                                    bgcolor: statusBg,
                                    color: '#ffffff',
                                    fontWeight: 700,
                                    fontSize: '0.65rem',
                                    letterSpacing: '0.5px',
                                    borderRadius: 1,
                                    height: 22
                                }}
                            />
                        </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6.5 }}>
                        <Box>
                            <Stack direction={isMobile ? "column" : "row"} spacing={1.5} alignItems={isMobile ? "flex-start" : "center"}>
                                <Typography variant="subtitle2" fontWeight={700} color="text.primary">
                                    {row.origen_tipo === 'INGRESO_EGRESO' ? 'MOVIMIENTO MANUAL' :
                                        row.origen_tipo === 'VENTA' ? 'OPERACIÓN DE VENTA' :
                                            row.origen_tipo === 'SERVICIO' ? 'ORDEN DE SERVICIO' :
                                                row.origen_tipo.replace('_', ' ').toUpperCase()}
                                </Typography>
                                <Typography
                                    variant="caption"
                                    fontFamily="monospace"
                                    sx={{
                                        color: 'text.secondary',
                                        bgcolor: 'grey.100',
                                        border: '1px solid',
                                        borderColor: 'grey.300',
                                        px: 1,
                                        py: 0.1,
                                        borderRadius: 0.5,
                                        fontWeight: 600
                                    }}
                                >
                                    ID: {row.codigo}
                                </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontWeight: 500 }}>
                                {row.descripcion || 'Sin especificaciones registradas.'}
                            </Typography>

                            <Stack direction="row" spacing={1.5} mt={1} alignItems="center" color="text.disabled">
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <AccessTime sx={{ fontSize: 13 }} />
                                    <Typography variant="caption" fontWeight={600}>
                                        {new Date(row.fecha_transaccion).toLocaleString('es-ES')}
                                    </Typography>
                                </Stack>
                                <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                    <ShieldOutlined sx={{ fontSize: 13 }} />
                                    <Typography variant="caption" fontWeight={600}>Verificado</Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 3 }}>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' }, pr: { sm: 1 } }}>
                            <Typography
                                variant="subtitle1"
                                fontFamily="monospace"
                                fontWeight={800}
                                color={statusColor}
                                sx={{ fontSize: '1.15rem', letterSpacing: '-0.5px' }}
                            >
                                {isIngreso ? '+' : '-'}{formatMoney(row.monto_original, cuentaBancaria?.moneda?.codigo)}
                            </Typography>
                            <Typography variant="caption" color="text.disabled" fontWeight={600} textTransform="uppercase">
                                Monto Transacción
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    const groupedTransactions = movimientos.reduce((acc, current) => {
        const label = getGroupingLabel(current.fecha_transaccion);
        if (!acc[label]) acc[label] = [];
        acc[label].push(current);
        return acc;
    }, {} as Record<string, TransaccionHistorial[]>);

    return (
        <Box p={isMobile ? 2 : 4} maxWidth="1000px" mx="auto">
            <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} mb={4}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <IconButton onClick={() => navigate(backPath)}>
                        <ArrowBack />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold">
                            Historial de Transacciones
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {cuentaBancaria ? `${cuentaBancaria.banco?.nombre_comercial || 'Banco'} - ${cuentaBancaria.numero_cuenta}` : 'Cuenta Bancaria'}
                        </Typography>
                    </Box>
                </Stack>
                {cuentaBancaria && (
                    <Paper elevation={0} sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText', borderRadius: 2, minWidth: 200, textAlign: 'right' }}>
                        <Typography variant="caption" fontWeight="bold" sx={{ opacity: 0.8 }} textTransform="uppercase">
                            Saldo Disponible
                        </Typography>
                        <Typography variant="h5" fontWeight="bold" fontFamily="monospace">
                            {formatMoney(cuentaBancaria.saldo, cuentaBancaria.moneda?.codigo)}
                        </Typography>
                    </Paper>
                )}
            </Stack>

            {/* Filters Section */}
            <Paper elevation={0} sx={{ p: 3, mb: 4, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Buscar por código ID..."
                            value={q}
                            onChange={(e) => updateFilters({ q: e.target.value })}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search fontSize="small" />
                                        </InputAdornment>
                                    ),
                                }
                            }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Tipo</InputLabel>
                            <Select
                                value={tipo_movimiento}
                                label="Tipo"
                                onChange={(e) => updateFilters({ tipo_movimiento: e.target.value })}
                            >
                                <MenuItem value="">Todos</MenuItem>
                                <MenuItem value="INGRESO">Ingresos</MenuItem>
                                <MenuItem value="EGRESO">Egresos</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Origen</InputLabel>
                            <Select
                                multiple
                                value={origen_tipos}
                                onChange={(e) => updateFilters({ origen_tipos: e.target.value as string[] })}
                                input={<OutlinedInput label="Origen" />}
                                renderValue={(selected) => selected.map(s => ORIGEN_TIPOS_OPTIONS.find(o => o.value === s)?.label).join(', ')}
                            >
                                {ORIGEN_TIPOS_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Checkbox checked={origen_tipos.indexOf(option.value) > -1} />
                                        <ListItemText primary={option.label} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid size={{ xs: 12, md: 3 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Fecha</InputLabel>
                            <Select
                                value={fecha_preset}
                                label="Fecha"
                                onChange={(e) => handleDatePresetChange(e.target.value)}
                            >
                                {FECHA_PRESETS.map((preset) => (
                                    <MenuItem key={preset.value} value={preset.value}>{preset.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Grid>
                    {fecha_preset === 'custom' && (
                        <>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="datetime-local"
                                    label="Fecha Inicio"
                                    value={fecha_inicio ? fecha_inicio.slice(0, 16) : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateFilters({ fecha_inicio: val ? new Date(val).toISOString() : '' });
                                    }}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                    fullWidth
                                    size="small"
                                    type="datetime-local"
                                    label="Fecha Fin"
                                    value={fecha_fin ? fecha_fin.slice(0, 16) : ''}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        updateFilters({ fecha_fin: val ? new Date(val).toISOString() : '' });
                                    }}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                        </>
                    )}
                </Grid>
            </Paper>

            {loading ? (
                <Loading />
            ) : movimientos.length === 0 ? (
                <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'background.default' }} elevation={0}>
                    <Typography variant="h6" color="text.secondary">No hay transacciones que coincidan con los filtros</Typography>
                </Paper>
            ) : (
                <Box>
                    {Object.entries(groupedTransactions).map(([dateLabel, transacciones]) => (
                        <Box key={dateLabel} mb={4}>
                            <Typography variant="subtitle1" fontWeight="bold" color="text.secondary" mb={2} sx={{ pl: 1, borderLeft: '3px solid', borderColor: 'primary.main' }}>
                                {dateLabel}
                            </Typography>
                            {transacciones.map(renderItem)}
                        </Box>
                    ))}

                    {total > 0 && (
                        <Box sx={{ mt: 2 }}>
                            <StandalonePagination
                                total={total}
                                limit={limit}
                                offset={offset}
                                onPageChange={(newPage) => {
                                    searchParams.set('offset', (newPage * limit).toString());
                                    setSearchParams(searchParams);
                                }}
                                onRowsPerPageChange={(newLimit) => {
                                    searchParams.set('limit', newLimit.toString());
                                    searchParams.set('offset', '0');
                                    setSearchParams(searchParams);
                                }}
                            />
                        </Box>
                    )}
                </Box>
            )}
        </Box>
    );
};

export default CuentaBancariaHistorialPage;
