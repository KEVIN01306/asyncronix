import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Add, Edit, Visibility, Delete, Search } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, InputAdornment, Paper, TableContainer, TextField, useTheme } from "@mui/material";
import { isAbortError, useAbortableFetch } from "../../../../core/hooks/useAbortableFetch";
import { useDebounce } from "../../../../core/hooks/useDebounce";
import ListTable from "../../../../shared/components/ui/tables/ListTable";
import { TipoServicioRepository } from "../../infrastructure/repositories/tipo-servicio.repository";
import type { TipoServicio } from "../../domain/interfaces/tipo-servicio.interface";
import { toast } from "sonner";
import Loading from "../../../../shared/components/ui/Loaders/Loading";

const TiposServicioListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const q = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(q);
    const [tipos, setTipos] = useState<TipoServicio[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Tipo de servicio' },
        { id: 'precio_base', name: 'Precio base', format: (value: any) => `Q ${Number(value).toFixed(2)}` },
        { id: 'opciones', name: 'Opciones', format: (value: any) => value?.length ?? 0 }
    ];

    const abortableFetch = useAbortableFetch();
    const debouncedQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        setSearchQuery(q);
    }, [q]);

    const loadTipos = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);

        try {
            const response = await TipoServicioRepository.listar(limit, offset, debouncedQuery, signal);
            setTipos(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if (!isAbortError(error)) console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedQuery]);

    useEffect(() => {
        abortableFetch(loadTipos);
    }, [abortableFetch, loadTipos]);

    const handleDelete = async (id: string) => {
        try {
            await TipoServicioRepository.eliminar(id);
            toast.success('Tipo de servicio eliminado correctamente');
            abortableFetch(loadTipos);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el tipo de servicio');
        }
    };

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/tipos-servicio/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary.main',
            onClick: (row: any) => navigate(`/tipos-servicio/${row.id}/editar`),
        },
        {
            name: 'Eliminar',
            icon: <Delete fontSize="small" />,
            color: 'error.main',
            onClick: (row: any) => handleDelete(row.id),
        }
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                Administra los tipos de servicio con sus precios base y las opciones que aplican a cada uno.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar tipos de servicio"
                    placeholder="Ej: Mantenimiento general"
                    value={searchQuery}
                    onChange={(event) => {
                        const value = event.target.value;
                        setSearchQuery(value);
                        const params: Record<string, string> = {
                            limit: limit.toString(),
                            offset: '0'
                        };

                        if (value) params.q = value;
                        setSearchParams(params);
                    }}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Search color="primary" /></InputAdornment>) }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/tipos-servicio/nuevo')}>
                    Nuevo tipo
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={tipos}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => setSearchParams({
                                limit: limit.toString(),
                                offset: (newPage * limit).toString(),
                                ...(q ? { q } : {})
                            }),
                            onRowsPerPageChange: (newLimit) => setSearchParams({
                                limit: newLimit.toString(),
                                offset: '0',
                                ...(q ? { q } : {})
                            })
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default TiposServicioListPage;
