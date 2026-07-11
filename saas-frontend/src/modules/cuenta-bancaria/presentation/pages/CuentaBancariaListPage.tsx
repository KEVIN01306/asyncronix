import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TextField, InputAdornment, useTheme, useMediaQuery, Grid, Typography } from '@mui/material';
import { Add, Info, Search, AccountBalanceWalletOutlined, History } from '@mui/icons-material';
import { cuentaBancariaRepository } from '../../infrastructure/cuenta-bancaria.repository';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import type { CuentaBancaria } from '../../domain/interfaces/cuenta-bancaria.interface';

// TUS NUEVOS COMPONENTES DESACOPLADOS
import CuentaBancariaCardItem from '../components/CuentaBancariaCardItem';
import StandalonePagination from '../../../../shared/components/ui/pagination/StandalonePagination';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const CuentaBancariaListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
    
    const [cuentas, setCuentas] = useState<CuentaBancaria[]>([]);
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

    const fetchCuentas = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const response = await cuentaBancariaRepository.listar(limit, offset, debouncedSearchQuery || undefined, signal);
            setCuentas(response.data);
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
            name: 'Historial',
            icon: <History fontSize="small" />,
            color: 'secondary',
            onClick: (row: CuentaBancaria) => navigate(`/cuentas-bancarias/${row.id}/historial`),
        },
        {
            name: 'Detalle',
            icon: <Info fontSize="small" />,
            color: 'info',
            onClick: (row: CuentaBancaria) => navigate(`/cuentas-bancarias/${row.id}`),
        },
    ];

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q !== searchQuery) setSearchQuery(q);
    }, [searchParams, searchQuery]);

    useEffect(() => {
        abortableFetch(fetchCuentas);
    }, [abortableFetch, fetchCuentas]);

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Buscador Superior */}
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={4} sx={{ bgcolor: 'background.paper', p: 2 }} component={Paper}>
                <TextField
                    fullWidth
                    label="Buscar cuentas"
                    placeholder="Ej: titular o número"
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
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/cuentas-bancarias/nuevo')}>
                    Nueva cuenta
                </Button>
            </Box>

            {/* CONTENEDOR DE COMPONENTES CUSTOM */}
            <Box>
                {loading ? (
                    <Box py={4}><Loading /></Box>
                ) : cuentas.length === 0 ? (
                    /* ESTADO VACÍO ESTILO APPLE */
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
                        <AccountBalanceWalletOutlined sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.6 }} />
                        <Box>
                            <Typography variant="h2" sx={{ fontSize: '1.2rem', fontWeight: 600, mb: 0.5 }}>
                                No se encontraron cuentas bancarias
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {searchQuery ? 'Prueba ajustando los términos de tu búsqueda.' : 'Comienza registrando una cuenta en el botón superior.'}
                            </Typography>
                        </Box>
                    </Paper>
                ) : (
                    <> 
                        <Grid container spacing={3} mb={3}>
                            {cuentas.map((cuenta) => (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cuenta.id}>
                                    <CuentaBancariaCardItem 
                                        cuenta={cuenta} 
                                        actions={actions}
                                    />
                                </Grid>
                            ))}
                        </Grid>

                        {/* Paginación desacoplada interactuando con la misma lógica */}
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

export default CuentaBancariaListPage;