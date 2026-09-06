import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, CardMedia, Chip, Divider, Grid, Paper, Typography, useMediaQuery, useTheme, Backdrop, CircularProgress } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { useAuthStore } from '../../../../core/store/authStore';
import { ArrowBack } from '@mui/icons-material';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import ServiceImages from '../components/ServiceImages';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { ESTADO_SERVICIO_VEHICULO, METODO_PAGO } from '../../domain/servicio.constants';
import SignaturePadModal from '../components/modals/SignaturePadModal';
import type { VarianteValor } from '../../../productos/domain/interfaces/producto.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useDeviceStore } from '../../../../core/store/deviceStore';
import CajaMismatchModal from '../../../../shared/components/ui/modals/CajaMismatchModal';
import CajaStatusWidget from '../../../../shared/components/ui/widgets/CajaStatusWidget';
import { formatImage } from '../../../../core/utils/formatImage';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';
import BuscarClientePorNitModal from '../../../../shared/components/BuscarClientePorNitModal';
import FormaPagoModal from '../../../../shared/components/ui/modals/FormaPagoModal';
import DocumentPreviewModal from '../../../../shared/components/ui/modals/DocumentPreviewModal';
import { clienteRepository } from '../../../clientes/infrastructure/clientes.repository';


const ServicioSalidaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showImages, setShowImages] = useState(false);
    const [openSignaturePad, setOpenSignaturePad] = useState(false);
    const [firmasSalidaBase64, setFirmasSalidaBase64] = useState<Record<string, string>>({});
    const [activeSignatureKey, setActiveSignatureKey] = useState<string | null>(null);
    const [savingSalida, setSavingSalida] = useState(false);

    const [showCajaMismatchModal, setShowCajaMismatchModal] = useState(false);
    const [cajaMismatchPayload, setCajaMismatchPayload] = useState<any>(null);
    const [showBuscarNitModal, setShowBuscarNitModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showInvoicePreview, setShowInvoicePreview] = useState(false);
    const [clienteFacturacion, setClienteFacturacion] = useState<{ id: string | null; nombre: string } | null>(null);
    const [finishedServicioId, setFinishedServicioId] = useState<string | null>(null);

    const { cajaId, token: cajaToken } = useDeviceStore();

    const user = useAuthStore((state: any) => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const hasSalidaPermission = useMemo(() => user?.permisos?.includes('SALIDA_SERVICIOS'), [user]);

    const fetchService = useCallback(async () => {
        if (!id) {
            setError('ID de servicio no proporcionado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await servicioRepository.obtener(id);
            setServicio(response);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar el servicio');
            toast.error('No se pudo cargar el servicio');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchService();
    }, [fetchService]);

    const getSignaturePreview = useCallback((key: string, existingUrl?: string | null) => {
        if (firmasSalidaBase64[key]) return firmasSalidaBase64[key];
        if (existingUrl) return formatImage(existingUrl);
        return null;
    }, [firmasSalidaBase64]);

    const isSalidaState = servicio?.estado === ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA || servicio?.estado === ESTADO_SERVICIO_VEHICULO.EN_REPARACION || servicio?.estado === ESTADO_SERVICIO_VEHICULO.EN_CUSTODIA;

    const getEstadoColor = (estadoValue: string) => {
        switch (estadoValue) {
            case ESTADO_SERVICIO_VEHICULO.RECEPCION:
                return 'warning';
            case ESTADO_SERVICIO_VEHICULO.FINALIZADO:
            case ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA:
                return 'success';
            case ESTADO_SERVICIO_VEHICULO.CANCELADO:
                return 'error';
            default:
                return 'info';
        }
    };

    const totalRepuestos = servicio?.repuestos_inventario?.reduce((acc, repuesto) => {
        if (repuesto.precio_venta && repuesto.cantidad) {
            return acc + (repuesto.precio_venta * repuesto.cantidad);
        }
        return acc;
    }, 0) || 0;

    const totalReparaciones = servicio?.servicioReparacion?.reduce((acc, rep) => {
        return acc + (Number(rep.total) || 0);
    }, 0) || 0;

    const totalRepuestosReparaciones = servicio?.servicioReparacion?.reduce((acc, rep) => {
        const repuestos = rep.servicioRepuestos || [];
        const totalRep = repuestos.reduce((acc2, repuesto) => {
            if (repuesto.precio_venta && repuesto.cantidad) {
                return acc2 + (repuesto.precio_venta * repuesto.cantidad);
            }
            return acc2;
        }, 0);
        return acc + totalRep;
    }, 0) || 0;

    const subtotalManoObra = servicio?.subtotal ?? 0;
    const totalCustodias = servicio?.servicioCustodias?.reduce((acc, cust) => {
        return acc + (Number(cust.total) || 0);
    }, 0) || 0;
    const totalCobro = subtotalManoObra + totalRepuestos + totalReparaciones + totalRepuestosReparaciones + totalCustodias;

    const tareasNormales = (servicio?.tareas || []).filter((tarea) => !tarea.extra);
    const tareasExtras = (servicio?.tareas || []).filter((tarea) => tarea.extra);

    const handleOpenSignaturePad = (key: string) => { setActiveSignatureKey(key); setOpenSignaturePad(true); };
    const handleCloseSignaturePad = () => { setOpenSignaturePad(false); setActiveSignatureKey(null); };
    const handleSaveSignature = (base64: string | null) => {
        if (activeSignatureKey && base64) {
            setFirmasSalidaBase64(prev => ({ ...prev, [activeSignatureKey]: base64 }));
        }
    };
    const handleConfirmSignature = () => {
        if (activeSignatureKey) {
            if (!firmasSalidaBase64[activeSignatureKey] && !(activeSignatureKey === 'firma_cliente' && servicio?.firma_salida)) {
                toast.error('La firma es obligatoria');
                return;
            }
        }
        setOpenSignaturePad(false);
        setActiveSignatureKey(null);
    };

    const handleInitSalida = () => {
        if (!servicio) return;
        if (!isSalidaState) {
            toast.error('El servicio no está en estado válido para salida');
            return;
        }

        const base64Cliente = firmasSalidaBase64['firma_cliente'] ?? servicio.firma_salida;
        if (!base64Cliente) {
            toast.error('Debes capturar la firma de salida del cliente');
            return;
        }

        if (servicio.servicioReparacion) {
            for (const rep of servicio.servicioReparacion) {
                if (!firmasSalidaBase64[`firma_reparacion_${rep.id}`] && !rep.firma_salida) {
                    toast.error('Falta la firma de salida para la reparación en curso');
                    return;
                }
            }
        }

        if (servicio.servicioCustodias) {
            for (const cust of servicio.servicioCustodias) {
                if (!firmasSalidaBase64[`firma_custodia_${cust.id}`] && !cust.firma_salida) {
                    toast.error('Falta la firma de salida para la custodia en curso');
                    return;
                }
            }
        }

        setShowBuscarNitModal(true);
    };

    const handleDigifactClient = async (clienteInfo: { nit: string; nombre: string }) => {
        if (clienteInfo.nit.toUpperCase() === 'CF' || clienteInfo.nit.toUpperCase() === 'C/F') {
            toast.info('Facturación configurada como Consumidor Final (C/F)');
            setClienteFacturacion({ id: null, nombre: 'Consumidor Final' });
            setShowBuscarNitModal(false);
            setShowPaymentModal(true);
            return;
        }

        try {
            setSavingSalida(true);
            const result = await clienteRepository.buscarPorDocumento({ nit: clienteInfo.nit });
            let clienteId = null;
            if (result.data) {
                clienteId = result.data.id;
                await clienteRepository.actualizar(clienteId, {
                    ...result.data,
                    nombre: clienteInfo.nombre,
                    nit: clienteInfo.nit
                });
                toast.success(`Cliente asociado y actualizado: ${clienteInfo.nombre}`);
            } else {
                const createResult = await clienteRepository.registrar({
                    nit: clienteInfo.nit,
                    nombre: clienteInfo.nombre,
                    telefono: clienteInfo.nit,
                    email: null,
                    apellido: null,
                    dpi: null
                });
                if (createResult.data) {
                    clienteId = createResult.data.id;
                    toast.success('Cliente creado y asociado exitosamente');
                }
            }

            setClienteFacturacion({ id: clienteId, nombre: clienteInfo.nombre });
            setShowBuscarNitModal(false);
            setShowPaymentModal(true);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al procesar el cliente de Digifact');
        } finally {
            setSavingSalida(false);
        }
    };

    const executeSalida = async (values: any, forceEnLinea = false) => {
        if (!servicio) return;

        let cajaOptions = {};
        if (values.formaPago === METODO_PAGO.EFECTIVO && !forceEnLinea) {
            if (!cajaId) {
                forceEnLinea = true;
            } else {
                cajaOptions = {
                    caja_id: cajaId,
                    token_autorizado: cajaToken || ''
                };
            }
        }

        try {
            const efectivoFinal = values.formaPago === METODO_PAGO.EFECTIVO ? (values.montoRecibido ?? 0) : null;
            const vueltoFinal = values.formaPago === METODO_PAGO.EFECTIVO ? (values.vuelto ?? 0) : null;

            setSavingSalida(true);

            const filesToUpload: Record<string, File> = {};
            for (const [key, b64] of Object.entries(firmasSalidaBase64)) {
                const blob = await fetch(b64).then((res) => res.blob());
                const file = new File([blob], 'firma.png', { type: 'image/png' });
                filesToUpload[key] = await bajarCalidadImagen(file);
            }

            const updatedService = await servicioRepository.finalizarSalida(
                servicio.id,
                filesToUpload,
                values.formaPago,
                efectivoFinal,
                vueltoFinal,
                { ...cajaOptions, forzar_caja_en_linea: forceEnLinea },
                clienteFacturacion?.id ?? undefined
            );

            setShowPaymentModal(false);
            if (updatedService.factura) {
                toast.success('Servicio y factura finalizados correctamente');
            } else if (updatedService.factura_error) {
                toast.error(`Servicio finalizado, pero la factura falló: ${updatedService.factura_error}`);
            } else {
                toast.success('Servicio finalizado correctamente');
            }

            setFinishedServicioId(updatedService.id);
            setShowInvoicePreview(true);
            if (showCajaMismatchModal) {
                setShowCajaMismatchModal(false);
                setCajaMismatchPayload(null);
            }
        } catch (err: any) {
            console.error(err);
            if (err?.response?.data?.code === 'CAJA_TOKEN_MISMATCH' || err?.code === 'CAJA_TOKEN_MISMATCH') {
                setCajaMismatchPayload(values);
                setShowCajaMismatchModal(true);
            } else {
                toast.error('No se pudo finalizar el servicio');
            }
        } finally {
            setSavingSalida(false);
        }
    };



    const handleForceCajaEnLinea = async () => {
        if (!cajaMismatchPayload) return;
        await executeSalida(cajaMismatchPayload, true);
    };

    if (loading) {
        return (
            <Loading />
        );
    }

    if (error || !servicio) {
        return (
            <ErrorPageLoading
                text={error || 'Servicio no encontrado'}
                navigate={() => navigate('/servicios-vehiculo')}
            />
        );
    }

    return (
        <Box p={{ sm: 2, md: 4 }} maxWidth="1000px" margin="0 auto">
            <CajaStatusWidget />
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>
            <Typography variant="body2" color="text.primary">#{servicio.id}</Typography>
            <Box component={Paper} p={3}>
                <Grid container size={12} spacing={4}>
                    <Grid size={3} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={formatImage(user?.negocio?.logo_url || '/icons/asyncronix.png')}
                            alt={user?.negocio?.nombre_comercial || 'Logo'}
                            sx={{
                                height: 150,
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                            }}
                        />
                    </Grid>
                    <Grid size={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography textAlign="center" variant="h4" fontSize={{ sm: 20, md: 40, xl: 50 }} fontWeight={700} color="primary.main">
                            {user?.negocio?.nombre_comercial}
                        </Typography>
                    </Grid>
                    <Grid size={3} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={formatImage(user?.negocio?.logo_url || '/icons/asyncronix.png')}
                            alt={user?.negocio?.nombre_comercial || 'Logo'}
                            sx={{
                                height: 150,
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                            }}
                        />
                    </Grid>
                </Grid>
                <Grid container size={12} mt={2}>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }}>
                        <Typography color="error" variant="h5" fontWeight={500}>Servicio #{servicio.id.slice(0, 8)}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Fecha:</strong> {new Date(servicio.fecha_entrada ? servicio.fecha_entrada : '').toLocaleDateString()}</Typography>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Fecha Salida:</strong> {servicio.fecha_salida ? new Date(servicio.fecha_salida).toLocaleDateString() : '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Cliente:</strong> {servicio.cliente?.nombre ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Documento:</strong> {servicio.cliente?.dpi ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Vehiculo:</strong> {servicio.vehiculo?.modelo?.modelo ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Kilometraje:</strong> {(servicio.kilometraje || servicio.kilometraje === 0) ? servicio.kilometraje.toString() + ' km' : '-'}</Typography>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Kilometraje proximo servicio:</strong> {(servicio.kilometraje_proximo || servicio.kilometraje_proximo === 0) ? servicio.kilometraje_proximo.toString() + ' km' : 'No asignado'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Placa:</strong> {servicio.vehiculo?.placa ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Tipo de servicio:</strong> {servicio.tipo_servicio?.nombre ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Descripcion:</strong> {servicio.descripcion ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Diagnostico:</strong> {servicio.diagnostico ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Observaciones:</strong> {servicio.observaciones ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Estado:</strong></Typography>
                        <Chip label={servicio.estado ?? '-'} variant="outlined" color={getEstadoColor(servicio.estado)} />
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Grid container size={12} mt={2} justifyContent="center" alignItems="center">
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Mano de Obra (Subtotal): {subtotalManoObra ? formatMoney(subtotalManoObra) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Repuestos: {totalRepuestos ? formatMoney(totalRepuestos) : '-'}
                        </Typography>
                    </Grid>
                    {servicio.servicioReparacion && servicio.servicioReparacion.length > 0 && (
                        <>
                            <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                                <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                    Total Reparaciones: {totalReparaciones ? formatMoney(totalReparaciones) : '-'}
                                </Typography>
                            </Grid>
                            <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                                <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                    Total Repuestos Reparaciones: {totalRepuestosReparaciones ? formatMoney(totalRepuestosReparaciones) : '-'}
                                </Typography>
                            </Grid>
                        </>
                    )}
                    {servicio.servicioCustodias && servicio.servicioCustodias.length > 0 && (
                        <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                            <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                Total Custodias: {totalCustodias ? formatMoney(totalCustodias) : '-'}
                            </Typography>
                        </Grid>
                    )}
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 600, color: 'primary.dark', textTransform: 'uppercase', fontSize: '1.2rem', letterSpacing: '0.5px' }}>
                            Total Final: {formatMoney(totalCobro)}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Efectivo recibido: {servicio.efectivo_recibido != null ? formatMoney(servicio.efectivo_recibido) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Vuelto: {servicio.vuelto != null ? formatMoney(servicio.vuelto) : '-'}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                {showImages ? (
                    <>
                        <Button sx={{ margin: 2 }} variant="outlined" onClick={() => setShowImages(false)}>
                            Ocultar imágenes
                        </Button>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" mb={2}>Imágenes del servicio</Typography>
                                    <ServiceImages servicio={servicio} onUpdate={(s) => setServicio(s)} isMobile={isMobile} />
                                </Paper>
                            </Grid>
                        </Grid>
                    </>
                ) : (
                    <Button sx={{ margin: 2 }} variant="outlined" onClick={() => setShowImages(true)}>
                        Ver imágenes
                    </Button>
                )}
                <Divider sx={{ my: 3 }} />
                <Grid container size={12} mt={2} justifyContent="center" alignItems="center">
                    <Typography
                        variant="h6"
                        component="h2"
                        textAlign="center"
                        sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                    >
                        Checklist de Recepción
                    </Typography>
                    <ListTableSimple
                        columns={[
                            { id: 'item', name: 'Item', format: (value) => value.nombre || '-' },
                            { id: 'estado', name: 'Estado' },
                            { id: 'observaciones', name: 'Observaciones', format: (value) => value || '-' }
                        ]}
                        data={servicio.checklist || []}
                        headerBgColor={'primary.main'}
                        headerTextColor="#fff"
                    />
                </Grid>
                <Grid container size={12} mt={2} justifyContent="start" alignItems="center">
                    <Typography
                        variant="h6"
                        component="h2"
                        textAlign="start"
                        sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                    >
                        Tareas del Servicio {servicio.tipo_servicio?.nombre ? `- ${servicio.tipo_servicio.nombre}` : ''}
                    </Typography>
                    <ListTableSimple
                        columns={[
                            { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                            { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                            { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' }
                        ]}
                        data={tareasNormales}
                        headerBgColor={'primary.main'}
                        headerTextColor="#fff"
                    />
                </Grid>
                {tareasExtras.length > 0 && (
                    <Grid container size={12} mt={2} justifyContent="start" alignItems="center">
                        <Typography
                            variant="h6"
                            component="h2"
                            textAlign="start"
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Servicios Extras
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                                { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                                { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' }
                            ]}
                            data={tareasExtras}
                            headerBgColor={'primary.main'}
                            headerTextColor="#fff"
                        />
                    </Grid>
                )}
                <Grid container size={12} mt={2} justifyContent="space-between" alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }} alignItems="center">
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Repuestos del cliente
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'repuesto', name: 'Repuesto' },
                                { id: 'cantidad', name: 'Cantidad' }
                            ]}
                            data={servicio.repuestos || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }} alignItems="center">
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Repuestos del inventario
                        </Typography>
                        <ListTableSimple
                            columns={[
                                {
                                    id: 'variante', name: 'Repuesto', format: (variante) => {
                                        if (!variante) return '-';
                                        const atributos = (variante.valores ?? []).map((v: VarianteValor) => `${v.atributo?.nombre}: ${v.valor}`).join(', ');
                                        return `${variante.producto?.nombre || '-'} ${atributos ? `(${atributos})` : ''}`;
                                    }
                                },
                                { id: 'cantidad', name: 'Cantidad' },
                                { id: 'precio_venta', name: 'Precio', format: (value) => value ? formatMoney(value) : '-' },
                                {
                                    id: 'total', name: 'Total', format: (_value, row) => {
                                        if (row.precio_venta && row.cantidad) {
                                            return formatMoney(row.precio_venta * row.cantidad);
                                        }
                                        return '-';
                                    }
                                }
                            ]}
                            data={servicio.repuestos_inventario || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }} alignItems="center">
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Cambios de repuestos para el siguiente servicio
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'item', name: 'Item' }
                            ]}
                            data={servicio.cambios_siguiente_servicio || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>

                </Grid>
                <Grid container size={12} mt={2} justifyContent="center" alignItems="center" spacing={2}>
                    <Grid size={12}>
                        <Typography variant="h6" mb={1} textAlign="center">Firmas Requeridas</Typography>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            {servicio.firma_entrada ? (
                                <CardMedia component="img" image={formatImage(servicio.firma_entrada)} alt="Firma de entrada" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                    <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                </Box>
                            )}
                            <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Cliente (Entrada)</Typography>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <Box>
                            {getSignaturePreview('firma_cliente', servicio.firma_salida) ? (
                                <CardMedia component="img" image={getSignaturePreview('firma_cliente', servicio.firma_salida)!} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                    <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                </Box>
                            )}
                            <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Cliente (Salida Servicio)</Typography>
                            <Box display="flex" justifyContent="center">
                                <Button size="small" variant="outlined" onClick={() => handleOpenSignaturePad('firma_cliente')} disabled={!isSalidaState || !hasSalidaPermission}>
                                    Firmar Salida Servicio
                                </Button>
                            </Box>
                        </Box>
                    </Grid>

                    {servicio.servicioReparacion && servicio.servicioReparacion.length > 0 && (
                        <Grid size={12} mt={4}>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="h5" textAlign="center" color="primary.main" fontWeight={600} mb={3}>
                                Reparaciones Asociadas
                            </Typography>
                        </Grid>
                    )}
                    {servicio.servicioReparacion?.map((rep, index) => (
                        <Grid container size={12} key={rep.id} spacing={3} sx={{ backgroundColor: '#fdfdfd', borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3 }}>
                            <Grid size={12}>
                                <Typography variant="h6" color="primary">Reparación #{index + 1}</Typography>
                                {rep.descripcion && (
                                    <Typography variant="body1" mt={1} color="text.secondary">
                                        <strong>Descripción:</strong> {rep.descripcion}
                                    </Typography>
                                )}
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" mb={1} fontWeight={600} color="text.secondary" textTransform="uppercase">Repuestos Solicitados</Typography>
                                <ListTableSimple
                                    columns={[
                                        { id: 'descripccion', name: 'Descripción' },
                                        { id: 'cantidad', name: 'Cant.' },
                                        { id: 'procedencia', name: 'Procedencia' }
                                    ]}
                                    data={rep.servicioReparacionRepuestos || []}
                                    headerBgColor={theme.palette.primary.main}
                                />
                            </Grid>

                            <Grid size={{ xs: 12, md: 6 }}>
                                <Typography variant="subtitle2" mb={1} fontWeight={600} color="text.secondary" textTransform="uppercase">Repuestos de Inventario</Typography>
                                <ListTableSimple
                                    columns={[
                                        { id: 'id', name: 'Producto', format: (_, r: any) => r.variante?.producto?.nombre || 'Sin nombre' },
                                        { id: 'cantidad', name: 'Cant.' }
                                    ]}
                                    data={rep.servicioRepuestos || []}
                                    headerBgColor={theme.palette.primary.main}
                                />
                            </Grid>

                            <Grid size={12} mt={2}>
                                <Typography variant="subtitle1" fontWeight={600} mb={1} textAlign="center">Firmas de la Reparación</Typography>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box sx={{ width: '100%', maxWidth: 300 }}>
                                    {rep.firma_entrada ? (
                                        <CardMedia component="img" image={formatImage(rep.firma_entrada)} alt="Firma de entrada" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                            <Typography sx={{ height: 150, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                        </Box>
                                    )}
                                    <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1} mt={1}>Firma Entrada Reparación {index + 1}</Typography>
                                </Box>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box sx={{ width: '100%', maxWidth: 300 }}>
                                    {getSignaturePreview(`firma_reparacion_${rep.id}`, rep.firma_salida) ? (
                                        <CardMedia component="img" image={getSignaturePreview(`firma_reparacion_${rep.id}`, rep.firma_salida)!} alt={`Firma Reparación ${index + 1}`} sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                            <Typography sx={{ height: 150, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                        </Box>
                                    )}
                                    <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1} mt={1}>Firma Salida Reparación {index + 1}</Typography>
                                    {!rep.firma_salida && (
                                        <Box display="flex" justifyContent="center">
                                            <Button size="small" variant="outlined" onClick={() => handleOpenSignaturePad(`firma_reparacion_${rep.id}`)} disabled={!isSalidaState || !hasSalidaPermission}>
                                                Firmar Reparación
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    ))}

                    {servicio.servicioCustodias && servicio.servicioCustodias.length > 0 && (
                        <Grid size={12} mt={4}>
                            <Divider sx={{ mb: 3 }} />
                            <Typography variant="h5" textAlign="center" color="primary.main" fontWeight={600} mb={3}>
                                Custodias Asociadas
                            </Typography>
                        </Grid>
                    )}
                    {servicio.servicioCustodias?.map((cust, index) => (
                        <Grid container size={12} key={cust.id} spacing={3} sx={{ backgroundColor: '#fdfdfd', borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3 }}>
                            <Grid size={12}>
                                <Typography variant="h6" color="primary">Custodia #{index + 1}</Typography>
                                {cust.descripcion && (
                                    <Typography variant="body1" mt={1} color="text.secondary">
                                        <strong>Descripción:</strong> {cust.descripcion}
                                    </Typography>
                                )}
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    <strong>Tiempo:</strong> {new Date(cust.fecha_entrada).toLocaleDateString()} a {cust.fecha_salida ? new Date(cust.fecha_salida).toLocaleDateString() : 'Pendiente'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" mt={1}>
                                    <strong>Costo:</strong> {formatMoney(cust.total)}
                                </Typography>
                            </Grid>

                            <Grid size={12} mt={2}>
                                <Typography variant="subtitle1" fontWeight={600} mb={1} textAlign="center">Firma de la Custodia</Typography>
                            </Grid>

                            <Grid size={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box sx={{ width: '100%', maxWidth: 300 }}>
                                    {getSignaturePreview(`firma_custodia_${cust.id}`, cust.firma_salida) ? (
                                        <CardMedia component="img" image={getSignaturePreview(`firma_custodia_${cust.id}`, cust.firma_salida)!} alt={`Firma Custodia ${index + 1}`} sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                    ) : (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                            <Typography sx={{ height: 150, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                        </Box>
                                    )}
                                    <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1} mt={1}>Firma Salida Custodia {index + 1}</Typography>
                                    {!cust.firma_salida && (
                                        <Box display="flex" justifyContent="center">
                                            <Button size="small" variant="outlined" onClick={() => handleOpenSignaturePad(`firma_custodia_${cust.id}`)} disabled={!isSalidaState || !hasSalidaPermission}>
                                                Firmar Custodia
                                            </Button>
                                        </Box>
                                    )}
                                </Box>
                            </Grid>
                        </Grid>
                    ))}
                </Grid>

                <Box mt={3} p={3} sx={{ backgroundColor: '#f9fafb', borderRadius: 2 }}>
                    <Typography variant="h6" mb={2}>Finalizar salida</Typography>
                    {!hasSalidaPermission && (
                        <Typography color="error" mb={2}>No tienes permiso para finalizar la salida de este servicio.</Typography>
                    )}
                    {!isSalidaState && (
                        <Typography color="text.secondary" mb={2}>El servicio debe estar en un estado válido (LISTO ENTREGA, EN REPARACION o EN CUSTODIA) para finalizar la salida.</Typography>
                    )}
                    <Grid container spacing={3} mt={2}>
                        <Grid size={12}>
                            <Button
                                variant="contained"
                                color="success"
                                fullWidth
                                onClick={handleInitSalida}
                                disabled={!isSalidaState || !hasSalidaPermission || savingSalida}
                            >
                                {savingSalida ? 'Procesando...' : 'Finalizar Servicio'}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>
            </Box>

            <BuscarClientePorNitModal
                open={showBuscarNitModal}
                onClose={() => setShowBuscarNitModal(false)}
                onSuccess={handleDigifactClient}
            />

            <FormaPagoModal
                open={showPaymentModal}
                onClose={() => setShowPaymentModal(false)}
                onConfirm={(payload) => executeSalida({
                    formaPago: payload.metodo,
                    montoRecibido: payload.efectivo_recibido,
                    vuelto: payload.vuelto
                })}
                total={totalCobro}
                clienteLabel={clienteFacturacion?.nombre || 'Consumidor Final'}
                loading={savingSalida}
            />

            <DocumentPreviewModal
                open={showInvoicePreview}
                documentoId={finishedServicioId}
                tipoDocumento="SERVICIO"
                onClose={() => {
                    setShowInvoicePreview(false);
                    navigate(`/servicios-vehiculo/${finishedServicioId}/hoja`);
                }}
            />

            <SignaturePadModal
                open={openSignaturePad}
                onSave={handleSaveSignature}
                onCancel={handleCloseSignaturePad}
                onConfirm={handleConfirmSignature}
                saving={savingSalida}
                title="Firma de Salida"
                description="Por favor, dibuja tu firma para finalizar la salida del servicio."
            />
            <CajaMismatchModal
                open={showCajaMismatchModal}
                onClose={() => setShowCajaMismatchModal(false)}
                onForce={handleForceCajaEnLinea}
                loading={savingSalida}
            />

            <Backdrop
                sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.modal + 9999 })}
                open={savingSalida}
            >
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                    <CircularProgress color="inherit" />
                    <Typography variant="h6" fontWeight="bold" color="white">
                        Finalizando servicio y procesando factura...
                    </Typography>
                </Box>
            </Backdrop>
        </Box>
    );
};

export default ServicioSalidaPage;
