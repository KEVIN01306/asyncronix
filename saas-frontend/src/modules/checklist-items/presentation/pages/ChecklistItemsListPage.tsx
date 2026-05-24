import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Add, Edit, Visibility, Delete } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, CircularProgress, InputAdornment, Paper, TableContainer, TextField, useTheme } from "@mui/material";
import ListTable from "../../../../shared/components/ui/tables/ListTable";
import { ChecklistItemRepository } from "../../infrastructure/repositories/checklist-item.repository";
import type { ChecklistItem } from "../../domain/interfaces/checklist-item.interface";
import { toast } from "sonner";

const ChecklistItemsListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const [items, setItems] = useState<ChecklistItem[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Checklist' },
        { id: 'activo', name: 'Activo', format: (value: any) => value ? 'Sí' : 'No' }
    ];

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await ChecklistItemRepository.listar(limit, offset);
            setItems(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleDelete = async (id: string) => {
        try {
            await ChecklistItemRepository.eliminar(id);
            toast.success('Checklist item eliminado correctamente');
            fetchItems();
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
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Add color="primary" /></InputAdornment>) }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/checklist/nuevo')}>
                    Nuevo checklist
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <ListTable
                        data={items}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (newPage) => setSearchParams({ limit: limit.toString(), offset: (newPage * limit).toString() }),
                            onRowsPerPageChange: (newLimit) => setSearchParams({ limit: newLimit.toString(), offset: '0' })
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default ChecklistItemsListPage;
