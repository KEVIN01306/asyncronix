import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment } from '@mui/material';
import { Add, Info, Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Caja } from '../../domain/interfaces/caja.interface';
import { cajaRepository } from '../../infrastructure/caja.repository';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const CajaListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    const [cajas, setCajas] = useState<Caja[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const abortableFetch = useAbortableFetch();

    const columns = [
        { id: 'nombre', name: 'Nombre' },
        { id: 'tipo', name: 'Tipo' },
        { id: 'saldo', name: 'Saldo' },
        { id: 'activo', name: 'Activo' },
    ];

    const actions = [
        {
            name: 'Detalle',
            icon: <Info fontSize="small" />, 
            color: 'info',
            onClick: (row: Caja) => navigate(`/cajas/${row.id}`),
        },
    ];

    const updateSearchParams = (overrideOptions: { limit?: string; offset?: string; q?: string }) => {
        const params: Record<string, string> = {
            limit: overrideOptions.limit ?? limit.toString(),
            offset: overrideOptions.offset ?? offset.toString(),
        };

        const queryValue = overrideOptions.q ?? searchQuery;
        if (queryValue.trim().length > 0) params.q = queryValue;
        else delete params.q;

        setSearchParams(params);
    };

    const fetchCajas = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const response = await cajaRepository.listar(limit, offset, debouncedSearchQuery || undefined, signal);
            setCajas(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedSearchQuery]);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q !== searchQuery) setSearchQuery(q);
    }, [searchParams, searchQuery]);

    useEffect(() => {
        abortableFetch(fetchCajas);
    }, [abortableFetch, fetchCajas]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={2} sx={{ bgcolor: 'background.paper', p: 2 }} component={Paper}>
                <TextField
                    fullWidth
                    label="Buscar caja"
                    placeholder="Ej: nombre o tipo"
                    value={searchQuery}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearchQuery(value);
                        updateSearchParams({ offset: '0', q: value });
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/cajas/nuevo')}>
                    Nueva caja
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={cajas}
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
        </Box>
    );
};

export default CajaListPage;
