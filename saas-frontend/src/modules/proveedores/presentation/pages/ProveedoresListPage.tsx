import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Dialog, DialogTitle, DialogContent, DialogActions, Stack } from '@mui/material';
import { Add, Edit, Info, Search, FilterList } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Proveedor } from '../../domain/interfaces/proveedor.interface';
import { proveedoresRepository } from '../../infrastructure/proveedores.repository';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ProveedoresListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const q = searchParams.get('q') || '';

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(q);
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [tempFiltroNit, setTempFiltroNit] = useState<string | null>(() => q || null);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const abortableFetch = useAbortableFetch();

    const updateSearchParams = (overrideOptions: { limit?: string; offset?: string; q?: string }) => {
        const params: Record<string, string> = {
            limit: overrideOptions.limit ?? limit.toString(),
            offset: overrideOptions.offset ?? offset.toString(),
        };

        const queryValue = overrideOptions.q ?? q;
        if (queryValue.trim().length > 0) params.q = queryValue;
        else delete params.q;

        setSearchParams(params);
    };

    const handleClearFilters = () => {
        setTempFiltroNit(null);
        setSearchQuery('');
        setFilterModalOpen(false);
        updateSearchParams({ offset: '0', q: '' });
    };

    const handleApplyFilters = () => {
        const queryValue = tempFiltroNit || '';
        setSearchQuery(queryValue);
        setFilterModalOpen(false);
        updateSearchParams({ offset: '0', q: queryValue });
    };

    const columns = [
        { id: 'nombre', name: 'Nombre' },
        { id: 'telefono', name: 'Teléfono' },
        { id: 'nit', name: 'NIT' },
        { id: 'email', name: 'Email' },
    ];

    const actions = [
        {
            name: 'Detalle',
            icon: <Info fontSize="small" />,
            color: 'info',
            onClick: (row: any) => navigate(`/proveedores/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/proveedores/${row.id}/editar`),
        },
    ];

    const fetchProveedores = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const response = await proveedoresRepository.listar(limit, offset, debouncedSearchQuery || undefined, signal);
            setProveedores(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if (isAbortError(error)) {
                return;
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedSearchQuery]);

    useEffect(() => {
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [q, searchQuery]);

    useEffect(() => {
        abortableFetch(fetchProveedores);
    }, [abortableFetch, fetchProveedores]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Proveedores</AlertTitle>
                Administra tus proveedores, crea nuevos registros y actualiza la información de contacto en cualquier momento.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar proveedor"
                    placeholder="Ej: Nombre, contacto, teléfono o email"
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
                <Button
                    variant="outlined"
                    startIcon={<FilterList />}
                    onClick={() => setFilterModalOpen(true)}
                >
                    Más filtros
                </Button>
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/proveedores/nuevo')}>
                    Nuevo proveedor
                </Button>
            </Box>

            <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Filtros</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} mt={1}>
                        <TextField
                            label="NIT"
                            value={tempFiltroNit ?? ''}
                            onChange={(event) => {
                                const value = event.target.value || null;
                                setTempFiltroNit(value);
                            }}
                            placeholder="Buscar por NIT"
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                    <Button onClick={handleClearFilters} variant="outlined">Limpiar</Button>
                    <Button onClick={handleApplyFilters} variant="contained">Aplicar</Button>
                </DialogActions>
            </Dialog>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={proveedores}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => {
                                const newOffset = newPage * limit;
                                updateSearchParams({ offset: newOffset.toString() });
                            },
                            onRowsPerPageChange: (newLimit) => {
                                updateSearchParams({ limit: newLimit.toString(), offset: '0' });
                            },
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default ProveedoresListPage;
