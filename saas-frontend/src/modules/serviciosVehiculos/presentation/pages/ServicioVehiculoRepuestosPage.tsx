import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, TextField, Typography, Stack, Autocomplete, IconButton, Grid } from '@mui/material';
import { ArrowBack as ArrowBackIcon, Delete as DeleteIcon, QrCodeScanner as QrCodeScannerIcon } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { useAuthStore } from '../../../../core/store/authStore';
import { toast } from 'sonner';
import { ventaRepository } from '../../../ventas/infrastructure/venta.repository';
import { VarianteRepository } from '../../../productos/infrastructure/repositories/variante.repository';
import QrProductScanner from '../../../ventas/presentation/components/lectorSkuQr';
import type { VentaVarianteDetalle } from '../../../ventas/domain/interfaces/venta.interface';
import type { Variante } from '../../../productos/domain/interfaces/producto.interface';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { useBarcodeScanner } from '../../../../core/hooks/useBarcodeScanner';

export default function ServicioRepuestosPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [servicio, setServicio] = useState<any | null>(null);
    const [varianteSeleccionada, setVarianteSeleccionada] = useState<VentaVarianteDetalle | null>(null);
    const [cantidad, setCantidad] = useState<number>(1);
    const [showScannerModal, setShowScannerModal] = useState(false);
    const [scanLoading, setScanLoading] = useState(false);
    const [variantesDisponibles, setVariantesDisponibles] = useState<any[]>([]);
    const [searchProductoLoading, setSearchProductoLoading] = useState(false);
    const [productoSeleccionado, setProductoSeleccionado] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const user = useAuthStore((s: any) => s.user);

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

    useEffect(() => {
        cargarProductosDisponibles();
        if (!id) return;
        const fetchService = async () => {
            try {
                const res = await servicioRepository.obtener(id);
                setServicio(res);
            } catch {
                toast.error('Error al cargar servicio');
                navigate('/servicios-vehiculo');
            }
        };
        fetchService();
    }, [id, navigate, cargarProductosDisponibles]);

    const canEdit = user?.permisos?.includes('EDITAR_SERVICIOS') && user?.permisos?.includes('EDITAR_SERVICIOS_REPUESTOS') && ['RECEPCION', 'EN_SERVICIO', 'ESPERA_REPUESTOS', 'EN_REPARACION'].includes(servicio?.estado);

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
            setVarianteSeleccionada(variant);
            setCantidad(1);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el código');
        } finally {
            setScanLoading(false);
        }
    };

    useBarcodeScanner({ onScan: handleCodigoLeido });

    const handleOpenScanner = () => {
        setShowScannerModal(true);
    };

    const handleAgregar = async () => {
        if (!canEdit) return toast.error('Permisos insuficientes');

        // Usar varianteSeleccionada (del código) o productoSeleccionado (del autocomplete)
        const variante = varianteSeleccionada || productoSeleccionado;
        if (!variante) return toast.error('Variante requerida');
        if (!user?.sucursal_id) return toast.error('Sucursal no disponible');
        if (cantidad <= 0) return toast.error('Cantidad debe ser mayor que cero');

        try {
            setSaving(true);
            const payload = {
                variante_id: variante.id,
                cantidad,
                sucursal_id: user.sucursal_id
            };
            await servicioRepository.crearRepuesto(servicio.id, payload);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            setVarianteSeleccionada(null);
            setProductoSeleccionado(null);
            setCantidad(1);
            toast.success('Repuesto agregado');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al agregar repuesto');
        } finally {
            setSaving(false);
        }
    };

    const handleEliminar = async (repId: string) => {
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

    if (!servicio) return <Loading />;

    if (servicio.estado === 'EN_CUSTODIA') {
        return (
            <Box p={3}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/servicios-vehiculo/${servicio.id}`)} sx={{ mb: 2 }}>{'Volver'}</Button>
                <Typography variant="h6" color="error">No se pueden administrar repuestos mientras el servicio está en Custodia.</Typography>
            </Box>
        );
    }

    const inReparacion = servicio.estado === 'EN_REPARACION';
    const activeReparacion = inReparacion ? servicio.servicioReparacion?.find((r: any) => !r.fecha_salida) : null;
    
    // Si esta en reparacion, mostramos los repuestos de la reparacion. Si no, los del servicio general.
    const repuestosList = inReparacion 
        ? (activeReparacion?.servicioRepuestos ?? []) 
        : (servicio.repuestos_inventario ?? []);

    const totalRepuestos = repuestosList.reduce((s: number, r: any) => s + ((r.precio_venta ?? 0) * (r.cantidad ?? 0)), 0);

    return (
        <Box p={3}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(`/servicios-vehiculo/${servicio.id}`)} sx={{ mb: 2 }}>{'Volver'}</Button>

            <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" mb={2}>Agregar repuesto al servicio</Typography>
                <Grid container spacing={2} mb={3} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }} container spacing={1} alignItems="center">
                        <Grid size={{ xs: 12, md: 2 }}>
                            <IconButton
                                color="primary"
                                onClick={handleOpenScanner}
                                disabled={!canEdit || scanLoading}
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
                                onChange={(_e, newValue) => {
                                    setProductoSeleccionado(newValue);
                                    setVarianteSeleccionada(null);
                                }}
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
                                disabled={!canEdit}
                            />
                        </Grid>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }} container spacing={2}>
                        <Grid size={{ xs: 4 }}>
                            <TextField
                                type="number"
                                label="Cant."
                                fullWidth
                                value={cantidad}
                                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                                inputProps={{ min: 1 }}
                                disabled={!canEdit}
                            />
                        </Grid>
                        <Grid size={{ xs: 8 }}>
                            <Button
                                variant="contained"
                                color="secondary"
                                onClick={handleAgregar}
                                disabled={!(varianteSeleccionada || productoSeleccionado) || !canEdit || saving}
                                sx={{ height: 56, width: '100%' }}
                            >
                                {saving ? 'Guardando...' : 'Agregar Repuesto'}
                            </Button>
                        </Grid>
                    </Grid>
                </Grid>

                {(varianteSeleccionada || productoSeleccionado) && (
                    <Stack spacing={2} sx={{ mt: 3, p: 2, backgroundColor: 'action.hover', borderRadius: 1 }}>
                        <Typography><strong>Producto:</strong> {(varianteSeleccionada || productoSeleccionado).producto?.nombre || 'Sin nombre'}</Typography>
                        <Typography><strong>SKU:</strong> {(varianteSeleccionada || productoSeleccionado).sku}</Typography>
                        <Typography><strong>Stock:</strong> {(varianteSeleccionada || productoSeleccionado).stock_total}</Typography>
                        <Typography><strong>Precio:</strong> {(varianteSeleccionada || productoSeleccionado).precio_sugerido?.toFixed(2)}</Typography>
                        <Button
                            variant="outlined"
                            onClick={() => {
                                setVarianteSeleccionada(null);
                                setProductoSeleccionado(null);
                                setCantidad(1);
                            }}
                            disabled={!canEdit}
                        >
                            Cancelar Selección
                        </Button>
                    </Stack>
                )}
            </Paper>

            <Paper>
                <TableContainer>
                    <Table>
                        <TableHead sx={{ backgroundColor: 'primary.main' }}>
                            <TableRow>
                                <TableCell> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Variante / SKU</Typography></TableCell>
                                <TableCell> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Atributos</Typography></TableCell>
                                <TableCell align="right"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Cantidad</Typography></TableCell>
                                <TableCell align="right"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Precio</Typography></TableCell>
                                <TableCell align="right"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Subtotal</Typography></TableCell>
                                <TableCell align="center"> <Typography variant="subtitle2" sx={{ color: 'white', fontWeight: 'bold' }}>Acciones</Typography></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {repuestosList.map((r: any) => (
                                <TableRow key={r.id}>
                                    <TableCell>
                                        <Stack spacing={0.5}>
                                            <Typography variant="body2" fontWeight={600}>{r.variante?.producto?.nombre || 'Sin nombre'}</Typography>
                                            <Typography variant="caption" color="textSecondary">{r.variante?.sku}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption">
                                            {r.variante?.valores && r.variante.valores.length > 0
                                                ? r.variante.valores.map((v: any) => `${v.atributo?.nombre}: ${v.valor}`).join(', ')
                                                : '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">{r.cantidad}</TableCell>
                                    <TableCell align="right">{formatMoney(r.precio_venta)}</TableCell>
                                    <TableCell align="right">{formatMoney(r.precio_venta * r.cantidad)}</TableCell>
                                    <TableCell align="center">
                                        <Button
                                            color="error"
                                            size="small"
                                            onClick={() => handleEliminar(r.id)}
                                            disabled={!canEdit}
                                            startIcon={<DeleteIcon />}
                                        >
                                            Eliminar
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {repuestosList.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} align="center">
                                        <Typography color="text.secondary">No hay repuestos agregados</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                            <TableRow>
                                <TableCell colSpan={4} align="right">
                                    <Typography fontWeight={700}>Total</Typography>
                                </TableCell>
                                <TableCell align="right">
                                    <Typography fontWeight={700}>{formatMoney(totalRepuestos)}</Typography>
                                </TableCell>
                                <TableCell />
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
            <QrProductScanner open={showScannerModal} onClose={() => setShowScannerModal(false)} onCodigoLeido={handleCodigoLeido} />
        </Box>
    );
}
