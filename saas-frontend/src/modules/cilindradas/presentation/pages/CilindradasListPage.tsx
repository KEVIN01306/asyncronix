import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment } from '@mui/material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { cilindradasRepository } from '../../infrastructure/cilindradas.repository';
import { Search, Visibility } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useDebounce } from '../../../../core/hooks/useDebounce';

const CilindradasListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const qParam = searchParams.get('q') || '';

    const [items, setItems] = useState<any[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(qParam);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const abortRef = useRef<AbortController | null>(null);

    const columns = [
        { id: 'cilindrada', name: 'Cilindrada (cc)' },
    ];

    const actions = [
        {
            name: 'Ver',
            icon:  <Visibility fontSize="small" />,
            onClick: (row: any) => navigate(`/cilindradas/${row.id}`),
        }
    ];

    const fetch = useCallback(async (q?: string) => {
        setLoading(true);
        try {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const res = await cilindradasRepository.listar(limit, offset, q, controller.signal);
            setItems(res.data);
            setTotal(res.meta.total);
        } catch (error) {
            if ((error as any)?.name === 'CanceledError' || (error as any)?.code === 'ERR_CANCELED') {
                return;
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => { fetch(debouncedQuery || undefined); }, [fetch, debouncedQuery]);

    useEffect(() => {
        const params: Record<string, string> = { limit: limit.toString(), offset: offset.toString() };
        if (debouncedQuery) params.q = debouncedQuery;
        setSearchParams(params);
    }, [debouncedQuery, limit, offset, setSearchParams]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box
                display="flex"
                alignItems="center"
                component={Paper}
                sx={{ p: 2, mb: 2 }}
            >
                <TextField
                    fullWidth
                    label="Buscar cilindrada"
                    placeholder="Ej: 150"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        )
                    }}
                />
            </Box>
            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={items}
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
                )}
            </TableContainer>
        </Box>
    );
};

export default CilindradasListPage;
