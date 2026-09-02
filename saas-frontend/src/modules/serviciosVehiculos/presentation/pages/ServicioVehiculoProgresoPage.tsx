import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Stack, Typography, useMediaQuery, useTheme, Link, Grid, Paper } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import ServiceGeneralInfo from '../components/ServiceGeneralInfo';
import ServiceProgressImages from '../components/ServiceProgressImages';
import ServiceProgressObservaciones from '../components/ServiceProgressObservaciones';
import { ESTADO_SERVICIO_VEHICULO, type EstadoVehiculoServicio } from '../../domain/servicio.constants';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import { useAuthStore } from '../../../../core/store/authStore';
import ServiceProgressTasks from '../components/ServiceProgressTasks';
import type { VarianteValor } from '../../../productos/domain/interfaces/producto.interface';
import ServiceNextServiceChanges from '../components/ServiceNextServiceChanges';
import SignaturePadModal from '../components/modals/SignaturePadModal';
import { bajarCalidadImagen } from '../../../../core/utils/bajarCalidadImagen';

const allowedStates: EstadoVehiculoServicio[] = [
    ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
    ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS,
    ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS,
    ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA,
    ESTADO_SERVICIO_VEHICULO.EN_REPARACION,
    ESTADO_SERVICIO_VEHICULO.EN_CUSTODIA
];

const ServicioProgresoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const user = useAuthStore((state) => state.user);

    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [changingState, setChangingState] = useState(false);

    const [openSignaturePad, setOpenSignaturePad] = useState(false);
    const [signatureReparacion, setSignatureReparacion] = useState<string | null>(null);

    const fetchService = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await servicioRepository.obtener(id);
            setServicio(response);
            console.log('Servicio cargado:', response);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el servicio.');
            navigate('/servicios-vehiculo');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchService(); }, [fetchService]);

    useEffect(() => {
        if (servicio && !allowedStates.includes(servicio.estado)) {
            toast.error('El servicio no está en un estado válido para ver progreso.');
            navigate(`/servicios-vehiculo/${servicio.id}`);
        }
    }, [servicio, navigate]);

    const handleTransitionToPruebas = async () => {
        if (!servicio) return;
        try {
            setChangingState(true);
            await servicioRepository.cambiarEstado(servicio.id, ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            toast.success('Servicio pasado a EN_PRUEBAS correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cambiar el estado a EN_PRUEBAS');
        } finally {
            setChangingState(false);
        }
    };



    const handleTransitionToServicio = async () => {
        if (!servicio) return;
        try {
            setChangingState(true);
            await servicioRepository.cambiarEstado(servicio.id, ESTADO_SERVICIO_VEHICULO.EN_SERVICIO);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            toast.success('Servicio pasado a EN_SERVICIO correctamente');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cambiar el estado a EN_SERVICIO');
        } finally {
            setChangingState(false);
        }
    };

    const handleApproveForDelivery = async () => {
        if (!servicio) return;
        try {
            setChangingState(true);
            await servicioRepository.listoSalida(servicio.id);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            toast.success('Servicio aprobado y pasado a LISTO_ENTREGA');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo aprobar el servicio');
        } finally {
            setChangingState(false);
        }
    };

    const handleMandarCustodia = async () => {
        if (!servicio) return;
        try {
            setChangingState(true);
            await servicioRepository.mandarCustodia(servicio.id);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            toast.success('Servicio enviado a custodia');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo enviar a custodia');
        } finally {
            setChangingState(false);
        }
    };

    const handleConfirmSignatureReparacion = async () => {
        if (!servicio || !signatureReparacion) {
            toast.error('Por favor, ingresa y guarda la firma de entrada');
            return;
        }
        try {
            setChangingState(true);
            const response = await fetch(signatureReparacion);
            const blob = await response.blob();
            const file = new File([blob], 'firma.png', { type: 'image/png' });
            const processedFile = await bajarCalidadImagen(file);

            await servicioRepository.mandarReparacion(servicio.id, processedFile);
            const updated = await servicioRepository.obtener(servicio.id);
            setServicio(updated);
            setOpenSignaturePad(false);
            setSignatureReparacion(null);
            toast.success('Servicio enviado a reparación');
        } catch (error) {
            console.error(error);
            toast.error('No se pudo enviar a reparación');
        } finally {
            setChangingState(false);
        }
    };

    if (loading) return <Loading />;

    if (!servicio) {
        return (
            <Box p={4}>
                <Typography variant="h6">Servicio no encontrado</Typography>
                <Button variant="contained" onClick={() => navigate('/servicios-vehiculo')} sx={{ mt: 2 }}>
                    Volver a servicios
                </Button>
            </Box>
        );
    }

    const canTransition = servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_SERVICIO;
    const isLocked = servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS;
    const isAdminServicios = user?.permisos.includes('ADMIN_SERVICIOS') ?? false;
    const canEditObservaciones = servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_SERVICIO
        ? true
        : servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS
            ? isAdminServicios
            : false;
    const observacionesViewStates: EstadoVehiculoServicio[] = [
        ESTADO_SERVICIO_VEHICULO.EN_SERVICIO,
        ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS
    ];
    const canViewObservaciones = observacionesViewStates.includes(servicio.estado);
    const canEditCambios = servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_SERVICIO || servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_REPARACION || servicio.estado === ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS
        ? true
        : servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS
            ? isAdminServicios
            : false;
    const tareasNormales = (servicio.tareas || []).filter((tarea) => !tarea.extra);
    const tareasExtras = (servicio.tareas || []).filter((tarea) => tarea.extra);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Stack spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/servicios-vehiculo')}>
                            <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                        </Link>
                        <Typography color="text.primary">Progreso</Typography>
                    </Breadcrumbs>
                    <Typography variant="body2" color="text.primary">#{servicio.id}</Typography>
                </Box>

                <Grid size={12} alignItems="center">
                    <ServiceGeneralInfo servicio={servicio} />
                </Grid>

                <Grid container size={12} alignItems="center" justifyContent="space-between" gap={2}>
                    <Grid size={{ xs: 12, sm: 5 }} alignItems="center">
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 600, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Repuestos del cliente
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'repuesto', name: 'Repuesto' },
                                { id: 'cantidad', name: 'Cantidad' },
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
                            sx={{ fontWeight: 600, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
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
                            ]}
                            data={servicio.repuestos_inventario || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                    <Grid size={12} alignItems="center">
                        <Typography
                            variant="h6"
                            component="h2"
                            sx={{ fontWeight: 600, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Checklist de Recepción
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'item', name: 'Item', format: (value) => value.nombre || '-' },
                                { id: 'estado', name: 'Estado' },
                                { id: 'observaciones', name: 'Observaciones', format: (value) => value || '-' },
                            ]}
                            data={servicio.checklist || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                </Grid>

                <Grid container spacing={2}>
                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 600, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                    >
                        Tareas del Servicio {servicio.tipo_servicio?.nombre ? `- ${servicio.tipo_servicio.nombre}` : ''}
                    </Typography>
                    <Grid size={12}>
                        <ServiceProgressTasks
                            servicio={servicio}
                            tareas={tareasNormales}
                            onUpdate={(s) => setServicio(s)}
                            emptyMessage="No hay tareas del servicio para este registro."
                        />
                    </Grid>

                    <Typography
                        variant="h6"
                        component="h2"
                        sx={{ fontWeight: 600, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                    >
                        Servicios Extras
                    </Typography>
                    <Grid size={12}>
                        <ServiceProgressTasks
                            servicio={servicio}
                            tareas={tareasExtras}
                            onUpdate={(s) => setServicio(s)}
                            emptyMessage="No hay servicios extras para este registro."
                        />
                    </Grid>
                    <Grid size={12} alignItems="center">
                        <ServiceProgressObservaciones
                            servicio={servicio}
                            canEdit={canEditObservaciones}
                            canView={canViewObservaciones}
                            onUpdate={(s) => setServicio(s)}
                        />
                    </Grid>
                    <Grid size={12} alignItems="center">
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Cambios para el siguiente servicio</Typography>
                            <ServiceNextServiceChanges
                                servicio={servicio}
                                canEdit={canEditCambios}
                                onUpdate={(s) => setServicio(s)}
                            />
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} alignItems="center">
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Imágenes de progreso</Typography>
                            <ServiceProgressImages servicio={servicio} onUpdate={(s) => setServicio(s)} isMobile={isMobile} />
                        </Paper>
                    </Grid>
                </Grid>
                <Grid size={12} alignItems="center" gap={2}>
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Acciones</Typography>

                        {canTransition ? (
                            <Button variant="contained" disabled={changingState} onClick={handleTransitionToPruebas}>
                                {changingState ? 'Cambiando estado...' : 'Pasar a EN_PRUEBAS'}
                            </Button>
                        ) : null}

                        {isLocked ? (
                            <Typography color="text.secondary">El servicio está en EN_PRUEBAS. Edición y carga quedan bloqueadas.</Typography>

                        ) : null}

                        {isLocked && servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS && user?.permisos.includes('ADMIN_SERVICIOS') ? (
                            <Button color="secondary" variant="contained" disabled={changingState} onClick={handleTransitionToServicio}>
                                {changingState ? 'Cambiando estado...' : 'No aprobadas, regresar a EN_SERVICIO'}
                            </Button>
                        ) : null}
                        {servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS && user?.permisos.includes('ADMIN_SERVICIOS') ? (
                            <Button sx={{ ml: 2 }} color="success" variant="outlined" disabled={changingState} onClick={handleApproveForDelivery}>
                                {changingState ? 'Procesando...' : 'Aprobar y marcar LISTO_ENTREGA'}
                            </Button>
                        ) : null}

                        {/* Nuevas Acciones: Reparación y Custodia */}
                        <Stack direction="row" spacing={2} mt={2}>
                            {([ESTADO_SERVICIO_VEHICULO.EN_SERVICIO, ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS] as string[]).includes(servicio.estado) && (
                                <Button color="warning" variant="contained" disabled={changingState} onClick={() => setOpenSignaturePad(true)}>
                                    Mandar a Reparación
                                </Button>
                            )}
                            {([ESTADO_SERVICIO_VEHICULO.EN_SERVICIO, ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS, ESTADO_SERVICIO_VEHICULO.EN_REPARACION] as string[]).includes(servicio.estado) && (
                                <Button color="error" variant="outlined" disabled={changingState} onClick={handleMandarCustodia}>
                                    Mandar a Custodia
                                </Button>
                            )}
                            {servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_REPARACION && (
                                <Button color="primary" variant="contained" onClick={() => navigate(`/servicios-vehiculo/${servicio.id}/reparacion`)}>
                                    Configurar Reparación
                                </Button>
                            )}
                        </Stack>

                    </Paper>
                </Grid>
            </Stack>

            <SignaturePadModal
                open={openSignaturePad}
                onSave={setSignatureReparacion}
                onCancel={() => setOpenSignaturePad(false)}
                onConfirm={handleConfirmSignatureReparacion}
                saving={changingState}
                title="Firma de autorización de reparación"
                description="Por favor, dibuja tu firma para autorizar que el servicio pase a Reparación."
            />
        </Box>
    );
};

export default ServicioProgresoPage;
