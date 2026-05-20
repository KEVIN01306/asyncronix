import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Card, CardContent, Divider, FormControl, Grid, IconButton, InputLabel, MenuItem, Paper, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography, Autocomplete, CircularProgress } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { ventaRepository } from '../../infrastructure/venta.repository';
import { ProductoRepository } from '../../../productos/infrastructure/repositories/producto.repository';
import type { EstadoVenta, MetodoPago, VentaForm, VentaProductoInput } from '../../domain/interfaces/venta.interface';
import type { Producto } from '../../../productos/domain/interfaces/producto.interface';

export default function VentaFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [clienteId, setClienteId] = useState<string>('');
    const [metodoPago, setMetodoPago] = useState<MetodoPago>('EFECTIVO');
    const [estado, setEstado] = useState<EstadoVenta>('PENDIENTE');
    const [productosSeleccionados, setProductosSeleccionados] = useState<VentaProductoInput[]>([]);

    const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
    const [searchProductoLoading, setSearchProductoLoading] = useState(false);

    // Autocomplete state
    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [cantidadAgregar, setCantidadAgregar] = useState<number>(1);

    useEffect(() => {
        cargarProductosDisponibles();
        if (isEdit) {
            cargarVenta();
        }
    }, [isEdit, id]);

    const cargarProductosDisponibles = async () => {
        try {
            setSearchProductoLoading(true);
            const res = await ProductoRepository.listar(100, 0); // Traemos hasta 100 productos para buscar
            setProductosDisponibles(res.data);
        } catch (error) {
            toast.error("Error al cargar productos disponibles");
        } finally {
            setSearchProductoLoading(false);
        }
    };

    const cargarVenta = async () => {
        try {
            setLoading(true);
            const res = await ventaRepository.obtener(id!);
            const v = res.data;
            setClienteId(v.cliente_id || '');
            setMetodoPago(v.metodo_pago);
            setEstado(v.estado);

            // Reconstruct products (Grouping by product logic not strictly needed if we just list them)
            // But we need to allow editing. For simplicity we assume each detail is a product.
            const prodsMap = new Map<string, VentaProductoInput>();
            for (const d of v.detalles) {
                // Warning: we don't have producto_id in detalle directly.
                // If editing is requested, it's very tricky without producto_id.
                // However, the backend ACTUALIZAR requires producto_id. 
                // Let's rely on name matching for now or a workaround, or disable product editing if it's too complex.
                // Wait! Lote has producto_id in backend but it's not exposed in VentaDetalleSimple.
                // For this SaaS, typically editing products of an existing sale is rare, but if needed we'll just inform the user.
            }
            // For now, if editing, we might not populate the product list perfectly unless backend exposes `producto_id` in `detalles`.
            // Let's assume editing is mainly for status/payment. If they want to edit products, they should anular and recreate.
            toast.info("La edición de productos en una venta ya registrada podría requerir anularla y crear una nueva.", { autoClose: 5000 });
        } catch (error) {
            toast.error("Error al cargar la venta");
            navigate('/ventas');
        } finally {
            setLoading(false);
        }
    };

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

    const handleGuardar = async () => {
        if (productosSeleccionados.length === 0 && !isEdit) {
            toast.warning("Debe agregar al menos un producto a la venta");
            return;
        }

        try {
            setSaving(true);
            const data: VentaForm = {
                cliente_id: clienteId || null,
                estado,
                metodo_pago: metodoPago,
                productos: productosSeleccionados
            };

            if (isEdit) {
                // If editing and no products, maybe we are just changing status.
                // The backend requires `productos` only if we want to replace them.
                // We will send it only if there are products selected.
                const payload = productosSeleccionados.length > 0 ? data : { ...data, productos: undefined } as any;
                await ventaRepository.actualizar(id!, payload);
                toast.success("Venta actualizada exitosamente");
            } else {
                await ventaRepository.registrar(data);
                toast.success("Venta registrada exitosamente");
            }
            navigate('/ventas');
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Error al guardar la venta");
        } finally {
            setSaving(false);
        }
    };

    const totalVenta = productosSeleccionados.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

    if (loading) return <Box display="flex" justifyContent="center" p={4}><CircularProgress /></Box>;

    return (
        <Box>
            <Box display="flex" alignItems="center" gap={2} mb={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')}>
                    Volver
                </Button>
                <Typography variant="h4" fontWeight="bold">
                    {isEdit ? 'Editar Venta' : 'Nueva Venta'}
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Datos de la Venta</Typography>
                            <Divider sx={{ mb: 2 }} />

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Estado</InputLabel>
                                <Select
                                    value={estado}
                                    label="Estado"
                                    onChange={(e) => setEstado(e.target.value as EstadoVenta)}
                                    disabled={estado === 'COMPLETADA' || estado === 'ANULADA'}
                                >
                                    <MenuItem value="PENDIENTE">PENDIENTE</MenuItem>
                                    <MenuItem value="COMPLETADA">COMPLETADA</MenuItem>
                                </Select>
                            </FormControl>

                            <FormControl fullWidth margin="normal">
                                <InputLabel>Método de Pago</InputLabel>
                                <Select
                                    value={metodoPago}
                                    label="Método de Pago"
                                    onChange={(e) => setMetodoPago(e.target.value as MetodoPago)}
                                >
                                    <MenuItem value="EFECTIVO">EFECTIVO</MenuItem>
                                    <MenuItem value="TARJETA_CREDITO">TARJETA_CREDITO</MenuItem>
                                    <MenuItem value="TARJETA_DEBITO">TARJETA_DEBITO</MenuItem>
                                    <MenuItem value="TRANSFERENCIA">TRANSFERENCIA</MenuItem>
                                    <MenuItem value="OTROS">OTROS</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Cliente Input (can be extended to a real Client search if Clients module exists) */}
                            <TextField
                                fullWidth
                                margin="normal"
                                label="ID del Cliente (Opcional)"
                                value={clienteId}
                                onChange={(e) => setClienteId(e.target.value)}
                                helperText="Deje en blanco para Consumidor Final"
                            />

                            <Box mt={4}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    fullWidth
                                    onClick={handleGuardar}
                                    disabled={saving || estado === 'ANULADA'}
                                >
                                    {saving ? 'Guardando...' : 'Guardar Venta'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Productos de la Venta</Typography>

                            <Box display="flex" gap={2} mb={3} alignItems="center">
                                <Autocomplete
                                    sx={{ flexGrow: 1 }}
                                    options={productosDisponibles}
                                    getOptionLabel={(option) => `${option.nombre} (Stock: ${option.stock_total}) - $${option.precio_sugerido}`}
                                    value={productoSeleccionado}
                                    onChange={(_e, newValue) => setProductoSeleccionado(newValue)}
                                    loading={searchProductoLoading}
                                    renderInput={(params) => (
                                        <TextField {...params} label="Buscar Producto" variant="outlined" />
                                    )}
                                />
                                <TextField
                                    type="number"
                                    label="Cant."
                                    sx={{ width: 80 }}
                                    value={cantidadAgregar}
                                    onChange={(e) => setCantidadAgregar(parseInt(e.target.value) || 0)}
                                    inputProps={{ min: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleAgregarProducto}
                                    disabled={!productoSeleccionado}
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
                                                <TableCell align="right">${prod.precio_sugerido?.toFixed(2)}</TableCell>
                                                <TableCell align="right">${prod.subtotal?.toFixed(2)}</TableCell>
                                                <TableCell align="center">
                                                    <IconButton color="error" onClick={() => handleEliminarProducto(index)} size="small">
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
                                    <Typography variant="h5" fontWeight="bold">Total Calculado: ${totalVenta.toFixed(2)}</Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Box>
    );
}
