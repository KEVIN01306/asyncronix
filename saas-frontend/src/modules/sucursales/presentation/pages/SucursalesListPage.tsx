import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, CircularProgress, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip } from '@mui/material';
import { Add, Edit, Visibility,Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Sucursal } from '../../domain/interfaces/sucursal.interface';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';


const SucursalesListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Nombre', format: (value: any) => value.toUpperCase() },
        { id: 'direccion', name: 'Dirección' },
        { id: 'es_principal', name: 'Principal', format: (value: any) => <Chip color='primary' label={value ? 'Sí' : 'No'} /> }
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/sucursales/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/sucursales/${row.id}/editar`),
        },
    ];

    const fetchSucursales = useCallback(async () => {
        setLoading(true);
        try {
            const response = await sucursalRepository.listar(limit, offset);
            setSucursales(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchSucursales();
    }, [fetchSucursales]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                            En este modulo puedes administrar tus sucursales, agregar nuevas, editar su información o eliminarlas. Mantén tu lista de sucursales actualizada para una mejor gestión de tu negocio.
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
                    label="Buscar Sucursal"
                    placeholder="Ej: Sucursal Centro"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/sucursales/nuevo')}>
                    Nueva sucursal
                </Button>
            </Box>

            <TableContainer >
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <>
                        <ListTable
                            data={sucursales}
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
};

export default SucursalesListPage;