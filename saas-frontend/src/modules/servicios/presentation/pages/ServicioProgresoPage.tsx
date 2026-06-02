import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Stack, Typography, useMediaQuery, useTheme, Link, Grid, Paper } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import ServiceGeneralInfo from '../components/ServiceGeneralInfo';
import ServiceProgressImages from '../components/ServiceProgressImages';
import ServiceProgressObservaciones from '../components/ServiceProgressObservaciones';
import { ESTADO_SERVICIO, type EstadoServicio } from '../../domain/servicio.constants';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import { useAuthStore } from '../../../../core/store/authStore';
import ServiceProgressTasks from '../components/ServiceProgressTasks';

const allowedStates: EstadoServicio[] = [
    ESTADO_SERVICIO.EN_SERVICIO,
    ESTADO_SERVICIO.EN_PRUEBAS,
    ESTADO_SERVICIO.ESPERA_REPUESTOS
];

const ServicioProgresoPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const user = useAuthStore((state) => state.user);

    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [loading, setLoading] = useState(true);
    const [changingState, setChangingState] = useState(false);

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
            navigate('/servicios');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => { fetchService(); }, [fetchService]);

    useEffect(() => {
        if (servicio && !allowedStates.includes(servicio.estado)) {
            toast.error('El servicio no está en un estado válido para ver progreso.');
            navigate(`/servicios/${servicio.id}`);
        }
    }, [servicio, navigate]);

    const handleTransitionToPruebas = async () => {
        if (!servicio) return;
        try {
            setChangingState(true);
            await servicioRepository.cambiarEstado(servicio.id, ESTADO_SERVICIO.EN_PRUEBAS);
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
            await servicioRepository.cambiarEstado(servicio.id, ESTADO_SERVICIO.EN_SERVICIO);
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

    if (loading) return <Loading />;

    if (!servicio) {
        return (
            <Box p={4}>
                <Typography variant="h6">Servicio no encontrado</Typography>
                <Button variant="contained" onClick={() => navigate('/servicios')} sx={{ mt: 2 }}>
                    Volver a servicios
                </Button>
            </Box>
        );
    }

    const canTransition = servicio.estado === ESTADO_SERVICIO.EN_SERVICIO;
    const isLocked = servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS;
    const canEditObservaciones = servicio.estado === ESTADO_SERVICIO.EN_SERVICIO
        ? (user?.permisos.includes('EDITAR_SERVICIOS') || user?.permisos.includes('ADMIN_SERVICIOS')) ?? false
        : servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS
            ? user?.permisos.includes('ADMIN_SERVICIOS') ?? false
            : false;
    const observacionesViewStates: EstadoServicio[] = [ESTADO_SERVICIO.EN_SERVICIO, ESTADO_SERVICIO.EN_PRUEBAS];
    const canViewObservaciones = observacionesViewStates.includes(servicio.estado);

    return (
        <Box p={isMobile ? 2 : 4}>
            <Stack spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/servicios')}>
                            <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                        </Link>
                        <Typography color="text.primary">Progreso</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">Progreso del Servicio #{servicio.id.slice(-12)}</Typography>
                </Box>

                <Grid size={ 12 } alignItems="center">
                    <ServiceGeneralInfo servicio={servicio} />
                </Grid>


                <Grid size={ 12 }  alignItems="center" gap={2}>
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

                {isLocked && servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS && user?.permisos.includes('ADMIN_SERVICIOS') ? (
                        <Button color="secondary" variant="contained" disabled={changingState} onClick={handleTransitionToServicio}>
                            {changingState ? 'Cambiando estado...' : 'No aprobadas, regresar a EN_SERVICIO'}
                        </Button>                        
                    ) : null}
                    {servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS && user?.permisos.includes('ADMIN_SERVICIOS') ? (
                        <Button sx={{ ml: 2 }} color="success" variant="outlined" disabled={changingState} onClick={handleApproveForDelivery}>
                            {changingState ? 'Procesando...' : 'Aprobar y marcar LISTO_ENTREGA'}
                        </Button>
                    ) : null}
                    </Paper>
                </Grid>

                <Grid container size={ 12 } alignItems="center" justifyContent="space-between" gap={2}>
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
                                { id: 'producto', name: 'Repuesto', format: (value) => value.nombre || '-' },
                                { id: 'cantidad', name: 'Cantidad' },
                            ]}
                            data={servicio.repuestos_inventario || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                    <Grid size={ 12 } alignItems="center">
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
                        Tareas de progreso {servicio.tipo_servicio?.nombre ? `- ${servicio.tipo_servicio.nombre}` : ''}
                    </Typography>
                    <Grid size={12}>
                            {
                                servicio.estado === ESTADO_SERVICIO.EN_SERVICIO ? (
                                    <ServiceProgressTasks servicio={servicio} onUpdate={(s) => setServicio(s)} canAddManual />
                                ) : (
                                    <ListTableSimple 
                                        columns={[
                                            { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                                            { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                                            { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' },
                                        ]}
                                        data={servicio.tareas || []}
                                        headerBgColor={theme.palette.primary.main}
                                        headerTextColor="#fff"
                                    />
                                )
                            }
                    </Grid>
                    <Grid size={12} alignItems="center">
                        <ServiceProgressObservaciones
                            servicio={servicio}
                            canEdit={canEditObservaciones}
                            canView={canViewObservaciones}
                            onUpdate={(s) => setServicio(s)}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }} alignItems="center">
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Imágenes de progreso</Typography>
                            <ServiceProgressImages servicio={servicio} onUpdate={(s) => setServicio(s)} isMobile={isMobile} />
                        </Paper>
                    </Grid>
                </Grid>
            </Stack>
        </Box>
    );
};

export default ServicioProgresoPage;
