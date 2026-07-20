import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Autocomplete, Box, Button, CardMedia, Chip, Divider, Grid, Paper, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
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
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import SignaturePadModal from '../components/modals/SignaturePadModal';
import type { VarianteValor } from '../../../productos/domain/interfaces/producto.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useDeviceStore } from '../../../../core/store/deviceStore';
import CajaMismatchModal from '../../../../shared/components/ui/modals/CajaMismatchModal';
import CajaStatusWidget from '../../../../shared/components/ui/widgets/CajaStatusWidget';
import { formatImage } from '../../../../core/utils/formatImage';


const salidaSchema = z.object({
    metodo_pago: z.enum(Object.values(METODO_PAGO) as [string, ...string[]], 'El método de pago es requerido'),
    efectivo_recibido: z.number().nonnegative().optional().nullable(),
    vuelto: z.number().nonnegative().optional().nullable()
}).superRefine((data, ctx) => {
    if (data.metodo_pago !== METODO_PAGO.EFECTIVO) return;

    if (data.efectivo_recibido == null) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'El efectivo recibido es obligatorio para pagos en efectivo',
            path: ['efectivo_recibido']
        });
    }
});

type SalidaForm = z.infer<typeof salidaSchema>;

const ServicioSalidaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showImages, setShowImages] = useState(false);
    const [openSignaturePad, setOpenSignaturePad] = useState(false);
    const [firmaSalidaBase64, setFirmaSalidaBase64] = useState<string | null>(null);
    const [savingSalida, setSavingSalida] = useState(false);

    const [showCajaMismatchModal, setShowCajaMismatchModal] = useState(false);
    const [cajaMismatchPayload, setCajaMismatchPayload] = useState<SalidaForm | null>(null);

    const { cajaId, token: cajaToken } = useDeviceStore();

    const user = useAuthStore((state: any) => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const hasSalidaPermission = useMemo(() => user?.permisos?.includes('SALIDA_SERVICIOS'), [user]);
    const form = useForm<SalidaForm>({
        resolver: zodResolver(salidaSchema),
        defaultValues: { metodo_pago: '', efectivo_recibido: null, vuelto: null }
    });

    const metodoPago = form.watch('metodo_pago');
    const efectivoRecibido = form.watch('efectivo_recibido');

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

    const firmaSalidaPreview = useMemo(() => {
        if (firmaSalidaBase64) return firmaSalidaBase64;
        if (servicio?.firma_salida) return formatImage(servicio.firma_salida);
        return null;
    }, [firmaSalidaBase64, servicio]);

    const isSalidaState = servicio?.estado === ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA;

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
    const totalCobro = (servicio?.total ?? 0) + totalRepuestos;
    const diferenciaPago = useMemo(() => {
        const recibido = Number(efectivoRecibido ?? 0);
        if (!Number.isFinite(recibido)) return -totalCobro;
        return recibido - totalCobro;
    }, [efectivoRecibido, totalCobro]);
    const isCashInsufficient = metodoPago === METODO_PAGO.EFECTIVO && diferenciaPago < 0;
    const vueltoCalculado = useMemo(() => {
        const recibido = Number(efectivoRecibido ?? 0);
        if (!Number.isFinite(recibido)) return 0;
        return Math.max(0, recibido - totalCobro);
    }, [efectivoRecibido, totalCobro]);

    useEffect(() => {
        if (metodoPago !== METODO_PAGO.EFECTIVO) {
            form.setValue('efectivo_recibido', null);
            form.setValue('vuelto', null);
            return;
        }

        form.setValue('vuelto', vueltoCalculado);
    }, [metodoPago, vueltoCalculado, form]);
    const tareasNormales = (servicio?.tareas || []).filter((tarea) => !tarea.extra);
    const tareasExtras = (servicio?.tareas || []).filter((tarea) => tarea.extra);

    const handleOpenSignaturePad = () => setOpenSignaturePad(true);
    const handleCloseSignaturePad = () => setOpenSignaturePad(false);
    const handleSaveSignature = (base64: string | null) => setFirmaSalidaBase64(base64);
    const handleConfirmSignature = () => {
        if (!firmaSalidaBase64 && !servicio?.firma_salida) {
            toast.error('La firma de salida es obligatoria');
            return;
        }
        setOpenSignaturePad(false);
    };

    const executeSalida = async (values: SalidaForm, forceEnLinea = false) => {
        if (!servicio) return;
        if (!isSalidaState) {
            toast.error('El servicio no está en estado LISTO_ENTREGA');
            return;
        }

        const base64 = firmaSalidaBase64 ?? servicio.firma_salida;
        if (!base64) {
            toast.error('Debes capturar la firma de salida antes de finalizar');
            return;
        }

        if (values.metodo_pago === METODO_PAGO.EFECTIVO && (values.efectivo_recibido ?? 0) < totalCobro) {
            toast.error('El efectivo recibido no puede ser menor al total a cobrar');
            return;
        }

        let cajaOptions = {};
        if (values.metodo_pago === METODO_PAGO.EFECTIVO && !forceEnLinea) {
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
            const efectivoFinal = values.metodo_pago === METODO_PAGO.EFECTIVO ? (values.efectivo_recibido ?? 0) : null;
            const vueltoFinal = values.metodo_pago === METODO_PAGO.EFECTIVO ? Math.max(0, (values.efectivo_recibido ?? 0) - totalCobro) : null;

            setSavingSalida(true);
            const blob = await fetch(base64).then((response) => response.blob());
            const file = new File([blob], 'firma_salida.png', { type: 'image/png' });
            const updatedService = await servicioRepository.finalizarSalida(
                servicio.id,
                file,
                values.metodo_pago,
                efectivoFinal,
                vueltoFinal,
                { ...cajaOptions, forzar_caja_en_linea: forceEnLinea }
            );
            setServicio(updatedService);
            toast.success('Servicio finalizado correctamente');
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

    const handleSubmitSalida = (values: SalidaForm) => {
        executeSalida(values, false);
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
            <Box component={Paper} p={3}>
                <Grid container size={12} spacing={4}>
                    <Grid size={3} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={import.meta.env.VITE_API_URL + '/' + (user?.negocio?.logo_url || '/icons/asyncronix.png')}
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
                            src={import.meta.env.VITE_API_URL + '/' + (user?.negocio?.logo_url || '/icons/asyncronix.png')}
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
                            Total Servicio: {servicio.total ? formatMoney(servicio.total) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Repuestos: {totalRepuestos ? formatMoney(totalRepuestos) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total: {formatMoney(totalCobro)}
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
                            {firmaSalidaPreview ? (
                                <CardMedia component="img" image={firmaSalidaPreview} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                            ) : (
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                    <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                </Box>
                            )}
                            <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Cliente (Salida)</Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Box mt={3} p={3} sx={{ backgroundColor: '#f9fafb', borderRadius: 2 }}>
                    <Typography variant="h6" mb={2}>Finalizar salida</Typography>
                    {!hasSalidaPermission && (
                        <Typography color="error" mb={2}>No tienes permiso para finalizar la salida de este servicio.</Typography>
                    )}
                    {servicio.estado !== ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA && (
                        <Typography color="text.secondary" mb={2}>El servicio debe estar en estado LISTO_ENTREGA para finalizar la salida.</Typography>
                    )}
                    <form onSubmit={form.handleSubmit(handleSubmitSalida)}>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Controller
                                    name="metodo_pago"
                                    control={form.control}
                                    render={({ field }) => (
                                        <Autocomplete
                                            options={Object.values(METODO_PAGO)}
                                            value={field.value || ''}
                                            onChange={(_, newValue) => field.onChange(newValue)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Método de pago"
                                                    error={Boolean(form.formState.errors.metodo_pago)}
                                                    helperText={form.formState.errors.metodo_pago?.message}
                                                />
                                            )}
                                        />
                                    )}
                                />
                            </Grid>
                            {metodoPago === METODO_PAGO.EFECTIVO && (
                                <>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Controller
                                            name="efectivo_recibido"
                                            control={form.control}
                                            render={({ field }) => (
                                                <TextField
                                                    label="Efectivo recibido"
                                                    type="number"
                                                    value={field.value ?? ''}
                                                    onChange={(event) => {
                                                        const value = event.target.value;
                                                        field.onChange(value === '' ? null : Number(value));
                                                    }}
                                                    inputProps={{ min: 0, step: 0.01 }}
                                                    fullWidth
                                                    error={Boolean(form.formState.errors.efectivo_recibido) || isCashInsufficient}
                                                    helperText={
                                                        form.formState.errors.efectivo_recibido?.message
                                                        ?? (metodoPago === METODO_PAGO.EFECTIVO
                                                            ? `Diferencia: ${formatMoney(diferenciaPago)}`
                                                            : undefined)
                                                    }
                                                />
                                            )}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, md: 6 }}>
                                        <Box sx={{ p: 1 }}>
                                            <Typography variant="body2" color={isCashInsufficient ? 'error.main' : 'text.secondary'}>
                                                {isCashInsufficient
                                                    ? `Faltante: ${formatMoney(diferenciaPago)}`
                                                    : `Vuelto: ${formatMoney(vueltoCalculado)}`}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </>
                            )}
                            <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', alignItems: 'center' }}>
                                <Button variant="outlined" onClick={handleOpenSignaturePad} disabled={!isSalidaState || !hasSalidaPermission}>
                                    Capturar firma de salida
                                </Button>
                            </Grid>
                            <Grid size={12}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="success"
                                    disabled={!isSalidaState || !hasSalidaPermission || savingSalida || isCashInsufficient}
                                >
                                    {savingSalida ? 'Procesando...' : 'Dar salida'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Box>
            </Box>
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
        </Box>
    );
};

export default ServicioSalidaPage;
