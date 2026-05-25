import useMediaQuery from '@mui/material/useMediaQuery';
import { Add, Edit, Visibility } from '@mui/icons-material';
import { Box, Button, CircularProgress, Paper, TableContainer, useTheme } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import { toast } from 'sonner';

const ServiciosListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const [servicios, setServicios] = useState<Servicio[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'id', name: 'Servicio' },
        { id: 'vehiculo_id', name: 'Vehículo' },
        { id: 'tipo_servicio_id', name: 'Tipo de servicio' },
        { id: 'estado', name: 'Estado' },
        { id: 'total', name: 'Total', format: (value: any) => value != null ? `$${Number(value).toFixed(2)}` : '$0.00' },
        { id: 'created_at', name: 'Fecha' }
    ];

    const fetchServicios = useCallback(async () => {
        setLoading(true);
        try {
            const response = await servicioRepository.listar(limit, offset);
            setServicios(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar los servicios');
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchServicios();
    }, [fetchServicios]);

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />, 
            color: 'gray',
            onClick: (row: any) => navigate(`/servicios/${row.id}`)
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />, 
            color: 'primary.main',
            onClick: (row: any) => navigate(`/servicios/${row.id}/editar`)
        }
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" gap={2} mb={2} component={Paper} p={2}>
                <Box>
                    <Box component="h1" sx={{ m: 0, fontSize: 24, fontWeight: 700 }}>Servicios</Box>
                    <Box color="text.secondary">Administra la recepción, estado y detalle de los servicios en taller.</Box>
                </Box>
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/servicios/nuevo')}>
                    Nuevo servicio
                </Button>
            </Box>

            <TableContainer >
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={5}><CircularProgress /></Box>
                ) : (
                    <ListTable
                        data={servicios}
                        columns={columns}
                        actions={actions}
                        pagination={{
                            total,
                            limit,
                            offset,
                            onPageChange: (page) => setSearchParams({ limit: limit.toString(), offset: String(page * limit) }),
                            onRowsPerPageChange: (newLimit) => setSearchParams({ limit: String(newLimit), offset: '0' })
                        }}
                    />
                )}
            </TableContainer>
        </Box>
    );
};

export default ServiciosListPage;
