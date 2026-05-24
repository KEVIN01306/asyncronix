import useMediaQuery from "@mui/material/useMediaQuery";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import { Add, Edit, Visibility, Delete } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, CircularProgress, InputAdornment, Paper, TableContainer, TextField, useTheme } from "@mui/material";
import ListTable from "../../../../shared/components/ui/tables/ListTable";
import { OpcionServicioRepository } from "../../infrastructure/repositories/opcion-servicio.repository";
import type { OpcionServicio } from "../../domain/interfaces/opcion-servicio.interface";
import { toast } from "sonner";

const OpcionesServicioListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const [opciones, setOpciones] = useState<OpcionServicio[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Opción de servicio' },
        { id: 'descripcion', name: 'Descripción' },
    ];

    const fetchOpciones = useCallback(async () => {
        setLoading(true);
        try {
            const response = await OpcionServicioRepository.listar(limit, offset);
            setOpciones(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchOpciones();
    }, [fetchOpciones]);

    const handleDelete = async (id: string) => {
        try {
            await OpcionServicioRepository.eliminar(id);
            toast.success('Opción de servicio eliminada correctamente');
            fetchOpciones();
        } catch (error) {
            console.error(error);
            toast.error('No se pudo eliminar la opción de servicio');
        }
    };

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/opciones-servicio/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'primary.main',
            onClick: (row: any) => navigate(`/opciones-servicio/${row.id}/editar`),
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
                Aquí puedes crear, editar y eliminar las opciones de servicio que uses en tus tipos de servicio.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{ bgcolor: 'background.paper', p: 2 }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar opciones"
                    placeholder="Ej: Cambio de aceite"
                    InputProps={{ startAdornment: (<InputAdornment position="start"><Add color="primary" /></InputAdornment>) }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/opciones-servicio/nuevo')}>
                    Nueva opción
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <ListTable
                        data={opciones}
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

export default OpcionesServicioListPage;
