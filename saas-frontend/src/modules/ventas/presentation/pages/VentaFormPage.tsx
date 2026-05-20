import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Card, CardContent, Divider, FormControl, IconButton, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Autocomplete, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { ventaRepository } from '../../infrastructure/venta.repository';
import { ProductoRepository } from '../../../productos/infrastructure/repositories/producto.repository';
import type { EstadoVenta, MetodoPago, VentaProductoInput, VentaDetalleSimple } from '../../domain/interfaces/venta.interface';
import type { Producto } from '../../../productos/domain/interfaces/producto.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';

type FormValues = {
    cliente_id: string;
    metodo_pago: MetodoPago;
    estado: EstadoVenta;
};

export default function VentaFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isEdit = Boolean(id);
    const user = useAuthStore(state => state.user);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [productosSeleccionados, setProductosSeleccionados] = useState<VentaProductoInput[]>([]);
    const { control, register, handleSubmit, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            cliente_id: '',
            metodo_pago: 'EFECTIVO',
            estado: 'PENDIENTE'
        }
    });

    const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
    const [searchProductoLoading, setSearchProductoLoading] = useState(false);

    // Autocomplete state
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [cantidadAgregar, setCantidadAgregar] = useState<number>(1);

    const estado = watch('estado') as EstadoVenta;
    const isEditable = !id || estado === 'PENDIENTE';

    const cargarProductosDisponibles = useCallback(async () => {
        try {
            setSearchProductoLoading(true);
            const res = await ProductoRepository.listar(100, 0); // Traemos hasta 100 productos para buscar
            setProductosDisponibles(res.data);
        } catch {
            toast.error("Error al cargar productos disponibles");
        } finally {
            setSearchProductoLoading(false);
        }
    }, []);

    const agruparDetalles = (detalles: VentaDetalleSimple[]) => {
        const agrupado = new Map<string, VentaProductoInput>();

        detalles.forEach((detalle) => {
            const productoId = detalle.producto_id ?? detalle.lote_id ?? detalle.id;
            const precio = detalle.precio_unitario;
            const cantidad = detalle.cantidad;
            const nombre = detalle.descripcion;

            const existente = agrupado.get(productoId);
            if (existente) {
                existente.cantidad += cantidad;
                existente.subtotal = existente.cantidad * (existente.precio_sugerido ?? precio);
            } else {
                agrupado.set(productoId, {
                    producto_id: productoId,
                    cantidad,
                    nombre,
                    precio_sugerido: precio,
                    subtotal: cantidad * precio
                });
            }
        });

        return Array.from(agrupado.values());
    };

    const cargarVenta = useCallback(async () => {
        try {
            setLoading(true);
            const res = await ventaRepository.obtener(id!);
            const venta = res.data;
            setValue('cliente_id', venta.cliente_id || '');
            setValue('metodo_pago', venta.metodo_pago);
            setValue('estado', venta.estado);
            setProductosSeleccionados(agruparDetalles(venta.detalles));
        } catch {
            toast.error('Error al cargar la venta');
            navigate('/ventas');
        } finally {
            setLoading(false);
        }
    }, [id, navigate, setValue]);

    useEffect(() => {
        cargarProductosDisponibles();
        if (isEdit) {
            cargarVenta();
        }
    }, [isEdit, cargarProductosDisponibles, cargarVenta]);

    const handleAgregarProducto = () => {
        if (!productoSeleccionado) return;
        if (cantidadAgregar <= 0) {
            toast.warning("La cantidad debe ser mayor a 0");
            return;
        }

        const index = productosSeleccionados.findIndex(p => p.producto_id === productoSeleccionado.id);
        if (index >= 0) {
            const nuevos = [...productosSeleccionados];
            nuevos[index].cantidad += cantidadAgregar;
            nuevos[index].subtotal = nuevos[index].cantidad * (nuevos[index].precio_sugerido || 0);
            setProductosSeleccionados(nuevos);
        } else {
            setProductosSeleccionados([...productosSeleccionados, {
                producto_id: productoSeleccionado.id,
                cantidad: cantidadAgregar,
                nombre: productoSeleccionado.nombre,
                precio_sugerido: productoSeleccionado.precio_sugerido,
                subtotal: cantidadAgregar * productoSeleccionado.precio_sugerido
            }]);
        }

        setProductoSeleccionado(null);
        setCantidadAgregar(1);
    };

    const handleEliminarProducto = (index: number) => {
        const nuevos = [...productosSeleccionados];
        nuevos.splice(index, 1);
        setProductosSeleccionados(nuevos);
    };

    const onSubmit = async (formData: FormValues) => {
        if (!isEdit && productosSeleccionados.length === 0) {
            toast.warning('Debe agregar al menos un producto a la venta');
            return;
        }

        if (!user?.sucursal_id) {
            toast.error('No se pudo determinar la sucursal del usuario');
            return;
        }

        try {
            setSaving(true);

            const payload: any = {
                sucursal_id: user.sucursal_id,
                cliente_id: formData.cliente_id || null,
                metodo_pago: formData.metodo_pago,
                estado: formData.estado
            };

            if (productosSeleccionados.length > 0) {
                payload.productos = productosSeleccionados.map((p) => ({
                    producto_id: p.producto_id,
                    cantidad: p.cantidad
                }));
            }

            if (isEdit) {
                await ventaRepository.actualizar(id!, payload);
                toast.success('Venta actualizada exitosamente');
            } else {
                await ventaRepository.registrar(payload);
                toast.success('Venta registrada exitosamente');
            }
            navigate('/ventas');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar la venta');
        } finally {
            setSaving(false);
        }
    };

    const totalVenta = productosSeleccionados.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    return (
        <Box p={isMobile ? 2 : 4}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                    {isEdit ? 'Editar Venta' : 'Nueva Venta'}
                </Typography>
            </Paper>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }} gap={3}>
                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Datos de la Venta</Typography>
                            <Divider sx={{ mb: 2 }} />
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Estado</InputLabel>
                                <Controller
                                    name="estado"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Estado"
                                            disabled={!isEdit || !isEditable}
                                        >
                                            <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                                            <MenuItem value="COMPLETADA">COMPLETADA</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Método de Pago</InputLabel>
                                <Controller
                                    name="metodo_pago"
                                    control={control}
                                    render={({ field }) => (
                                        <Select
                                            {...field}
                                            label="Método de Pago"
                                            disabled={!isEditable}
                                        >
                                            <MenuItem value="EFECTIVO">EFECTIVO</MenuItem>
                                            <MenuItem value="TARJETA">TARJETA</MenuItem>
                                            <MenuItem value="TRANSFERENCIA">TRANSFERENCIA</MenuItem>
                                            <MenuItem value="OTRO">OTRO</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="ID del Cliente (Opcional)"
                                {...register('cliente_id')}
                                helperText="Deje en blanco para Consumidor Final"
                                disabled={!isEditable}
                            />
                            <Box mt={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleSubmit(onSubmit)}
                                    disabled={saving || !isEditable}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Venta'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Productos de la Venta</Typography>
                            <Box display="flex" gap={2} mb={3} alignItems="center">
                                <Autocomplete
                                    sx={{ flexGrow: 1 }}
                                    options={productosDisponibles}
                                    getOptionLabel={(option) => `${option.nombre} (Stock: ${option.stock_total}) - ${formatMoney(option.precio_sugerido)}`}
                                    value={productoSeleccionado}
                                    onChange={(_e, newValue) => setProductoSeleccionado(newValue)}
                                    loading={searchProductoLoading}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Buscar Producto" variant="outlined" />
                                    )}
                                    disabled={!isEditable}
                                />
                                <TextField
                                    type="number"
                                    label="Cant."
                                    sx={{ width: 80 }}
                                    value={cantidadAgregar}
                                    onChange={(e) => setCantidadAgregar(parseInt(e.target.value) || 0)}
                                    inputProps={{ min: 1 }}
                                    disabled={!isEditable}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleAgregarProducto}
                                    disabled={!productoSeleccionado || !isEditable}
                                >
                                    Agregar
                                </Button>
                            </Box>
                            <TableContainer component={Paper} variant="outlined" elevation={0}>
                                <Table>
                                    <TableHead sx={{ bgcolor: 'background.default' }}>
                                        <TableRow>
                                            <TableCell><strong>Producto</strong></TableCell>
                                            <TableCell align="right"><strong>Cant.</strong></TableCell>
                                            <TableCell align="right"><strong>Precio Unit.</strong></TableCell>
                                            <TableCell align="right"><strong>Subtotal</strong></TableCell>
                                            <TableCell align="center"><strong>Acción</strong></TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {productosSeleccionados.map((prod, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{prod.nombre}</TableCell>
                                                <TableCell align="right">{prod.cantidad}</TableCell>
                                                <TableCell align="right">{formatMoney(prod.precio_sugerido || 0)}</TableCell>
                                                <TableCell align="right">{formatMoney(prod.subtotal || 0)}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton color="error" onClick={() => handleEliminarProducto(index)} size="small" disabled={!isEditable}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {productosSeleccionados.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={5} align="center">
                                                    No se han agregado productos a la venta
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {productosSeleccionados.length > 0 && (
                                <Box display="flex" justifyContent="flex-end" mt={3}>
                                    <Typography variant="h5" fontWeight="bold">Total Calculado: {formatMoney(totalVenta)}</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Box>
            </Box>
        </Box>
    );
}
