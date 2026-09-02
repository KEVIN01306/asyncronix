import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Stack, Typography, useMediaQuery, useTheme, Link, Grid, Paper } from '@mui/material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import ServiceImages from '../components/ServiceImages';
import ServiceChecklist from '../components/ServiceChecklist';
import ServiceSignatures from '../components/ServiceSignatures';
import ServiceGeneralInfo from '../components/ServiceGeneralInfo';
import ServiceClientParts from '../components/ServiceClientParts';
import ServiceDetailManualTasks from '../components/ServiceDetailManualTasks';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';

const ServicioCustomPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
    const [tipoServicio, setTipoServicio] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state: any) => state.user);
    const canManageRepuestos = user?.permisos?.includes('EDITAR_SERVICIOS') && user?.permisos?.includes('EDITAR_SERVICIOS_REPUESTOS');

    const fetchService = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await servicioRepository.obtener(id);
            setServicio(response);

            if (response.tipo_servicio_id) {
                try {
                    const ts = await TipoServicioRepository.Obtener(response.tipo_servicio_id);
                    setTipoServicio(ts);
                } catch (e) {
                    console.error("Error fetching tipo_servicio", e);
                }
            }
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el servicio');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchService(); }, [fetchService]);

    if (loading) {
        return (
            <Loading />
        );
    }

    if (!servicio) {
        return <ErrorPageLoading text='Servicio no encontrado' navigate={() => navigate('/servicios-vehiculo')} />;
    }

    return (
        <Box p={isMobile ? 2 : 4}>
            <Stack spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/servicios-vehiculo')}>
                            <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                        </Link>
                        <Typography color="text.primary">Configuración</Typography>
                    </Breadcrumbs>
                    <Typography variant="body2" color="text.primary">#{servicio.id}</Typography>
                </Box>

                <ServiceGeneralInfo servicio={servicio} onEdit={() => navigate(`/servicios-vehiculo/${servicio.id}/editar`)} onMechanicUpdated={(s) => setServicio(s)} />

                {(
                    servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_SERVICIO ||
                    servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_PRUEBAS ||
                    servicio.estado === ESTADO_SERVICIO_VEHICULO.ESPERA_REPUESTOS ||
                    servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_REPARACION ||
                    servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_CUSTODIA
                ) && (
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <Button variant="outlined" onClick={() => navigate(`/servicios-vehiculo/${servicio.id}/progreso`)}>
                                Ver progreso
                            </Button>
                            {canManageRepuestos && servicio.estado !== ESTADO_SERVICIO_VEHICULO.EN_CUSTODIA && (
                                <Button variant="outlined" onClick={() => navigate(`/servicios-vehiculo/${servicio.id}/repuestos`)}>
                                    Administrar repuestos
                                </Button>
                            )}
                            {servicio.estado === ESTADO_SERVICIO_VEHICULO.EN_REPARACION && (
                                <Button color="primary" variant="contained" onClick={() => navigate(`/servicios-vehiculo/${servicio.id}/reparacion`)}>
                                    Configurar Reparación
                                </Button>
                            )}
                        </Stack>
                    )}


                <ServiceChecklist servicio={servicio} onUpdate={(s) => setServicio(s)} />

                <Paper sx={{ p: 3 }}>
                    <Typography variant="h6" mb={2}>Tareas del Servicio</Typography>
                    <ListTableSimple
                        columns={[
                            { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                            { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                            { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' }
                        ]}
                        data={(servicio.tareas || []).filter((tarea) => !tarea.extra)}
                        headerBgColor={theme.palette.primary.main}
                        headerTextColor="#fff"
                    />
                </Paper>

                {tipoServicio && tipoServicio.opciones?.length > 0 ? (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Servicios Extras</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Agrega servicios adicionales manuales que deben mantenerse aunque cambie el tipo de servicio.
                        </Typography>
                        <ServiceDetailManualTasks servicio={servicio} onUpdate={(s) => setServicio(s)} taskType="extra" />
                    </Paper>
                ) : (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Opciones Manuales</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            Agrega las opciones y tareas manualmente para este servicio.
                        </Typography>
                        <ServiceDetailManualTasks servicio={servicio} onUpdate={(s) => setServicio(s)} taskType="normal" />
                    </Paper>
                )}

                <ServiceClientParts servicio={servicio} onUpdate={(s) => setServicio(s)} />

                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper sx={{ p: 3, height: '100%' }}>
                            <Typography variant="h6" mb={2}>Imágenes del servicio</Typography>
                            <ServiceImages servicio={servicio} onUpdate={(s) => setServicio(s)} isMobile={isMobile} />
                        </Paper>
                    </Grid>
                </Grid>

                <ServiceSignatures servicio={servicio} onUpdate={(s) => setServicio(s)} />
            </Stack>
        </Box>
    );
};

export default ServicioCustomPage;
