import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Grid, Button, Card, CardContent, Divider, FormControl, InputLabel, IconButton, MenuItem, Paper, Select, TextField, Typography, Autocomplete, useTheme, useMediaQuery, TableContainer, Box } from '@mui/material';
import { ArrowBack as ArrowBackIcon, QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { ventaRepository } from '../../infrastructure/venta.repository';
import SaleClientModal from '../components/SaleClientModal';
import SalePaymentModal from '../components/SalePaymentModal';
import { VarianteRepository } from '../../../productos/infrastructure/repositories/variante.repository';
import type { EstadoVenta, MetodoPago, VentaProductoInput, VentaDetalleSimple } from '../../domain/interfaces/venta.interface';
import type { Variante } from '../../../productos/domain/interfaces/producto.interface';
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
    const [clienteNombre, setClienteNombre] = useState('Consumidor Final');
    const [clientSelected, setClientSelected] = useState(false);
    const { control, handleSubmit, setValue, watch } = useForm<FormValues>({
        defaultValues: {
            cliente_id: '',
            metodo_pago: 'EFECTIVO',
            estado: 'PENDIENTE'
        }
    });

    const [variantesDisponibles, setVariantesDisponibles] = useState<any[]>([]);
    const [searchProductoLoading, setSearchProductoLoading] = useState(false);

    const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
    const [cantidadAgregar, setCantidadAgregar] = useState<number>(1);

    const estado = watch('estado') as EstadoVenta;
    const isEditable = !id || estado === 'PENDIENTE';

    const cargarProductosDisponibles = useCallback(async () => {
        try {
            setSearchProductoLoading(true);
            const res = await VarianteRepository.listarPorNegocio();
            const variantes: any[] = res.data.map((v: Variante) => {
                const atributos = (v.valores ?? []).map((valor) => valor.atributo ? `${valor.atributo.nombre}: ${valor.valor}` : valor.valor).join(', ');
                const productoNombre = v.producto?.nombre ?? 'Variante';
                return {
                    ...v,
                    nombre: atributos ? `${productoNombre} (${atributos})` : productoNombre,
                    producto_nombre: productoNombre,
                    valores: v.valores ?? []
                };
            });

            setVariantesDisponibles(variantes);
        } catch {
            toast.error('Error al cargar variantes disponibles');
        } finally {
            setSearchProductoLoading(false);
        }
    }, []);

    const agruparDetalles = (detalles: VentaDetalleSimple[]) => {
        const agrupado = new Map<string, VentaProductoInput>();

        detalles.forEach((detalle) => {
            const productoId = detalle.variante_id ?? detalle.lote_id ?? detalle.id;
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
            setClienteNombre(venta.cliente_nombre || 'Consumidor Final');
            setClientSelected(true);
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

    const registrarNuevaVenta = async (primerProducto: VentaProductoInput) => {
        if (!user?.sucursal_id) return;
        try {
            setSaving(true);
            const cliente_id = watch('cliente_id') || null;
            const payload: any = {
                sucursal_id: user.sucursal_id,
                cliente_id: cliente_id || null,
                metodo_pago: watch('metodo_pago') || 'EFECTIVO',
                estado: 'PENDIENTE',
                productos: [{ producto_id: primerProducto.producto_id, cantidad: primerProducto.cantidad }]
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
            setProductoSeleccionado(null);
            setCantidadAgregar(1);
        }
    };

    const handleClientConfirm = async (data: {
        cliente_id: string | null;
        cf: boolean;
        nit?: string | null;
        dpi?: string | null;
        nombre?: string | null;
        apellido?: string | null;
        telefono?: string | null;
        email?: string | null;
    }) => {
        setShowClientModal(false);
        const selectedNombre = data.nombre || 'Consumidor Final';
        const targetClienteId = data.cliente_id || null;

        setClienteNombre(selectedNombre);
        setValue('cliente_id', targetClienteId || '');
        setClientSelected(true);

        if (!user?.sucursal_id) return;

        try {
            setSaving(true);
            if (ventaId) {
                await ventaRepository.actualizar(ventaId, {
                    sucursal_id: user.sucursal_id,
                    cliente_id: targetClienteId
                });
                toast.success('Cliente actualizado en la venta');
            } else if (pendingProduct) {
                const payload: any = {
                    sucursal_id: user.sucursal_id,
                    cliente_id: targetClienteId,
                    metodo_pago: watch('metodo_pago') || 'EFECTIVO',
                    estado: 'PENDIENTE',
                    productos: [{ producto_id: pendingProduct.producto_id, cantidad: pendingProduct.cantidad }]
                };

                const res = await ventaRepository.registrar(payload);
                const venta = res.data;
                setVentaId(venta.id);
                setProductosSeleccionados(agruparDetalles(venta.detalles));
                toast.success('Venta creada y primer detalle agregado');
                setPendingProduct(null);
                setProductoSeleccionado(null);
                setCantidadAgregar(1);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al actualizar el cliente');
        } finally {
            setSaving(false);
        }
    };

    const handleCodigoLeido = async (codigo: string) => {
        setShowScannerModal(false);
        if (!user?.sucursal_id) return;

        try {
            setScanLoading(true);
            if (!ventaId) {
                const productResponse = await ventaRepository.buscarPorCodigo(codigo);
                const variant = productResponse.data;
                if (!variant) {
                    toast.error('No se encontró una variante con ese código');
                    return;
                }
                const prodInput: VentaProductoInput = {
                    producto_id: variant.id,
                    cantidad: 1,
                    nombre: variant.producto?.nombre ?? variant.sku,
                    precio_sugerido: variant.precio_sugerido,
                    subtotal: variant.precio_sugerido
                };

                if (clientSelected) {
                    await registrarNuevaVenta(prodInput);
                } else {
                    setPendingProduct(prodInput);
                    setShowClientModal(true);
                }
                return;
            }

            await ventaRepository.agregarProducto(ventaId, codigo, user.sucursal_id, 1);
            const res = await ventaRepository.obtener(ventaId);
            setProductosSeleccionados(agruparDetalles(res.data.detalles));
            toast.success('Detalle agregado por código');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el código');
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
            if (clientSelected) {
                await registrarNuevaVenta(prodInput);
            } else {
                setPendingProduct(prodInput);
                setShowClientModal(true);
            }
            return;
        }

        try {
            setSaving(true);
            const codigo = productoSeleccionado?.sku ?? productoSeleccionado?.codigo ?? productoSeleccionado?.id;
            if (!codigo) throw new Error('Código de variante no disponible');
            await ventaRepository.agregarProducto(ventaId, codigo, user!.sucursal_id!, prodInput.cantidad);
            const res = await ventaRepository.obtener(ventaId);
            const venta = res.data;
            setProductosSeleccionados(agruparDetalles(venta.detalles));
            toast.success('Producto agregado a la venta');
        } catch (error: any) {
            toast.error(error.response?.data?.message || error.message || 'Error al agregar producto');
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
                const detalle = res.data.detalles.find((d: any) => (d.variante_id ?? d.lote_id ?? '') === prod.producto_id || d.descripcion === prod.nombre);
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
        <Grid container spacing={3} p={isMobile ? 2 : 4} mx="auto" sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Grid size={{ xs: 12 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')} sx={{ mb: 2, textTransform: 'none' }}>
                    Volver
                </Button>
            </Grid>

            <Grid size={{ xs: 12 }}>
                <Paper sx={{ p: 2, border: (theme) => `1px solid ${theme.palette.divider}`, mb: 2 }}>
                    <Typography variant="h5" fontWeight={700}>
                        {isEdit ? 'Continuar Venta' : 'Nueva Venta'}
                    </Typography>
                </Paper>
            </Grid>

            <Grid size={{ xs: 12 }} container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
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
                                            <MenuItem value="OTROS">OTROS</MenuItem>
                                        </Select>
                                    )}
                                />
                            </FormControl>
                            <Box sx={{ mt: 2, mb: 2 }}>
                                <Typography variant="caption" color="textSecondary" display="block" gutterBottom>
                                    Cliente de la Venta
                                </Typography>
                                <Box
                                    sx={{
                                        p: 2,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        bgcolor: 'background.default',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>
                                            {clienteNombre}
                                        </Typography>
                                        {watch('cliente_id') && (
                                            <Typography variant="caption" color="textSecondary" display="block">
                                                ID: {watch('cliente_id')}
                                            </Typography>
                                        )}
                                    </Box>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setShowClientModal(true)}
                                        disabled={!isEditable}
                                        sx={{ textTransform: 'none' }}
                                    >
                                        {watch('cliente_id') ? 'Cambiar' : 'Seleccionar'}
                                    </Button>
                                </Box>
                            </Box>
                            <Grid container sx={{ mt: 4 }}>
                                <Button variant="contained" color="primary" fullWidth onClick={handleSubmit(onSubmit)} disabled={saving || !isEditable}>
                                    {saving ? 'Guardando...' : ventaId ? 'Finalizar Venta' : 'Iniciar Venta'}
                                </Button>
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid size={{ xs: 12, md: 8 }}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>Productos de la Venta</Typography>
                            <Grid container spacing={2} mb={3} alignItems="center">
                                <Grid size={{ xs: 12, md: 8 }} container spacing={1} alignItems="center">
                                    <Grid size={{ xs: 12, md: 2 }}>
                                        <IconButton
                                            color="primary"
                                            onClick={handleOpenScanner}
                                            disabled={!isEditable || scanLoading}
                                            sx={{ border: '1px solid', borderColor: 'divider', flexShrink: 0, height: 56, width: 56 }}
                                        >
                                            <QrCodeScannerIcon />
                                        </IconButton>
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 10 }}>
                                        <Autocomplete
                                            options={variantesDisponibles}
                                            getOptionLabel={(option) => option?.nombre ?? ''}
                                            value={productoSeleccionado}
                                            onChange={(_e, newValue) => setProductoSeleccionado(newValue)}
                                            loading={searchProductoLoading}
                                            renderOption={(props, option: any) => (
                                                <li {...props}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                                                        <Box>
                                                            <Typography fontWeight={600}>{option.producto_nombre}</Typography>
                                                            {option.valores && option.valores.length > 0 && (
                                                                <Typography variant="caption" color="textSecondary">
                                                                    {option.valores.map((v: any) => v.atributo ? `${v.atributo.nombre}: ${v.valor}` : v.valor).join(', ')}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography>{formatMoney(option.precio_sugerido)}</Typography>
                                                            <Typography variant="caption">Stock: {option.stock_total}</Typography>
                                                        </Box>
                                                    </Box>
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Buscar Variante" variant="outlined" />
                                            )}
                                            disabled={!isEditable}
                                        />
                                    </Grid>
                                </Grid>

                                <Grid size={{ xs: 12, md: 4 }} container spacing={2}>
                                    <Grid size={{ xs: 4 }}>
                                        <TextField
                                            type="number"
                                            label="Cant."
                                            fullWidth
                                            value={cantidadAgregar}
                                            onChange={(e) => setCantidadAgregar(parseInt(e.target.value) || 0)}
                                            inputProps={{ min: 1 }}
                                            disabled={!isEditable}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                        <Button
                                            variant="contained"
                                            color="secondary"
                                            onClick={handleAgregarProducto}
                                            disabled={!productoSeleccionado || !isEditable}
                                            sx={{ height: 56, width: '100%' }}
                                        >
                                            Agregar
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <TableContainer>
                                <SaleProductsTable items={productosSeleccionados} onDelete={handleEliminarProducto} isEditable={isEditable} />
                            </TableContainer>

                            <SaleSummary total={totalVenta} clienteLabel={clienteNombre} onFinalize={() => setShowPaymentModal(true)} disabled={!ventaId} />
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <SaleClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onConfirm={handleClientConfirm} />
            <SalePaymentModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} onConfirm={handlePaymentConfirm} total={totalVenta} clienteLabel={clienteNombre} />
            <QrProductScanner open={showScannerModal} onClose={() => setShowScannerModal(false)} onCodigoLeido={handleCodigoLeido} />
        </Grid>
    );
}
