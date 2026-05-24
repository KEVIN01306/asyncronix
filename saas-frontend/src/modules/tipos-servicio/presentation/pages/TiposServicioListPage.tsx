import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Add, Edit, Visibility, Delete } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, CircularProgress, InputAdornment, Paper, TableContainer, TextField, useTheme } from "@mui/material";
import ListTable from "../../../../shared/components/ui/tables/ListTable";
import { TipoServicioRepository } from "../../infrastructure/repositories/tipo-servicio.repository";
import type { TipoServicio } from "../../domain/interfaces/tipo-servicio.interface";
import { toast } from "sonner";

const TiposServicioListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const [tipos, setTipos] = useState<TipoServicio[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Tipo de servicio' },
        { id: 'precio_base', name: 'Precio base', format: (value: any) => `Q ${Number(value).toFixed(2)}` },
        { id: 'opciones', name: 'Opciones', format: (value: any) => value?.length ?? 0 }
    ];

    const fetchTipos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await TipoServicioRepository.listar(limit, offset);
            setTipos(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchTipos();
    }, [fetchTipos]);

    const handleDelete = async (id: string) => {
        try {
            await TipoServicioRepository.eliminar(id);
            toast.success('Tipo de servicio eliminado correctamente');
            fetchTipos();
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
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Add color="primary" /></InputAdornment>) }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/tipos-servicio/nuevo')}>
                    Nuevo tipo
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <ListTable
                        data={tipos}
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

export default TiposServicioListPage;
