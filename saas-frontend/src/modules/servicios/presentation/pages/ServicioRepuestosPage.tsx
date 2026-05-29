import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Autocomplete, Box, Button, CircularProgress, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, Typography, Stack } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import { toast } from 'sonner';
import { ProductoRepository } from '../../../productos/infrastructure/repositories/producto.repository';
import type { Producto } from '../../../productos/domain/interfaces/producto.interface';

export default function ServicioRepuestosPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState<any | null>(null);
    const [productos, setProductos] = useState<Producto[]>([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [cantidad, setCantidad] = useState<number>(1);
    const [loadingProductos, setLoadingProductos] = useState(false);
    const [saving, setSaving] = useState(false);
    const user = useAuthStore((s: any) => s.user);

    useEffect(() => {
        if (!id) return;
        const fetchService = async () => {
            try {
                const res = await servicioRepository.obtener(id);
                setServicio(res);
            } catch {
                toast.error('Error al cargar servicio');
                navigate('/servicios');
            }
        };
        fetchService();
    }, [id, navigate]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoadingProductos(true);
                const response = await ProductoRepository.listar(100, 0);
                setProductos(response.data);
            } catch {
                toast.error('Error al cargar productos');
            } finally {
                setLoadingProductos(false);
            }
        };
        fetchProducts();
    }, []);

    const canEdit = user?.permisos?.includes('EDITAR_SERVICIOS') && user?.permisos?.includes('EDITAR_SERVICIOS_REPUESTOS');

    if (!servicio) return <Loading />;
    const totalRepuestos = (servicio.repuestos_inventario ?? []).reduce((s: number, r: any) => s + ((r.precio_venta ?? 0) * (r.cantidad ?? 0)), 0);

    const handleAdd = async () => {
        if (!canEdit) return toast.error('Permisos insuficientes');
        if (!productoSeleccionado) return toast.error('Producto requerido');
        if (!user?.sucursal_id) return toast.error('Sucursal no disponible');
        if (cantidad <= 0) return toast.error('Cantidad debe ser mayor que cero');

        try {
            setSaving(true);
            const payload = { producto_id: productoSeleccionado.id, cantidad, sucursal_id: user.sucursal_id };
            await servicioRepository.crearRepuesto(servicio.id, payload);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            setProductoSeleccionado(null);
            setCantidad(1);
            toast.success('Repuesto agregado');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al agregar repuesto');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (repId: string) => {
        if (!canEdit) return toast.error('Permisos insuficientes');
        if (!user?.sucursal_id) return toast.error('Sucursal no disponible');

        try {
            await servicioRepository.eliminarRepuesto(servicio.id, repId, user.sucursal_id);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            toast.success('Repuesto eliminado');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al eliminar repuesto');
        }
    };

    return (
        <Box p={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/servicios/${servicio.id}`)} sx={{ mb: 2 }}>{'Volver'}</Button>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" mb={2}>Agregar repuesto al servicio</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                    <Autocomplete
                        options={productos}
                        getOptionLabel={(option) => `${option.nombre} (${option.sku}) - Stock: ${option.stock_total}`}
                        value={productoSeleccionado}
                        onChange={(_event, newValue) => setProductoSeleccionado(newValue)}
                        loading={loadingProductos}
                        isOptionEqualToValue={(option, value) => option.id === value.id}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Buscar repuesto"
                                variant="outlined"
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {loadingProductos ? <CircularProgress color="inherit" size={20} /> : null}
                                            {params.InputProps.endAdornment}
                                        </>
                                    )
                                }}
                            />
                        )}
                        sx={{ width: 1, flex: 1 }}
                        disabled={!canEdit}
                    />
                    <TextField
                        label="Cantidad"
                        type="number"
                        value={cantidad}
                        onChange={(e) => setCantidad(Number(e.target.value) || 0)}
                        size="small"
                        sx={{ width: 120 }}
                        disabled={!canEdit}
                    />
                    <Button variant="contained" onClick={handleAdd} disabled={!canEdit || saving}>
                        {saving ? 'Guardando...' : 'Agregar'}
                    </Button>
                </Stack>
            </Paper>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ backgroundColor: 'primary.main' }}>
                            <TableRow>
                                <TableCell > <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Producto</Typography></TableCell>
                                <TableCell align="right"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Cantidad</Typography></TableCell>
                                <TableCell align="right"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Precio</Typography></TableCell>
                                <TableCell align="right"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Subtotal</Typography></TableCell>
                                <TableCell align="center"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {(servicio.repuestos_inventario ?? []).map((r: any) => (
                                <TableRow key={r.id}>
                                    <TableCell>{r.producto?.nombre || r.lote_id}</TableCell>
                                    <TableCell align="right">{r.cantidad}</TableCell>
                                    <TableCell align="right">{r.precio_venta.toFixed(2)}</TableCell>
                                    <TableCell align="right">{(r.precio_venta * r.cantidad).toFixed(2)}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            color="error"
                                            onClick={() => handleDelete(r.id)}
                                            disabled={!canEdit}
                                            startIcon={<DeleteIcon />}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {(servicio.repuestos_inventario ?? []).length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        <Typography color="text.secondary">No hay repuestos agregados</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                <TableCell colSpan={3} align="right">
                                    <Typography fontWeight={700}>Total</Typography>
                                </TableCell>
                                
                                <TableCell align="right">
                                    <Typography fontWeight={700}>{totalRepuestos.toFixed(2)}</Typography>
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
}
