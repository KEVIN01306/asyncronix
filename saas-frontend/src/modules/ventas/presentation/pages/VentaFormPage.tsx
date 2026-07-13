import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
    Grid, Button, Card, CardContent, Divider, IconButton, TextField,
    Typography, Autocomplete, useTheme, useMediaQuery, TableContainer,
    Box, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress,
    Stack, Chip,
    List,
    ListItem,
    ListItemText,
    Paper
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    QrCodeScanner as QrCodeScannerIcon,
    Add as AddIcon,
    Person as PersonIcon,
    ReceiptLong as ReceiptIcon,
    AccountBalanceWallet as WalletIcon
} from '@mui/icons-material';
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
import CajaStatusWidget from '../../../../shared/components/ui/widgets/CajaStatusWidget';

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
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
                forceEnLinea = true;
            } else {
                cajaOptions = {
                    caja_id: cajaId,
                    token_autorizado: cajaToken || ''
                };
            }
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
                    forceEnLinea = true;
                } else {
                    cajaOptions = {
                        caja_id: cajaId,
                        token_autorizado: cajaToken || ''
                    };
                }
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
        <Box sx={{ maxWidth: 1400, mx: 'auto', mt: 2, px: isMobile ? 2 : 4, pb: 6 }}>
            {/* Barra de Navegación y Control Superior */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/ventas')}
                    sx={{ textTransform: 'none', borderRadius: 999 }}
                    variant="text"
                    color="secondary"
                >
                    Volver a ventas
                </Button>
                <CajaStatusWidget />
            </Box>

            {/* Título de la Sección */}
            <Box mb={4}>
                <Typography variant="overline" color="text.secondary" sx={{ display: 'block', letterSpacing: 1, fontWeight: 600 }}>
                    Terminal de Facturación
                </Typography>
                <Typography variant="h2" color="text.primary">
                    {isEdit ? 'Modificar Transacción' : 'Nueva Venta'}
                </Typography>
            </Box>

            {/* Layout de distribución principal (Híbrido Workspace / Apple Checkout) */}
            <Grid container spacing={3}>

                {/* COLUMNA IZQUIERDA: Entrada de Productos y Tabla Operativa (75% ancho en desktop) */}
                <Grid size={{ xs: 12, lg: 8 }}>
                    <Card sx={{ mb: 3 }}>
                        <CardContent sx={{ p: 3 }}>
                            <Typography variant="h3" sx={{ fontSize: '1.2rem', mb: 3, fontWeight: 600 }}>
                                Registro de Ítems
                            </Typography>

                            {/* Panel de Inserción Rápida */}
                            <Grid container spacing={2} alignItems="center" mb={4}>
                                <Grid size={{ xs: 12, sm: 8 }} display="flex" gap={1} alignItems="center">
                                    <IconButton
                                        color="primary"
                                        onClick={handleOpenScanner}
                                        disabled={!isEditable || scanLoading}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            height: 48,
                                            width: 48,
                                            backgroundColor: 'action.hover'
                                        }}
                                    >
                                        <QrCodeScannerIcon fontSize="small" />
                                    </IconButton>
                                    <Box flexGrow={1}>
                                        <Autocomplete
                                            options={variantesDisponibles}
                                            getOptionLabel={(option) => option?.nombre ?? ''}
                                            value={productoSeleccionado}
                                            onChange={(_e, newValue) => setProductoSeleccionado(newValue)}
                                            loading={searchProductoLoading}
                                            renderOption={(props, option: any) => (
                                                <li {...props}>
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', py: 0.5 }}>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600}>{option.producto_nombre}</Typography>
                                                            {option.valores && option.valores.length > 0 && (
                                                                <Typography variant="caption" color="text.secondary">
                                                                    {option.valores.map((v: any) => v.atributo ? `${v.atributo.nombre}: ${v.valor}` : v.valor).join(', ')}
                                                                </Typography>
                                                            )}
                                                        </Box>
                                                        <Box sx={{ textAlign: 'right' }}>
                                                            <Typography variant="body2" fontWeight={600} color="primary.main">{formatMoney(option.precio_sugerido)}</Typography>
                                                            <Typography variant="caption" color="text.secondary">Stock: {option.stock_total}</Typography>
                                                        </Box>
                                                    </Box>
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <TextField {...params} label="Buscar producto o variante..." variant="outlined" size="small" />
                                            )}
                                            disabled={!isEditable}
                                        />
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 4 }} display="flex" gap={1.5}>
                                    <Box sx={{ width: '80px' }}>
                                        <TextField
                                            type="number"
                                            label="Cant."
                                            size="small"
                                            fullWidth
                                            value={cantidadAgregar}
                                            onChange={(e) => setCantidadAgregar(parseInt(e.target.value) || 0)}
                                            inputProps={{ min: 1 }}
                                            disabled={!isEditable}
                                        />
                                    </Box>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        onClick={handleAgregarProducto}
                                        disabled={!productoSeleccionado || !isEditable || addingProductLoading}
                                        startIcon={!addingProductLoading && <AddIcon />}
                                        fullWidth
                                        sx={{ height: 40 }}
                                    >
                                        {addingProductLoading ? <CircularProgress size={20} color="inherit" /> : 'Añadir'}
                                    </Button>
                                </Grid>
                            </Grid>

                            {/* Tabla de Productos Seleccionados */}
                            <TableContainer sx={{ borderColor: 'divider', overflow: 'hidden' }}>
                                <SaleProductsTable items={productosSeleccionados} onDelete={handleEliminarProducto} isEditable={isEditable} deletingRows={deletingRows} />
                            </TableContainer>
                        </CardContent>
                    </Card>
                </Grid>

                {/* COLUMNA DERECHA: Resumen Financiero y Datos de Control (Barra Lateral Consolidada) */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Stack spacing={3}>

                        {/* Caja del Checkout / Resumen */}
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h3" sx={{ fontSize: '1.2rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <ReceiptIcon color="primary" fontSize="small" /> Resumen de Compra
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mb={3}>
                                    Total de ítems agregados y balance pendiente de cobro.
                                </Typography>

                                <Box component={Paper} sx={{ p: 2, bgcolor: 'action.hover', mb: 3 }}>
                                    <SaleSummary total={totalVenta} clienteLabel={clienteNombre} onFinalize={() => setShowPaymentModal(true)} disabled={!productosSeleccionados.length} />
                                </Box>
                            </CardContent>
                        </Card>

                        {/* Caja de Metadatos y Cliente */}
                        <Card>
                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h3" sx={{ fontSize: '1.2rem', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonIcon color="primary" fontSize="small" /> Información de Control
                                </Typography>

                                <List disablePadding>
                                    <ListItem disableGutters secondaryAction={
                                        <Chip label={watch('estado') || 'N/A'} size="small" variant="outlined" color="primary" sx={{ fontWeight: 600 }} />
                                    }>
                                        <ListItemText primary="Estado del Flujo" slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }} />
                                    </ListItem>
                                    <Divider sx={{ my: 1 }} />
                                    <ListItem disableGutters secondaryAction={
                                        <Typography variant="body2" color="text.primary" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <WalletIcon fontSize="inherit" color="secondary" /> {watch('metodo_pago') || 'No definido'}
                                        </Typography>
                                    }>
                                        <ListItemText primary="Método Cobro" slotProps={{ primary: { variant: 'body2', color: 'text.secondary' } }} />
                                    </ListItem>
                                </List>

                                <Box component={Paper} sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'divider', bgcolor: 'background.default' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600, display: 'block', mb: 1 }}>
                                        Cliente Asignado
                                    </Typography>
                                    <Typography variant="body1" fontWeight={700} color="text.primary" noWrap>
                                        {clienteNombre}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                                        ID: {watch('cliente_id') || 'Consumidor Final (C/F)'}
                                    </Typography>

                                    <Button
                                        size="small"
                                        variant="outlined"
                                        onClick={() => setShowClientModal(true)}
                                        disabled={!isEditable}
                                        fullWidth
                                    >
                                        {watch('cliente_id') ? 'Modificar Cliente' : 'Vincular Cliente'}
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Stack>
                </Grid>
            </Grid>

            {/* Modales e Interfaces de Control */}
            <Dialog
                open={showStockDialog}
                onClose={() => {
                    setShowStockDialog(false);
                    setStockIssue(null);
                    setPendingPaymentPayload(null);
                    setPendingPreventaId(null);
                    setForceStockPin('');
                }}
                fullWidth
                maxWidth="sm"
                PaperProps={{ sx: { p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700 }}>Stock insuficiente</DialogTitle>
                <DialogContent>
                    {stockIssue?.faltantes?.length ? (
                        <Box mt={1} display="grid" gap={1}>
                            <Typography variant="body2" color="text.secondary">Hay productos sin existencias suficientes para completar esta venta.</Typography>
                            {stockIssue.faltantes.map((faltante: any, index: number) => (
                                <Typography key={`${faltante.variante_id}-${index}`} variant="body2" fontWeight={500} color="error.main">
                                    • {faltante.descripcion}: Solicitado {faltante.solicitado}, Disponible {faltante.disponible}
                                </Typography>
                            ))}
                        </Box>
                    ) : (
                        <Typography variant="body2">No fue posible completar la venta debido a inconsistencias en las existencias.</Typography>
                    )}

                    <Box mt={3}>
                        <TextField
                            fullWidth
                            label="PIN de autorización de caja"
                            type="password"
                            value={forceStockPin}
                            onChange={(e) => setForceStockPin(e.target.value)}
                            inputProps={{ maxLength: 6 }}
                            size="small"
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setShowStockDialog(false);
                            setStockIssue(null);
                            setPendingPaymentPayload(null);
                            setPendingPreventaId(null);
                            setForceStockPin('');
                        }}
                        sx={{ borderRadius: 999 }}
                        color="secondary"
                    >
                        Cancelar
                    </Button>
                    <Button onClick={handleForceStockConfirm} variant="contained" disabled={forceStockLoading} sx={{ borderRadius: 999 }}>
                        {forceStockLoading ? 'Procesando…' : 'Forzar Venta con Stock'}
                    </Button>
                </DialogActions>
            </Dialog>

            <CajaMismatchModal
                open={showCajaMismatchModal}
                onClose={() => setShowCajaMismatchModal(false)}
                onForce={handleForceCajaEnLinea}
                loading={isSaving}
            />

            <SaleClientModal open={showClientModal} onClose={() => setShowClientModal(false)} onConfirm={handleClientConfirm} />
            <SalePaymentModal open={showPaymentModal} onClose={() => setShowPaymentModal(false)} onConfirm={handlePaymentConfirm} total={totalVenta} clienteLabel={clienteNombre} loading={isSaving} />
            <QrProductScanner open={showScannerModal} onClose={() => setShowScannerModal(false)} onCodigoLeido={handleCodigoLeido} />
        </Box>
    );
}