import useMediaQuery from '@mui/material/useMediaQuery';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import { Add, Edit, Visibility } from '@mui/icons-material';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import AtributosTab from './components/AtributosTab';
import { Alert, Box, Button, Chip, CircularProgress, MenuItem, Paper, TableContainer, TextField, useTheme } from '@mui/material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { CategoriaRepository } from '../../../categorias/infrastructure/repositories/categoria.repository';
import type { Producto } from '../../domain/interfaces/producto.interface';
import type { Categoria } from '../../../categorias/domain/interfaces/categoria.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

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

    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const selectedCategoria = searchParams.get('categoria_id') || '';

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

    const fetchProductos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ProductoRepository.listar(limit, offset, selectedCategoria || undefined);
            setProductos(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, selectedCategoria]);

    useEffect(() => {
        fetchCategorias();
    }, [fetchCategorias]);

    useEffect(() => {
        fetchProductos();
    }, [fetchProductos]);

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

                    <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={1}
                        sx={{ bgcolor: 'background.paper', p: 2 }}
                        component={Paper}
                    >
                        <TextField
                            select
                            fullWidth
                            label="Filtrar por categoría"
                            value={selectedCategoria}
                            onChange={(event) => {
                                const value = event.target.value;
                                setSearchParams({ limit: limit.toString(), offset: '0', categoria_id: value });
                            }}
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
                        <Button
                            variant="contained"
                            fullWidth={isMobile}
                            startIcon={<Add />}
                            onClick={() => navigate('/productos/nuevo')}
                        >
                            Nuevo producto
                        </Button>
                    </Box>

                    <TableContainer>
                        {loading ? (
                            <Box display="flex" justifyContent="center" p={5}>
                                <CircularProgress />
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
                                        setSearchParams({ limit: limit.toString(), offset: newOffset.toString(), categoria_id: selectedCategoria });
                                    },
                                    onRowsPerPageChange: (newLimit) => {
                                        setSearchParams({ limit: newLimit.toString(), offset: '0', categoria_id: selectedCategoria });
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
