import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, Alert, AlertTitle, Chip, InputAdornment, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Add, Visibility, Search, FilterList } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Lote } from '../../domain/interfaces/lote.interface';
import { LoteRepository } from '../../infrastructure/repositories/lote.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const LoteListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [searchText, setSearchText] = useState('');
    const [filterModalOpen, setFilterModalOpen] = useState(false);

    // Temp staged filters for modal
    const [tempCodigoLote, setTempCodigoLote] = useState('');
    const [tempProductoSku, setTempProductoSku] = useState('');
    const [tempVarianteCorrelativo, setTempVarianteCorrelativo] = useState('');
    const [tempFechaVencimientoDesde, setTempFechaVencimientoDesde] = useState('');
    const [tempFechaVencimientoHasta, setTempFechaVencimientoHasta] = useState('');
    const [tempCreatedAtDesde, setTempCreatedAtDesde] = useState('');
    const [tempCreatedAtHasta, setTempCreatedAtHasta] = useState('');
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'codigo_lote', name: 'Código', format: (value: string, row: Lote) => value ?? row.id?.slice(0, 8) },
        { id: 'producto', name: 'Producto', format: (_value: any, row: Lote) => row.variante?.producto_nombre ?? row.variante?.producto_id ?? row.variante_id },
        { id: 'sucursal', name: 'Sucursal', format: (_value: any, row: Lote) => <Chip variant='filled' color='primary' label={row.sucursal?.nombre ?? row.sucursal_id} size="small" /> },
        { id: 'cantidad_inicial', name: 'Cantidad inicial' },
        { id: 'cantidad_actual', name: 'Cantidad actual' },
        { id: 'fecha_vencimiento', name: 'Fecha vigencia', format: (value: string) => value ? new Date(value).toLocaleDateString() : 'Sin fecha' },
        { id: 'precio_venta', name: 'Precio venta', format: (value: number) => `S/ ${value.toFixed(2)}` },
        { id: 'activo', name: 'Estado', format: (value: boolean) => <Chip variant='outlined' color={value ? 'success' : 'error'} label={value ? 'Activo' : 'Inactivo'} size="small" /> }
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/lotes/${row.id}`),
        },
    ];

    const fetchLotes = useCallback(async () => {
        setLoading(true);
        try {
            const paramsObj = Object.fromEntries(searchParams.entries());
            const filters: Record<string, any> = {};
            if (paramsObj.q) filters.q = paramsObj.q;
            if (paramsObj.codigo_lote) filters.codigo_lote = paramsObj.codigo_lote;
            if (paramsObj.producto_sku) filters.producto_sku = paramsObj.producto_sku;
            if (paramsObj.variante_correlativo) filters.variante_correlativo = paramsObj.variante_correlativo;
            if (paramsObj.fecha_vencimiento_from) filters.fecha_vencimiento_from = paramsObj.fecha_vencimiento_from;
            if (paramsObj.fecha_vencimiento_to) filters.fecha_vencimiento_to = paramsObj.fecha_vencimiento_to;
            if (paramsObj.created_at_from) filters.created_at_from = paramsObj.created_at_from;
            if (paramsObj.created_at_to) filters.created_at_to = paramsObj.created_at_to;

            const response = await LoteRepository.listar(limit, offset, filters);
            // response is PaginatedResponse<Lote>
            setLotes(response.data ?? []);
            setTotal(response.meta?.total ?? response.count ?? 0);
        } catch (error) {
            console.error("Error al obtener lotes:", error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, searchParams]);

    useEffect(() => {
        // initialize searchText from params
        const q = searchParams.get('q') || '';
        setSearchText(q);
        fetchLotes();
    }, [fetchLotes, searchParams]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                En este módulo puedes administrar los lotes, agregar nuevos registros y revisar el inventario completo de tu negocio.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar lotes"
                    placeholder="Ej: Producto, ID, sucursal"
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
                        setTempCodigoLote(params.codigo_lote || '');
                        setTempProductoSku(params.producto_sku || '');
                        setTempVarianteCorrelativo(params.variante_correlativo || '');
                        setTempFechaVencimientoDesde(params.fecha_vencimiento_from || '');
                        setTempFechaVencimientoHasta(params.fecha_vencimiento_to || '');
                        setTempCreatedAtDesde(params.created_at_from || '');
                        setTempCreatedAtHasta(params.created_at_to || '');
                        setFilterModalOpen(true);
                    }}>
                        Más filtros
                    </Button>
                    <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/lotes/crear')}>
                        Agregar lote
                    </Button>
                </Box>
            </Box>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={lotes}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                const current = Object.fromEntries(searchParams.entries());
                                const params = { ...current, limit: limit.toString(), offset: newOffset.toString() } as Record<string,string>;
                                setSearchParams(params);
                            },
                            onRowsPerPageChange: (newLimit) => {
                                const current = Object.fromEntries(searchParams.entries());
                                const params = { ...current, limit: newLimit.toString(), offset: '0' } as Record<string,string>;
                                setSearchParams(params);
                            },
                        }}
                    />
                )}
            </TableContainer>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={1}>
                        <TextField label="Código lote" value={tempCodigoLote} onChange={(e) => setTempCodigoLote(e.target.value)} />
                        <TextField label="SKU producto" value={tempProductoSku} onChange={(e) => setTempProductoSku(e.target.value)} />
                        <TextField label="Correlativo variante" value={tempVarianteCorrelativo} onChange={(e) => setTempVarianteCorrelativo(e.target.value)} />

                        <Box display="flex" gap={2}>
                            <TextField label="Vencimiento desde" type="date" value={tempFechaVencimientoDesde} onChange={(e) => setTempFechaVencimientoDesde(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                            <TextField label="Vencimiento hasta" type="date" value={tempFechaVencimientoHasta} onChange={(e) => setTempFechaVencimientoHasta(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                        </Box>

                        <Box display="flex" gap={2}>
                            <TextField label="Creado desde" type="date" value={tempCreatedAtDesde} onChange={(e) => setTempCreatedAtDesde(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                            <TextField label="Creado hasta" type="date" value={tempCreatedAtHasta} onChange={(e) => setTempCreatedAtHasta(e.target.value)} InputLabelProps={{ shrink: true }} fullWidth />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={() => {
                        // clear temp and applied filters
                        setTempCodigoLote('');
                        setTempProductoSku('');
                        setTempVarianteCorrelativo('');
                        setTempFechaVencimientoDesde('');
                        setTempFechaVencimientoHasta('');
                        setTempCreatedAtDesde('');
                        setTempCreatedAtHasta('');
                        // also remove from search params but keep q
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
                        if (tempCodigoLote) params.codigo_lote = tempCodigoLote;
                        if (tempProductoSku) params.producto_sku = tempProductoSku;
                        if (tempVarianteCorrelativo) params.variante_correlativo = tempVarianteCorrelativo;
                        if (tempFechaVencimientoDesde) params.fecha_vencimiento_from = tempFechaVencimientoDesde;
                        if (tempFechaVencimientoHasta) params.fecha_vencimiento_to = tempFechaVencimientoHasta;
                        if (tempCreatedAtDesde) params.created_at_from = tempCreatedAtDesde;
                        if (tempCreatedAtHasta) params.created_at_to = tempCreatedAtHasta;
                        setSearchParams(params);
                        setFilterModalOpen(false);
                    }}>Aplicar</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default LoteListPage;
