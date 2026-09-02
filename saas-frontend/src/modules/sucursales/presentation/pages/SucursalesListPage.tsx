import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, TextField, InputAdornment, Alert, AlertTitle, Chip } from '@mui/material';
import { Add, Edit, Visibility,Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Sucursal } from '../../domain/interfaces/sucursal.interface';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useDebounce } from '../../../../core/hooks/useDebounce';


const SucursalesListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const qParam = searchParams.get('q') || '';

    const [sucursales, setSucursales] = useState<Sucursal[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState(qParam);
    const debouncedQuery = useDebounce(searchQuery, 300);
    const abortRef = useRef<AbortController | null>(null);

    const columns = [
        { id: 'nombre', name: 'Nombre', format: (value: any) => value?.toUpperCase() || '' },
        { id: 'direccion', name: 'Dirección' },
        { id: 'ubicacion', name: 'Ubicación', format: (_: any, row: any) => row.division_nivel_2 ? `${row.division_nivel_2.nombre}, ${row.division_nivel_2.division_nivel_1.nombre}` : 'N/A' },
        { id: 'codigo_establecimiento', name: 'Establecimiento', format: (value: any) => value || 'N/A' },
        { id: 'es_principal', name: 'Principal', format: (value: any) => <Chip color={value ? 'primary' : 'default'} size="small" label={value ? 'Sí' : 'No'} /> }
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

    const fetchSucursales = useCallback(async (q?: string) => {
        setLoading(true);
        try {
            if (abortRef.current) abortRef.current.abort();
            const controller = new AbortController();
            abortRef.current = controller;
            const response = await sucursalRepository.listar(limit, offset, q, controller.signal);
            setSucursales(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            if ((error as any)?.name === 'CanceledError' || (error as any)?.message === 'canceled') {
                // request aborted
                return;
            }
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    // Effect 1: Fetch data when query, pagination changes
    useEffect(() => {
        fetchSucursales(debouncedQuery || undefined);
    }, [debouncedQuery, limit, offset, fetchSucursales]);

    // Effect 2: Sync URL params separately to avoid loading flash
    useEffect(() => {
        const params: any = { limit: limit.toString(), offset: offset.toString() };
        if (debouncedQuery) params.q = debouncedQuery;
        setSearchParams(params);
    }, [debouncedQuery, limit, offset, setSearchParams]);

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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
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
                        <Loading/>                
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