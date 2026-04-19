import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, CircularProgress, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle } from '@mui/material';
import { Add, Edit, Visibility,Search } from '@mui/icons-material';
import { proveedorRepository } from '../../infrastructure/repositories/proveedor.repository';
import type { Proveedor } from '../../domain/interfaces/proveedor.interface';
import ListTable from '../../../../shared/components/ui/tables/ListTable';


const ProveedoresListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [proveedores, setProveedores] = useState<Proveedor[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'nombre', name: 'Nombre', format: (value: any) => value.toUpperCase() },
        { id: 'telefono', name: 'Teléfono' },
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/proveedores/${row.id}`),
        },
        {
            name: 'Editar',
            icon: <Edit fontSize="small" />,
            color: 'blue',
            onClick: (row: any) => navigate(`/proveedores/${row.id}/editar`),
        },
    ];

    const fetchProveedores = useCallback(async () => {
        setLoading(true);
        try {
            const response = await proveedorRepository.listar(limit, offset);
            setProveedores(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchProveedores();
    }, [fetchProveedores]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                En este modulo puedes administrar tus proveedores, agregar nuevos, editar su información o eliminarlos. Mantén tu lista de proveedores actualizada para una mejor gestión de tu negocio.
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
                    label="Buscar proveedores"
                    placeholder="Ej: Juan Pérez"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/proveedores/nuevo')}>
                    Nuevo Proveedor
                </Button>
            </Box>

            <TableContainer >
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <>
                        <ListTable
                            data={proveedores}
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

export default ProveedoresListPage;