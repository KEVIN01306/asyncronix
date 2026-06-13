import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { Categoria } from "../../domain/interfaces/categoria.interface";
import { useCallback, useEffect, useState } from "react";
import { Add, Edit, Search, Visibility } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, InputAdornment, Paper, TableContainer, TextField, useTheme } from "@mui/material";
import ListTable from "../../../../shared/components/ui/tables/ListTable";
import { CategoriaRepository } from "../../infrastructure/repositories/categoria.repository";
import { isAbortError, useAbortableFetch } from "../../../../core/hooks/useAbortableFetch";
import { useDebounce } from "../../../../core/hooks/useDebounce";
import Loading from "../../../../shared/components/ui/Loaders/Loading";



const CategoriaListPage = () => {

    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [categorias, setCategorias] = useState<Categoria[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState<string>(() => searchParams.get('q') || '');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const abortableFetch = useAbortableFetch();

    const columns = [
        { id: 'categoria', name: 'Categoría', format: (value: any) => value.toString().toUpperCase() },
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/categorias/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary',
            onClick: (row: any) => navigate(`/categorias/${row.id}/editar`),
            visible: (row: any) => !row.default_categoria
        },
    ];

    const fetchCategorias = useCallback(async (signal: AbortSignal) => {
        setLoading(true);
        try {
            const response = await CategoriaRepository.listar(limit, offset, debouncedSearchQuery || undefined, signal);
            setCategorias(response.data);
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
        abortableFetch(fetchCategorias);
    }, [abortableFetch, fetchCategorias]);

    useEffect(() => {
        const q = searchParams.get('q') || '';
        if (q !== searchQuery) {
            setSearchQuery(q);
        }
    }, [searchParams, searchQuery]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                En este modulo puedes administrar las categorias de tus productos, agregar nuevos, editar su información o eliminarlos. Mantén tu lista de Categorias actualizada para una mejor gestión de tu negocio.
            </Alert>

            <Box display="flex" flexDirection={ isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    value={searchQuery}
                    label="Buscar categorias"
                    placeholder="Ej: Electronica, Ropa, etc."
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearchQuery(value);
                        const params: any = { limit: limit.toString(), offset: '0' };
                        if (value.trim().length > 0) {
                            params.q = value;
                        }
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
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/categorias/nuevo')}>
                    Nueva categoria
                </Button>
            </Box>

            <TableContainer >
                {loading ? (
                    <Loading />
                ) : (
                    <>
                        <ListTable
                            data={categorias}
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
                    </>
                )}
            </TableContainer>
        </Box>
    );

}

export default CategoriaListPage;