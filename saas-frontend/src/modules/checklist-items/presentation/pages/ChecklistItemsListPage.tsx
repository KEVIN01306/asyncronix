import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Add, Edit, Visibility, Delete, Search } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, InputAdornment, Paper, TableContainer, TextField, useTheme } from "@mui/material";
import { isAbortError, useAbortableFetch } from "../../../../core/hooks/useAbortableFetch";
import { useDebounce } from "../../../../core/hooks/useDebounce";
import ListTable from "../../../../shared/components/ui/tables/ListTable";
import { ChecklistItemRepository } from "../../infrastructure/repositories/checklist-item.repository";
import type { ChecklistItem } from "../../domain/interfaces/checklist-item.interface";
import { toast } from "sonner";
import Loading from "../../../../shared/components/ui/Loaders/Loading";

const ChecklistItemsListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const q = searchParams.get('q') || '';
    const [searchQuery, setSearchQuery] = useState(q);
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Checklist' },
        { id: 'activo', name: 'Activo', format: (value: any) => value ? 'Sí' : 'No' }
    ];

    const abortableFetch = useAbortableFetch();
    const debouncedQuery = useDebounce(searchQuery, 300);

    useEffect(() => {
        setSearchQuery(q);
    }, [q]);

    const loadItems = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);

        try {
            const response = await ChecklistItemRepository.listar(limit, offset, debouncedQuery, signal);
            setItems(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if (!isAbortError(error)) console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset, debouncedQuery]);

    useEffect(() => {
        abortableFetch(loadItems);
    }, [abortableFetch, loadItems]);

    const handleDelete = async (id: string) => {
        try {
            await ChecklistItemRepository.eliminar(id);
            toast.success('Checklist item eliminado correctamente');
            abortableFetch(loadItems);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar el checklist item');
        }
    };

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/checklist/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary.main',
            onClick: (row: any) => navigate(`/checklist/${row.id}/editar`),
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
                Administra los elementos de checklist que usarás dentro de tus servicios y tareas de taller.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar checklist"
                    placeholder="Ej: Verificar frenos"
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
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/checklist/nuevo')}>
                    Nuevo checklist
                </Button>
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

export default ChecklistItemsListPage;
