import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Paper, TableContainer, useTheme, useMediaQuery, Alert, AlertTitle, Chip, InputAdornment, TextField } from '@mui/material';
import { Add, Visibility, Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import type { Lote } from '../../domain/interfaces/lote.interface';
import { LoteRepository } from '../../infrastructure/repositories/lote.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const LoteListPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const [searchText, setSearchText] = useState('');
    const [lotes, setLotes] = useState<Lote[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);

    const columns = [
        { id: 'codigo_lote', name: 'Código', format: (value: string, row: Lote) => value ?? row.id?.slice(0, 8) },
        { id: 'producto', name: 'Producto', format: (_value: any, row: Lote) => row.variante?.producto_nombre ?? row.variante?.producto_id ?? row.variante_id },
        { id: 'sucursal', name: 'Sucursal', format: (_value: any, row: Lote) => <Chip variant='filled' color='primary' label={row.sucursal?.nombre ?? row.sucursal_id} size="small" /> },
        { id: 'cantidad_inicial', name: 'Cantidad inicial' },
        { id: 'cantidad_actual', name: 'Cantidad actual' },
        { id: 'fecha_vencimiento', name: 'Fecha vigencia', format: (value: string) => value ? new Date(value).toLocaleDateString() : 'Sin fecha' },
        { id: 'precio_venta', name: 'Precio venta', format: (value: number) => `S/ ${value.toFixed(2)}` },
        { id: 'activo', name: 'Estado', format: (value: boolean) => <Chip variant='outlined' color={value ? 'success' : 'error'} label={value ? 'Activo' : 'Inactivo'} size="small" /> }
    ];

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/lotes/${row.id}`),
        },
    ];

    const fetchLotes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await LoteRepository.listar(limit, offset);
            // response is PaginatedResponse<Lote>
            console.log("response:", response);
            setLotes(response.data ?? []);
            setTotal(response.meta?.total ?? response.count ?? 0);
        } catch (error) {
            console.error("Error al obtener lotes:", error);
        } finally {
            setLoading(false);
        }
    }, [limit, offset]);

    useEffect(() => {
        fetchLotes();
    }, [fetchLotes]);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Informacion</AlertTitle>
                En este módulo puedes administrar los lotes, agregar nuevos registros y revisar el inventario completo de tu negocio.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems="center" gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar lotes"
                    placeholder="Ej: Producto, ID, sucursal"
                    value={searchText}
                    onChange={(event) => setSearchText(event.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button variant="contained" fullWidth={isMobile} startIcon={<Add />} onClick={() => navigate('/lotes/crear')}>
                    Agregar lote
                </Button>
            </Box>

            <TableContainer>
                {loading ? (
                    <Loading />
                ) : (
                    <ListTable
                        data={lotes}
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
                )}
            </TableContainer>
        </Box>
    );
};

export default LoteListPage;
