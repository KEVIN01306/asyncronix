import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Grid, Button, Card, CardContent, Divider, IconButton, TextField, Typography, Autocomplete, useTheme, useMediaQuery, TableContainer, Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { ArrowBack as ArrowBackIcon, QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { useDeviceStore } from '../../../../core/store/deviceStore';
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
import CajaMismatchModal from '../../../../shared/components/ui/modals/CajaMismatchModal';

type FormValues = {
    cliente_id: string;
    metodo_pago: MetodoPago;
    estado: EstadoVenta;
};

export default function VentaFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preventaId = searchParams.get('preventa_id');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isEdit = Boolean(id);
    const user = useAuthStore(state => state.user);

    const [loading, setLoading] = useState(false);
    const [isSaving, setSaving] = useState(false);
    const [deletingRows, setDeletingRows] = useState<Record<string, boolean>>({});
    const [productosSeleccionados, setProductosSeleccionados] = useState<VentaProductoInput[]>([]);
    const [ventaId, setVentaId] = useState<string | null>(null);
    const [preventaIdState, setPreventaIdState] = useState<string | null>(preventaId);
    const [showClientModal, setShowClientModal] = useState(false);
    const [pendingProduct, setPendingProduct] = useState<VentaProductoInput | null>(null);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [showStockDialog, setShowStockDialog] = useState(false);
    const [stockIssue, setStockIssue] = useState<any | null>(null);
    const [pendingPaymentPayload, setPendingPaymentPayload] = useState<{ metodo: string; efectivo_recibido: number | null; vuelto: number | null } | null>(null);
    const [pendingPreventaId, setPendingPreventaId] = useState<string | null>(null);
    const [forceStockPin, setForceStockPin] = useState('');
    const [forceStockLoading, setForceStockLoading] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [addingProductLoading, setAddingProductLoading] = useState(false);
    const [clienteNombre, setClienteNombre] = useState('Consumidor Final');
    const [clientSelected, setClientSelected] = useState(false);
    const [showCajaMismatchModal, setShowCajaMismatchModal] = useState(false);
    const [cajaMismatchPayload, setCajaMismatchPayload] = useState<{ metodo: string; efectivo_recibido: number | null; vuelto: number | null } | null>(null);

    const { cajaId, cajaNombre, token: cajaToken } = useDeviceStore();

    const { setValue, watch } = useForm<FormValues>({
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

    const cargarPreVenta = useCallback(async (preventaIdValue: string) => {
        try {
            setLoading(true);
            const res = await ventaRepository.obtenerPreVenta(preventaIdValue);
            const preventa = res.data;
            setVentaId(null);
            setValue('cliente_id', preventa.cliente_id || '');
            setValue('metodo_pago', 'EFECTIVO');
            setValue('estado', 'PENDIENTE');
            setClienteNombre('Consumidor Final');
            setClientSelected(Boolean(preventa.cliente_id));
            setProductosSeleccionados(preventa.detalles.map((detalle) => ({
                producto_id: detalle.variante_id,
                cantidad: detalle.cantidad,
                nombre: detalle.descripcion,
                precio_sugerido: detalle.precio,
                subtotal: detalle.precio * detalle.cantidad
            })));
        } catch {
            toast.error('Error al cargar la preventa');
            navigate('/ventas');
        } finally {
            setLoading(false);
        }
    }, [navigate, setValue]);

    useEffect(() => {
        cargarProductosDisponibles();
        if (preventaId) {
            cargarPreVenta(preventaId);
            return;
        }
        if (isEdit) {
            cargarVenta();
        }
    }, [isEdit, cargarProductosDisponibles, cargarVenta, cargarPreVenta, preventaId]);

    const registrarNuevaVenta = async (primerProducto: VentaProductoInput) => {
        if (!user?.sucursal_id) return;
        try {
            setSaving(true);
            const cliente_id = watch('cliente_id') || null;
            const payload: any = {
                sucursal_id: user.sucursal_id,
                cliente_id: cliente_id || null,
                items: [{ variante_id: primerProducto.producto_id, cantidad: primerProducto.cantidad, precio: primerProducto.precio_sugerido ?? 0, descripcion: primerProducto.nombre }]
            };
            const res = await ventaRepository.crearPreVenta(payload);
            const preventa = res.data;
            setPreventaIdState(preventa.id);
            setProductosSeleccionados(preventa.detalles.map((detalle: any) => ({
                producto_id: detalle.variante_id,
                cantidad: detalle.cantidad,
                nombre: detalle.descripcion,
                precio_sugerido: detalle.precio,
                subtotal: detalle.precio * detalle.cantidad
            })));
            toast.success('Preventa creada y primer detalle agregado');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al crear la preventa');
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

        try {
            setSaving(true);
            setValue('cliente_id', data.cliente_id || '');
            setClienteNombre(data.nombre || 'Consumidor Final');
            setClientSelected(true);
            if (preventaIdState) {
                await ventaRepository.actualizarClientePreVenta(preventaIdState, data.cliente_id || null);
            }
            // use pendingProduct (set when user tried to add before selecting client)
            if (!pendingProduct) {
                toast.error('No hay producto pendiente para agregar');
                return;
            }

            if (preventaIdState) {
                await ventaRepository.addDetallePreVenta(preventaIdState, { variante_id: pendingProduct.producto_id!, cantidad: pendingProduct.cantidad, precio: pendingProduct.precio_sugerido ?? 0, descripcion: pendingProduct.nombre });
                const res = await ventaRepository.obtenerPreVenta(preventaIdState);
                const preventa = res.data;
                setProductosSeleccionados(preventa.detalles.map((detalle: any) => ({
                    producto_id: detalle.variante_id,
                    cantidad: detalle.cantidad,
                    nombre: detalle.descripcion,
                    precio_sugerido: detalle.precio,
                    subtotal: detalle.precio * detalle.cantidad
                })));
                toast.success('Producto agregado a la preventa');
            } else {
                // crear preventa con el primer producto
                if (!user?.sucursal_id) {
                    toast.error('No se pudo determinar la sucursal del usuario');
                    return;
                }
                const cliente_id = watch('cliente_id') || null;
                const res = await ventaRepository.crearPreVenta({
                    sucursal_id: user.sucursal_id,
                    cliente_id,
                    items: [{ variante_id: pendingProduct.producto_id!, cantidad: pendingProduct.cantidad, precio: pendingProduct.precio_sugerido ?? 0, descripcion: pendingProduct.nombre }]
                });
                const preventa = res.data;
                setPreventaIdState(preventa.id);
                setProductosSeleccionados(preventa.detalles.map((detalle: any) => ({
                    producto_id: detalle.variante_id,
                    cantidad: detalle.cantidad,
                    nombre: detalle.descripcion,
                    precio_sugerido: detalle.precio,
                    subtotal: detalle.precio * detalle.cantidad
                })));
                toast.success('Producto agregado y preventa creada');
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al agregar el producto');
        } finally {
            setSaving(false);
            setProductoSeleccionado(null);
            setCantidadAgregar(1);
            setPendingProduct(null);
        }
    };

    const handleCodigoLeido = async (codigo: string) => {
        setShowScannerModal(false);
        if (!user?.sucursal_id) return;

        try {
            setScanLoading(true);
            const productResponse = await ventaRepository.buscarPorCodigo(codigo);
            const variant = productResponse.data;
            if (!variant) {
                toast.error('No se encontró una variante con ese código');
                return;
            }

            const atributos = (variant.valores ?? [])
                .map((valor: any) => valor.atributo ? `${valor.atributo.nombre}: ${valor.valor}` : valor.valor)
                .join(', ');
            const productoNombre = variant.producto?.nombre ?? variant.sku;
            const descripcion = atributos ? `${productoNombre} (${atributos})` : productoNombre;

            const prodInput: VentaProductoInput = {
                producto_id: variant.id,
                cantidad: 1,
                nombre: descripcion,
                precio_sugerido: variant.precio_sugerido,
                subtotal: variant.precio_sugerido
            };

            if (preventaIdState) {
                await ventaRepository.addDetallePreVenta(preventaIdState, {
                    variante_id: prodInput.producto_id!,
                    cantidad: prodInput.cantidad,
                    precio: prodInput.precio_sugerido ?? 0,
                    descripcion: prodInput.nombre
                });
                const res = await ventaRepository.obtenerPreVenta(preventaIdState);
                const preventa = res.data;
                setProductosSeleccionados(preventa.detalles.map((detalle: any) => ({
                    producto_id: detalle.variante_id,
                    cantidad: detalle.cantidad,
                    nombre: detalle.descripcion,
                    precio_sugerido: detalle.precio,
                    subtotal: detalle.precio * detalle.cantidad
                })));
                toast.success('Detalle agregado a la preventa');
                return;
            }

            if (clientSelected) {
                await registrarNuevaVenta(prodInput);
            } else {
                setPendingProduct(prodInput);
                setShowClientModal(true);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el código');
        } finally {
            setScanLoading(false);
        }
    };

    const handleOpenScanner = () => {
        setShowScannerModal(true);
    };

    const resetForm = () => {
        setVentaId(null);
        setProductosSeleccionados([]);
        setClienteNombre('Consumidor Final');
        setClientSelected(false);
        setProductoSeleccionado(null);
        setCantidadAgregar(1);
        setPendingProduct(null);
        setShowPaymentModal(false);
        setShowClientModal(false);
        setShowScannerModal(false);
        setShowStockDialog(false);
        setScanLoading(false);
        setSaving(false);
        setStockIssue(null);
        setPendingPaymentPayload(null);
        setPendingPreventaId(null);
        setForceStockPin('');
        setValue('cliente_id', '');
        setValue('metodo_pago', 'EFECTIVO');
        setValue('estado', 'PENDIENTE');
        setShowCajaMismatchModal(false);
        setCajaMismatchPayload(null);
    };

    const finalizarPreVentaConPayload = async (preventaIdValue: string, payload: { metodo: string; efectivo_recibido: number | null; vuelto: number | null }, overrideStock = false, pinCaja?: string, forceEnLinea = false) => {
        let cajaOptions = {};
        if (payload.metodo === 'EFECTIVO' && !forceEnLinea) {
            if (!cajaId) {
                throw new Error('Esta PC no tiene ninguna caja enlazada. Configura la caja en los ajustes.');
            }
            cajaOptions = {
                caja_id: cajaId,
                token_autorizado: cajaToken || ''
            };
        }
        return ventaRepository.finalizarPreVenta(preventaIdValue, {
            metodo_pago: payload.metodo,
            comentarios: null,
            efectivo_recibido: payload.efectivo_recibido,
            vuelto: payload.vuelto,
            override_stock: overrideStock,
            pin_caja: pinCaja,
            ...cajaOptions,
            forzar_caja_en_linea: forceEnLinea
        });
    };

    const handlePaymentConfirm = async (payload: { metodo: string; efectivo_recibido: number | null; vuelto: number | null }, forceEnLinea = false) => {
        if (!user?.sucursal_id) return;
        try {
            setSaving(true);
            if (!ventaId && preventaIdState) {
                const result = await finalizarPreVentaConPayload(preventaIdState, payload, false, undefined, forceEnLinea);
                const resultData = (result as any)?.data ?? result;
                if (resultData?.faltantes?.length) {
                    setStockIssue(resultData);
                    setPendingPaymentPayload(payload);
                    setPendingPreventaId(preventaIdState);
                    setShowStockDialog(true);
                    return;
                }
                toast.success('Venta finalizada desde preventa');
                resetForm();
                navigate('/ventas/nuevo');
                return;
            }

            if (!ventaId && productosSeleccionados.length > 0) {
                const cliente_id = watch('cliente_id') || null;
                const createRes = await ventaRepository.crearPreVenta({
                    sucursal_id: user.sucursal_id,
                    cliente_id,
                    items: productosSeleccionados.map((producto) => ({ variante_id: producto.producto_id, cantidad: producto.cantidad, precio: producto.precio_sugerido ?? 0, descripcion: producto.nombre }))
                });
                const preventaCreated = createRes.data;
                const result = await finalizarPreVentaConPayload(preventaCreated.id, payload, false, undefined, forceEnLinea);
                const resultData = (result as any)?.data ?? result;
                if (resultData?.faltantes?.length) {
                    setStockIssue(resultData);
                    setPendingPaymentPayload(payload);
                    setPendingPreventaId(preventaCreated.id);
                    setShowStockDialog(true);
                    return;
                }
                toast.success('Venta finalizada desde preventa');
                resetForm();
                navigate('/ventas/nuevo');
                return;
            }

            if (!ventaId) {
                toast.warning('No hay productos para finalizar');
                return;
            }

            let cajaOptions = {};
            if (payload.metodo === 'EFECTIVO' && !forceEnLinea) {
                if (!cajaId) {
                    toast.error('Esta PC no tiene ninguna caja enlazada. Configura la caja en los ajustes.');
                    setSaving(false);
                    return;
                }
                cajaOptions = {
                    caja_id: cajaId,
                    token_autorizado: cajaToken || ''
                };
            }

            await ventaRepository.finalizarVenta(ventaId, user.sucursal_id, payload.metodo, { ...cajaOptions, forzar_caja_en_linea: forceEnLinea });
            toast.success('Venta finalizada');
            resetForm();
            navigate('/ventas/nuevo');
        } catch (error: any) {
            if (error.response?.data?.code === 'CAJA_TOKEN_MISMATCH') {
                setCajaMismatchPayload(payload);
                setShowPaymentModal(false);
                setShowCajaMismatchModal(true);
            } else if (error.message && !error.response) {
                toast.error(error.message);
            } else {
                toast.error(error.response?.data?.message || 'Error al finalizar la venta');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleForceCajaEnLinea = async () => {
        if (cajaMismatchPayload) {
            await handlePaymentConfirm(cajaMismatchPayload, true);
            setShowCajaMismatchModal(false);
        }
    };

    const handleForceStockConfirm = async () => {
        if (!forceStockPin.trim()) {
            toast.error('Ingresa el PIN de caja');
            return;
        }

        if (!pendingPaymentPayload) {
            toast.error('No hay un pago pendiente para confirmar');
            return;
        }

        try {
            setForceStockLoading(true);
            const preventaIdParaForzar = pendingPreventaId || preventaIdState;
            if (!preventaIdParaForzar) {
                toast.error('No hay una preventa activa para continuar');
                return;
            }

            const result = await finalizarPreVentaConPayload(preventaIdParaForzar, pendingPaymentPayload, true, forceStockPin);
            const resultData = (result as any)?.data ?? result;
            if (resultData?.faltantes?.length) {
                toast.error('No se pudo completar la venta con stock forzado');
                return;
            }

            toast.success('Venta finalizada con stock forzado');
            resetForm();
            navigate('/ventas/nuevo');
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al forzar stock');
        } finally {
            setForceStockLoading(false);
            setShowStockDialog(false);
        }
    };

    

    const handleAgregarProducto = async () => {
        if (!productoSeleccionado) return;
        if (cantidadAgregar <= 0) {
            toast.warning("La cantidad debe ser mayor a 0");
            return;
        }
        if (addingProductLoading) return;

        setAddingProductLoading(true);

        const prodInput: VentaProductoInput = {
            producto_id: productoSeleccionado.id,
            cantidad: cantidadAgregar,
            nombre: productoSeleccionado.nombre,
            precio_sugerido: productoSeleccionado.precio_sugerido,
            subtotal: cantidadAgregar * productoSeleccionado.precio_sugerido
        };

        try {
            if (!ventaId) {
                if (clientSelected) {
                    if (preventaIdState) {
                        try {
                            setSaving(true);
                            await ventaRepository.addDetallePreVenta(preventaIdState, {
                                variante_id: prodInput.producto_id!,
                                cantidad: prodInput.cantidad,
                                precio: prodInput.precio_sugerido ?? 0,
                                descripcion: prodInput.nombre
                            });
                            const res = await ventaRepository.obtenerPreVenta(preventaIdState);
                            const preventa = res.data;
                            setProductosSeleccionados(preventa.detalles.map((detalle: any) => ({
                                producto_id: detalle.variante_id,
                                cantidad: detalle.cantidad,
                                nombre: detalle.descripcion,
                                precio_sugerido: detalle.precio,
                                subtotal: detalle.precio * detalle.cantidad
                            })));
                            toast.success('Producto agregado a la preventa');
                        } catch (error: any) {
                            toast.error(error.response?.data?.message || 'Error al agregar producto');
                        } finally {
                            setSaving(false);
                            setProductoSeleccionado(null);
                            setCantidadAgregar(1);
                        }
                        return;
                    }

                    await registrarNuevaVenta(prodInput);
                } else {
                    setPendingProduct(prodInput);
                    setShowClientModal(true);
                }
                return;
            }

            setSaving(true);
            const codigo = productoSeleccionado?.codigo_barras ?? productoSeleccionado?.qr_codigo ?? productoSeleccionado?.sku ?? productoSeleccionado?.id;
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
            setAddingProductLoading(false);
        }
    };

    const handleEliminarProducto = (index: number, rowKey: string) => {
        const prod = productosSeleccionados[index];
        if (!ventaId && !preventaIdState) {
            const nuevos = [...productosSeleccionados];
            nuevos.splice(index, 1);
            setProductosSeleccionados(nuevos);
            return;
        }

        (async () => {
            try {
                setDeletingRows((prev) => ({ ...prev, [rowKey]: true }));
                setSaving(true);
                if (ventaId) {
                    const res = await ventaRepository.obtener(ventaId);
                    const detalle = res.data.detalles.find((d: any) => (d.variante_id ?? d.lote_id ?? '') === prod.producto_id || d.descripcion === prod.nombre);
                    if (detalle) {
                        await ventaRepository.eliminarDetalle(ventaId, detalle.id, user!.sucursal_id!);
                        const ventaRef = await ventaRepository.obtener(ventaId);
                        setProductosSeleccionados(agruparDetalles(ventaRef.data.detalles));
                        toast.success('Detalle eliminado');
                        return;
                    }
                }

                if (preventaIdState) {
                    const resPreventa = await ventaRepository.obtenerPreVenta(preventaIdState);
                    const detallePreventa = resPreventa.data.detalles.find((d: any) => d.variante_id === prod.producto_id || d.descripcion === prod.nombre);
                    if (detallePreventa) {
                        await ventaRepository.eliminarDetallePreVenta(detallePreventa.id);
                        const preventaRef = await ventaRepository.obtenerPreVenta(preventaIdState);
                        setProductosSeleccionados(preventaRef.data.detalles.map((detalle: any) => ({
                            producto_id: detalle.variante_id,
                            cantidad: detalle.cantidad,
                            nombre: detalle.descripcion,
                            precio_sugerido: detalle.precio,
                            subtotal: detalle.precio * detalle.cantidad
                        })));
                        toast.success('Detalle eliminado');
                    }
                }
            } catch (error: any) {
                toast.error(error.response?.data?.message || 'Error al eliminar detalle');
            } finally {
                setDeletingRows((prev) => {
                    const next = { ...prev };
                    delete next[rowKey];
                    return next;
                });
                setSaving(false);
            }
        })();
    };

    const totalVenta = productosSeleccionados.reduce((acc, curr) => acc + (curr.subtotal || 0), 0);

    if (loading) return <Loading />;

    return (
        <Grid container spacing={2} p={isMobile ? 2 : 4} mx="auto" sx={{ width: '100%', boxSizing: 'border-box' }}>
            <Grid size={{ xs: 12 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/ventas')} sx={{ mb: 1, textTransform: 'none' }}>
                    Volver
                </Button>
            </Grid>

            <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="overline" color="text.secondary" sx={{ display: 'block', letterSpacing: 1 }}>
                        Gestión de Ventas
                    </Typography>
                    <Typography variant="h5" fontWeight={600}>
                        {isEdit ? 'Continuar con la venta' : 'Iniciar nueva venta'}
                    </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', letterSpacing: 1, textTransform: 'uppercase' }}>
                        Caja Física
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color={cajaId ? 'primary.main' : 'warning.main'}>
                        {cajaNombre ? `Asignada: ${cajaNombre}` : 'Conectado a caja virtual o en línea'}
                    </Typography>
                </Box>
            </Box>

            <Dialog open={showStockDialog} onClose={() => {
                setShowStockDialog(false);
                setStockIssue(null);
                setPendingPaymentPayload(null);
                setPendingPreventaId(null);
                setForceStockPin('');
            }} fullWidth maxWidth="sm">
                <DialogTitle>Stock insuficiente</DialogTitle>
                <DialogContent>
                    {stockIssue?.faltantes?.length ? (
                        <Box mt={1} display="grid" gap={1}>
                            <Typography>Hay productos sin stock suficiente para completar la venta.</Typography>
                            {stockIssue.faltantes.map((faltante: any, index: number) => (
                                <Typography key={`${faltante.variante_id}-${index}`} variant="body2" color="text.secondary">
                                    • {faltante.descripcion}: solicitado {faltante.solicitado}, disponible {faltante.disponible}
                                </Typography>
                            ))}
                        </Box>
                    ) : (
                        <Typography>No fue posible completar la venta por stock insuficiente.</Typography>
                    )}

                    <Box mt={2}>
                        <TextField
                            fullWidth
                            label="PIN de caja"
                            type="password"
                            value={forceStockPin}
                            onChange={(e) => setForceStockPin(e.target.value)}
                            inputProps={{ maxLength: 6 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => {
                        setShowStockDialog(false);
                        setStockIssue(null);
                        setPendingPaymentPayload(null);
                        setPendingPreventaId(null);
                        setForceStockPin('');
                    }}>Cancelar</Button>
                    <Button onClick={handleForceStockConfirm} variant="contained" disabled={forceStockLoading}>
                        {forceStockLoading ? 'Procesando…' : 'Forzar stock'}
                    </Button>
                </DialogActions>
            </Dialog>

            <CajaMismatchModal
                open={showCajaMismatchModal}
                onClose={() => setShowCajaMismatchModal(false)}
                onForce={handleForceCajaEnLinea}
                loading={isSaving}
            />

            <Grid size={{ xs: 12 }} container spacing={3}>
                <Grid size={{ xs: 12, md: 12 }}>
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
                                            disabled={!productoSeleccionado || !isEditable || addingProductLoading}
                                            sx={{ height: 56, width: '100%' }}
                                        >
                                            {addingProductLoading ? <CircularProgress size={20} color="inherit" /> : 'Agregar'}
                                        </Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <TableContainer>
                                <SaleProductsTable items={productosSeleccionados} onDelete={handleEliminarProducto} isEditable={isEditable} deletingRows={deletingRows} />
                            </TableContainer>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                <SaleSummary total={totalVenta} clienteLabel={clienteNombre} onFinalize={() => setShowPaymentModal(true)} disabled={!productosSeleccionados.length} />
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Grid size={{ xs: 12, md: 12 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                            Detalle de la Venta
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={4}>
                            {/* Información de Estado y Pago */}
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Estado de la Venta
                                </Typography>
                                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, color: 'text.primary' }}>
                                    {watch('estado') || 'N/A'}
                                </Typography>
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                    Método de Pago
                                </Typography>
                                <Typography variant="body1" fontWeight={700} sx={{ mt: 0.5, color: 'text.primary' }}>
                                    {watch('metodo_pago') || 'No definido'}
                                </Typography>
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 4 }}>
                            <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                                Información del Cliente
                            </Typography>
                            <Box
                                sx={{
                                    mt: 1,
                                    p: 2.5,
                                    bgcolor: 'background.paper',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    border: '1px dashed',
                                    borderColor: 'grey.300'
                                }}
                            >
                                <Box>
                                    <Typography variant="h6" sx={{ color: 'primary.main' }}>
                                        {clienteNombre || 'Sin cliente asignado'}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        ID Cliente: {watch('cliente_id') || '---'}
                                    </Typography>
                                </Box>

                                <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setShowClientModal(true)}
                                    disabled={!isEditable}
                                >
                                    {watch('cliente_id') ? 'Cambiar cliente' : 'Asignar cliente'}
                                </Button>
                            </Box>
                        </Box>
                    </CardContent>
                </Card>
            </Grid>


            <SaleClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onConfirm={handleClientConfirm} />
            <SalePaymentModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} onConfirm={handlePaymentConfirm} total={totalVenta} clienteLabel={clienteNombre} loading={isSaving} />
            <QrProductScanner open={showScannerModal} onClose={() => setShowScannerModal(false)} onCodigoLeido={handleCodigoLeido} />
        </Grid>
    );
}
