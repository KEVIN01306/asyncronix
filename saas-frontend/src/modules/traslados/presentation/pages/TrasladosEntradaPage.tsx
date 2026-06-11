import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Button,
    Paper,
    TableContainer,
    CircularProgress,
    useTheme,
    useMediaQuery,
    TextField,
    InputAdornment,
    Alert,
    AlertTitle,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';
import { Visibility, Download, Search } from '@mui/icons-material';
import ListTable from '../../../../shared/components/ui/tables/ListTable';
import { useAuthStore } from '../../../../core/store/authStore';
import { trasladoRepository } from '../../infrastructure/traslado.repository';
import type { TrasladoDetalle, EstadoTraslado } from '../../domain/interfaces/traslado.interface';

const ESTADO_COLORS: Record<EstadoTraslado, 'default' | 'warning' | 'success' | 'error'> = {
    PENDIENTE: 'warning',
    COMPLETADO: 'success',
    CANCELADO: 'error',
};

export const TrasladosEntradaPage = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [searchParams, setSearchParams] = useSearchParams();
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    const user = useAuthStore((state) => state.user);
    const [traslados, setTraslados] = useState<TrasladoDetalle[]>([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [selectedTraslado, setSelectedTraslado] = useState<TrasladoDetalle | null>(null);
    const [openReceiveDialog, setOpenReceiveDialog] = useState(false);
    const [receiveLoading, setReceiveLoading] = useState(false);

    const columns = [
        { 
            id: 'consecutivo', 
            name: 'Guía', 
            format: (value: any) => `#${value}` 
        },
        { 
            id: 'origen', 
            name: 'Origen', 
            format: (value: any) => value?.nombre || '-' 
        },
        { 
            id: 'creador', 
            name: 'Creador', 
            format: (value: any) => value?.nombre || '-' 
        },
        { 
            id: 'estado', 
            name: 'Estado', 
            format: (value: EstadoTraslado) => (
                <Chip 
                    label={value} 
                    color={ESTADO_COLORS[value]} 
                    size="small" 
                />
            ) 
        },
        { 
            id: 'created_at', 
            name: 'Fecha', 
            format: (value: any) => new Date(value).toLocaleDateString() 
        },
    ];

    const fetchTraslados = useCallback(async () => {
        if (!user?.sucursal_id) return;
        setLoading(true);
        try {
            const response = await trasladoRepository.listarPorDestino(user.sucursal_id, limit, offset);
            setTraslados(response.data);
            setTotal(response.meta.total);
        } catch (error) {
            console.error('Error al cargar traslados de entrada:', error);
        } finally {
            setLoading(false);
        }
    }, [user?.sucursal_id, limit, offset]);

    useEffect(() => {
        fetchTraslados();
    }, [fetchTraslados]);

    const handleRecibir = async () => {
        if (!selectedTraslado) return;
        setReceiveLoading(true);
        try {
            await trasladoRepository.recibir(selectedTraslado.id);
            setOpenReceiveDialog(false);
            setSelectedTraslado(null);
            await fetchTraslados();
        } catch (error) {
            console.error('Error al recibir traslado:', error);
        } finally {
            setReceiveLoading(false);
        }
    };

    const actions = [
        {
            name: 'Ver',
            icon: <Visibility fontSize="small" />,
            color: 'gray',
            onClick: (row: any) => navigate(`/traslados/${row.id}`),
        },
        {
            name: 'Recibir',
            icon: <Download fontSize="small" />,
            color: 'green',
            onClick: (row: any) => {
                if (row.estado === 'PENDIENTE') {
                    setSelectedTraslado(row);
                    setOpenReceiveDialog(true);
                }
            },
            hidden: (row: any) => row.estado !== 'PENDIENTE',
        },
    ];

    return (
        <Box p={isMobile ? 2 : 4}>
            <Alert severity="info" sx={{ mb: 3, boxShadow: 'none', border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <AlertTitle>Información</AlertTitle>
                En este módulo puedes administrar tus traslados de entrada. Visualiza los traslados recibidos en esta sucursal, consulta detalles y completa el recibimiento de traslados pendientes.
            </Alert>

            <Box display="flex" flexDirection={isMobile ? 'column' : 'row'} justifyContent="space-between" alignItems={'center'} gap={2} mb={1}
                sx={{
                    bgcolor: 'background.paper',
                    p: 2,
                }}
                component={Paper}
            >
                <TextField
                    fullWidth
                    label="Buscar Traslado"
                    placeholder="Ej: Guía #1, Origen"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search color="primary" />
                            </InputAdornment>
                        ),
                    }}
                />
                <Box sx={{ minWidth: isMobile ? 'auto' : '200px' }} />
            </Box>

            <TableContainer>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={5}><CircularProgress /></Box>
                ) : (
                    <>
                        <ListTable
                            data={traslados}
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

            <Dialog open={openReceiveDialog} onClose={() => setOpenReceiveDialog(false)}>
                <DialogTitle>Recibir Traslado</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        ¿Está seguro de que desea recibir el traslado #{selectedTraslado?.consecutivo}? Los lotes se agregarán al inventario de esta sucursal.
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenReceiveDialog(false)}>Cancelar</Button>
                    <Button
                        onClick={handleRecibir}
                        color="success"
                        variant="contained"
                        disabled={receiveLoading}
                    >
                        {receiveLoading ? <CircularProgress size={24} /> : 'Sí, Recibir'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TrasladosEntradaPage;
