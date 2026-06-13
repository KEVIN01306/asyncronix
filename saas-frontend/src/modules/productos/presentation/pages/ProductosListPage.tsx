import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Add, Edit, Visibility, FilterList, Search } from '@mui/icons-material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AtributosTab from './components/AtributosTab';
import { Alert, Box, Button, Chip, Dialog, DialogContent, DialogTitle, MenuItem, Paper, TableContainer, TextField, useTheme, DialogActions, InputAdornment } from '@mui/material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { CategoriaRepository } from '../../../categorias/infrastructure/repositories/categoria.repository';
import type { Producto } from '../../domain/interfaces/producto.interface';
import type { Categoria } from '../../../categorias/domain/interfaces/categoria.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { isAbortError, useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ProductosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const [productos, setProductos] = useState<Producto[]>([]);
    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [tabIndex, setTabIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
    const [codigoFilter, setCodigoFilter] = useState<string>(() => searchParams.get('codigo') || '');
    const [categoriaFilter, setCategoriaFilter] = useState<string>(() => searchParams.get('categoria_id') || '');
    const [filterModalOpen, setFilterModalOpen] = useState(false);
    const [tempCodigoFilter, setTempCodigoFilter] = useState(codigoFilter);
    const [tempCategoriaFilter, setTempCategoriaFilter] = useState(categoriaFilter);

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const abortableFetch = useAbortableFetch();

    const columns = [
        { id: 'nombre', name: 'Nombre' },
        {
            id: 'categoria',
            name: 'Categoría',
            format: (_value: any, row: Producto) => row.categoria?.categoria || '-'
        },
        {
            id: 'precio_sugerido',
            name: 'Precio',
            format: (value: number) => formatMoney(value)
        },
        {
            id: 'activo',
            name: 'Estado',
            format: (value: boolean) => <Chip variant='outlined' color={value ? 'success' : 'error'} label={value ? 'Activo' : 'Inactivo'} size="small" />
        }
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: Producto) => navigate(`/productos/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary',
            onClick: (row: Producto) => navigate(`/productos/${row.id}/editar`),
        },
    ];

    const fetchCategorias = useCallback(async () => {
        try {
            const response = await CategoriaRepository.listar(100, 0);
            setCategorias(response.data);
        } catch (error) {
            console.error(error);
        }
    }, []);

    const fetchProductos = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const response = await ProductoRepository.listar(limit, offset, categoriaFilter || undefined, debouncedSearchQuery || undefined, codigoFilter || undefined, signal);
            setProductos(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if (isAbortError(error)) {
                return;
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, categoriaFilter, debouncedSearchQuery, codigoFilter]);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    useEffect(() => {
        abortableFetch(fetchProductos);
    }, [abortableFetch, fetchProductos]);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [searchParams, searchQuery]);

    const handleApplyFilters = () => {
        setCodigoFilter(tempCodigoFilter);
        setCategoriaFilter(tempCategoriaFilter);
        const params: any = { limit: limit.toString(), offset: '0' };
        if (tempCategoriaFilter) params.categoria_id = tempCategoriaFilter;
        if (debouncedSearchQuery) params.q = debouncedSearchQuery;
        if (tempCodigoFilter) params.codigo = tempCodigoFilter;
        setSearchParams(params);
        setFilterModalOpen(false);
    };

    const handleClearFilters = () => {
        setTempCodigoFilter('');
        setCodigoFilter('');
        setTempCategoriaFilter('');
        setCategoriaFilter('');
        setSearchQuery('');
        setSearchParams({ limit: limit.toString(), offset: '0' });
    };

    return (
        <Box p={isMobile ? 2 : 4}>
            <Tabs value={tabIndex} onChange={(_, v) => setTabIndex(v)} sx={{ mb: 2 }}>
                <Tab label="Productos" />
                <Tab label="Atributos" />
            </Tabs>

            {tabIndex === 1 ? (
                <AtributosTab />
            ) : (
                <>
                    <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                        En este módulo puedes administrar tus productos, crear nuevas referencias y subir imágenes para que tu inventario esté siempre actualizado.
                    </Alert>

                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={2}
                        sx={{ bgcolor: 'background.paper', p: 2 }}
                        component={Paper}
                    >
                        <TextField
                            fullWidth
                            value={searchQuery}
                            label="Buscar productos"
                            placeholder="Nombre o código"
                            onChange={(event) => {
                                const value = event.target.value;
                                setSearchQuery(value);
                                const params: any = { limit: limit.toString(), offset: '0' };
                                if (categoriaFilter) params.categoria_id = categoriaFilter;
                                if (value.trim().length > 0) {
                                    params.q = value;
                                }
                                if (codigoFilter) params.codigo = codigoFilter;
                                setSearchParams(params);
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
                        <Button
                            variant="contained"
                            fullWidth={isMobile}
                            startIcon={<Add />}
                            onClick={() => navigate('/productos/nuevo')}
                        >
                            Nuevo
                        </Button>
                    </Box>

                    <Dialog open={filterModalOpen} onClose={() => setFilterModalOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle>Filtros adicionales</DialogTitle>
                        <DialogContent sx={{ pt: 2 }}>
                            <TextField
                                select
                                fullWidth
                                label="Categoría"
                                value={tempCategoriaFilter}
                                onChange={(e) => setTempCategoriaFilter(e.target.value)}
                                margin="normal"
                                SelectProps={{
                                    MenuProps: {
                                        PaperProps: {
                                            sx: { maxHeight: 320 }
                                        }
                                    }
                                }}
                            >
                                <MenuItem value="">Todas</MenuItem>
                                {categorias.map((categoria) => (
                                    <MenuItem key={categoria.id} value={categoria.id}>
                                        {categoria.categoria}
                                    </MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                fullWidth
                                label="Código del producto"
                                value={tempCodigoFilter}
                                onChange={(e) => setTempCodigoFilter(e.target.value)}
                                placeholder="Ingresa el código..."
                                margin="normal"
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setFilterModalOpen(false)}>Cancelar</Button>
                            <Button onClick={handleClearFilters} variant="outlined">Limpiar</Button>
                            <Button onClick={handleApplyFilters} variant="contained">Aplicar</Button>
                        </DialogActions>
                    </Dialog>

                    <TableContainer>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={5}>
                                <Loading />                            
                            </Box>
                        ) : (
                            <ListTable
                                data={productos}
                                columns={columns}
                                actions={actions}
                                pagination={{
                                    total,
                                    limit,
                                    offset,
                                    onPageChange: (newPage) => {
                                        const newOffset = newPage * limit;
                                        const params: any = { limit: limit.toString(), offset: newOffset.toString() };
                                        if (categoriaFilter) params.categoria_id = categoriaFilter;
                                        if (debouncedSearchQuery) params.q = debouncedSearchQuery;
                                        if (codigoFilter) params.codigo = codigoFilter;
                                        setSearchParams(params);
                                    },
                                    onRowsPerPageChange: (newLimit) => {
                                        const params: any = { limit: newLimit.toString(), offset: '0' };
                                        if (categoriaFilter) params.categoria_id = categoriaFilter;
                                        if (debouncedSearchQuery) params.q = debouncedSearchQuery;
                                        if (codigoFilter) params.codigo = codigoFilter;
                                        setSearchParams(params);
                                    }
                                }}
                            />
                        )}
                    </TableContainer>
                </>
            )}
        </Box>
    );
};

export default ProductosListPage;
