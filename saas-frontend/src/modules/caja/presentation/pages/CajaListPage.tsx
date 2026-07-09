import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TextField, InputAdornment, useTheme, useMediaQuery, Grid, Typography } from '@mui/material';
import { Add, Info, Search, PointOfSaleOutlined } from '@mui/icons-material';
import { cajaRepository } from '../../infrastructure/caja.repository';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import type { Caja } from '../../domain/interfaces/caja.interface';

// COMPONENTES REFACTORIZADOS Y DESACOPLADOS
import CajaCardItem from '../components/CajaCardItem';
import StandalonePagination from '../../../../shared/components/ui/pagination/StandalonePagination';
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

    const updateSearchParams = (overrideOptions: { limit?: string; offset?: string; q?: string }) => {
        const params: Record<string, string> = {
            limit: overrideOptions.limit ?? limit.toString(),
            offset: overrideOptions.offset ?? offset.toString(),
        };
        const queryValue = overrideOptions.q ?? searchQuery;
        if (queryValue.trim().length > 0) params.q = queryValue;
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

    const actions = [
        {
            name: 'Detalle',
            icon: <Info fontSize="small" />, 
            color: 'info',
            onClick: (row: Caja) => navigate(`/cajas/${row.id}`),
        },
    ];

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q !== searchQuery) setSearchQuery(q);
    }, [searchParams, searchQuery]);

    useEffect(() => {
        abortableFetch(fetchCajas);
    }, [abortableFetch, fetchCajas]);

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Buscador Superior */}
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={4} sx={{ bgcolor: 'background.paper', p: 2 }} component={Paper}>
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

            {/* CONTENEDOR CUSTOM EN LUGAR DE TABLA */}
            <Box>
                {loading ? (
                    <Box py={4}><Loading /></Box>
                ) : cajas.length === 0 ? (
                    /* ESTADO VACÍO */
                    <Paper 
                        elevation={0}
                        sx={{ 
                            p: 6, 
                            textAlign: 'center',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: 2
                        }}
                    >
                        <PointOfSaleOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.6 }} />
                        <Box>
                            <Typography variant="h2" sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 0.5 }}>
                                No se encontraron cajas de tesorería
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery ? 'Prueba cambiando los términos del buscador.' : 'Comienza registrando una nueva caja en el botón superior.'}
                            </Typography>
                        </Box>
                    </Paper>
                ) : (
                    <> 
                        {/* Grid responsivo: 3 por fila en pantallas de escritorio (md=4) */}
                        <Grid container spacing={3} mb={3}>
                            {cajas.map((caja) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={caja.id}>
                                    <CajaCardItem 
                                        caja={caja} 
                                        actions={actions}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Paginación desacoplada exacta a la de cuentas */}
                        {total > 0 && (
                            <StandalonePagination
                                total={total}
                                limit={limit}
                                offset={offset}
                                onPageChange={(newPage) => updateSearchParams({ offset: (newPage * limit).toString() })}
                                onRowsPerPageChange={(newLimit) => updateSearchParams({ limit: newLimit.toString(), offset: '0' })}
                            />
                        )}
                    </>
                )}
            </Box>
        </Box>
    );
};

export default CajaListPage;