import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Box, Button, Card, CardContent, Divider, FormControl, InputLabel, IconButton, MenuItem, Paper, Select, TextField, Typography, Autocomplete, useTheme, useMediaQuery } from '@mui/material';
import { ArrowBack as ArrowBackIcon, QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { ventaRepository } from '../../infrastructure/venta.repository';
import SaleClientModal from '../components/SaleClientModal';
import SalePaymentModal from '../components/SalePaymentModal';
import { ProductoRepository } from '../../../productos/infrastructure/repositories/producto.repository';
import type { EstadoVenta, MetodoPago, VentaProductoInput, VentaDetalleSimple } from '../../domain/interfaces/venta.interface';
import type { Producto } from '../../../productos/domain/interfaces/producto.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';
import SaleProductsTable from '../components/SaleProductsTable';
import SaleSummary from '../components/SaleSummary';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import QrProductScanner from '../components/lectorSkuQr';

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
    const [ventaId, setVentaId] = useState<string | null>(null);
    const [showClientModal, setShowClientModal] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<VentaProductoInput | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const { control, register, handleSubmit, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            cliente_id: '',
            metodo_pago: 'EFECTIVO',
            estado: 'PENDIENTE'
        }
    });

    const [productosDisponibles, setProductosDisponibles] = useState<Producto[]>([]);
    const [searchProductoLoading, setSearchProductoLoading] = useState(false);

    const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);
    const [cantidadAgregar, setCantidadAgregar] = useState<number>(1);

    const estado = watch('estado') as EstadoVenta;
    const isEditable = !id || estado === 'PENDIENTE';

    const cargarProductosDisponibles = useCallback(async () => {
        try {
            setSearchProductoLoading(true);
            const res = await ProductoRepository.listar(100, 0);
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
            setVentaId(venta.id);
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

    const handleClientConfirm = async () => {
        setShowClientModal(false);
        if (!pendingProduct || !user?.sucursal_id) return;

        try {
            setSaving(true);
            const payload: any = {
                sucursal_id: user.sucursal_id,
                cliente_id: null,
                metodo_pago: 'EFECTIVO',
                estado: 'PENDIENTE',
                productos: [{ producto_id: pendingProduct.producto_id, cantidad: pendingProduct.cantidad }]
            };

            const res = await ventaRepository.registrar(payload);
            const venta = res.data;
            setVentaId(venta.id);
            setProductosSeleccionados(agruparDetalles(venta.detalles));
            toast.success('Venta creada y primer detalle agregado');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear la venta');
        } finally {
            setSaving(false);
            setPendingProduct(null);
            setProductoSeleccionado(null);
            setCantidadAgregar(1);
        }
    };

    const handleSkuLeido = async (sku: string) => {
        setShowScannerModal(false);
        if (!user?.sucursal_id) return;

        try {
            setScanLoading(true);
            if (!ventaId) {
                const productResponse = await ventaRepository.buscarPorSku(sku);
                const product = productResponse.data;
                if (!product) {
                    toast.error('No se encontró un producto con ese SKU');
                    return;
                }
                const prodInput: VentaProductoInput = {
                    producto_id: product.id,
                    cantidad: 1,
                    nombre: product.nombre,
                    precio_sugerido: product.precio_sugerido,
                    subtotal: product.precio_sugerido
                };
                setProductoSeleccionado(product);
                setPendingProduct(prodInput);
                setShowClientModal(true);
                return;
            }

            await ventaRepository.crearDetallePorSku(ventaId, sku, user.sucursal_id, 1);
            const res = await ventaRepository.obtener(ventaId);
            setProductosSeleccionados(agruparDetalles(res.data.detalles));
            toast.success('Detalle agregado por SKU');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el SKU');
        } finally {
            setScanLoading(false);
        }
    };

    const handleOpenScanner = () => {
        setShowScannerModal(true);
    };

    const handlePaymentConfirm = async (metodo: string) => {
        if (!ventaId || !user?.sucursal_id) return;
        try {
            setSaving(true);
            await ventaRepository.finalizarVenta(ventaId, user.sucursal_id, metodo);
            toast.success('Venta finalizada');
            navigate(`/ventas/${ventaId}`);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al finalizar la venta');
        } finally {
            setSaving(false);
            setShowPaymentModal(false);
        }
    };

    const handleAgregarProducto = async () => {
        if (!productoSeleccionado) return;
        if (cantidadAgregar <= 0) {
            toast.warning("La cantidad debe ser mayor a 0");
            return;
        }

        const prodInput: VentaProductoInput = {
            producto_id: productoSeleccionado.id,
            cantidad: cantidadAgregar,
            nombre: productoSeleccionado.nombre,
            precio_sugerido: productoSeleccionado.precio_sugerido,
            subtotal: cantidadAgregar * productoSeleccionado.precio_sugerido
        };

        if (!ventaId) {
            setPendingProduct(prodInput);
            setShowClientModal(true);
            return;
        }

        try {
            setSaving(true);
            await ventaRepository.crearDetalle(ventaId, { producto_id: prodInput.producto_id, cantidad: prodInput.cantidad }, user!.sucursal_id!);
            const res = await ventaRepository.obtener(ventaId);
            const venta = res.data;
            setProductosSeleccionados(agruparDetalles(venta.detalles));
            toast.success('Producto agregado a la venta');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al agregar producto');
        } finally {
            setSaving(false);
            setProductoSeleccionado(null);
            setCantidadAgregar(1);
        }
    };

    const handleEliminarProducto = (index: number) => {
        const prod = productosSeleccionados[index];
        if (!ventaId) {
            const nuevos = [...productosSeleccionados];
            nuevos.splice(index, 1);
            setProductosSeleccionados(nuevos);
            return;
        }

        (async () => {
            try {
                setSaving(true);
                const res = await ventaRepository.obtener(ventaId);
                const detalle = res.data.detalles.find((d: any) => (d.producto_id ?? d.lote_id ?? '') === prod.producto_id || d.descripcion === prod.nombre);
                if (detalle) {
                    await ventaRepository.eliminarDetalle(ventaId, detalle.id, user!.sucursal_id!);
                    const ventaRef = await ventaRepository.obtener(ventaId);
                    setProductosSeleccionados(agruparDetalles(ventaRef.data.detalles));
                    toast.success('Detalle eliminado');
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Error al eliminar detalle');
            } finally {
                setSaving(false);
            }
        })();
    };

    const onSubmit = async () => {
        if (!ventaId) {
            toast.warning('Agregue productos para crear la venta');
            return;
        }
        setShowPaymentModal(true);
    };

    const totalVenta = productosSeleccionados.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

    if (loading) return <Loading />;

    return (
        <Box p={isMobile ? 2 : 4} mx="auto" sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 2 }}>
                <Typography variant="h5" fontWeight={700}>
                    {isEdit ? 'Continuar Venta' : 'Nueva Venta'}
                </Typography>
            </Paper>

            <Box display="grid" gridTemplateColumns={{ xs: '1fr', md: '1fr 2fr' }}  gap={3}>
                <Box >
                    <Card >
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
                                            <MenuItem value="TARJETA_CREDITO">TARJETA CRÉDITO</MenuItem>
                                            <MenuItem value="TARJETA_DEBITO">TARJETA DÉBITO</MenuItem>
                                            <MenuItem value="TRANSFERENCIA">TRANSFERENCIA</MenuItem>
                                            <MenuItem value="OTROS">OTROS</MenuItem>
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
                                <Button variant="contained" color="primary" fullWidth onClick={handleSubmit(onSubmit)} disabled={saving || !isEditable}>
                                    {saving ? 'Guardando...' : ventaId ? 'Finalizar Venta' : 'Iniciar Venta'}
                                </Button>
                            </Box>
                        </CardContent>
                    </Card>
                </Box>

                <Box>
                    <Card >
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Productos de la Venta</Typography>
                            <Box
                                display="flex"
                                flexDirection={{ xs: 'column', sm: 'row' }} // En celular hacia abajo, en tablet en fila
                                gap={2}
                                mb={3}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                            >
                                <Box display="flex" gap={1} alignItems="center" width="100%">
                                    <IconButton
                                        color="primary"
                                        onClick={handleOpenScanner}
                                        disabled={!isEditable || scanLoading}
                                        sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0, height: 56, width: 56 }}
                                    >
                                        <QrCodeScannerIcon />
                                    </IconButton>

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
                                </Box>

                                <Box display="flex" gap={2} width="100%">
                                    <TextField
                                        type="number"
                                        label="Cant."
                                        sx={{ flex: 1 }}
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
                                        sx={{ flex: 2, height: 56 }} 
                                    >
                                        Agregar
                                    </Button>
                                </Box>
                            </Box>
                            <SaleProductsTable items={productosSeleccionados} onDelete={handleEliminarProducto} isEditable={isEditable} />
                            <SaleSummary total={totalVenta} clienteLabel={watch('cliente_id') || 'Consumidor Final'} onFinalize={() => setShowPaymentModal(true)} disabled={!ventaId} />
                        </CardContent>
                    </Card>
                </Box>
            </Box>
            <SaleClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onConfirm={handleClientConfirm} />
            <SalePaymentModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} onConfirm={handlePaymentConfirm} total={totalVenta} clienteLabel={watch('cliente_id') || 'Consumidor Final'} />
            <QrProductScanner open={showScannerModal} onClose={() => setShowScannerModal(false)} onCodigoLeido={handleSkuLeido} />
        </Box>
    );
}
