import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Stack, Typography, useMediaQuery, useTheme, Link, Grid, Paper } from '@mui/material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import ServiceImages from '../components/ServiceImages';
import ServiceChecklist from '../components/ServiceChecklist';
import ServiceSignatures from '../components/ServiceSignatures';
import ServiceGeneralInfo from '../components/ServiceGeneralInfo';
import ServiceClientParts from '../components/ServiceClientParts';
import ServiceDetailManualTasks from '../components/ServiceDetailManualTasks';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ServicioCustomPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [tipoServicio, setTipoServicio] = useState<TipoServicio | null>(null);
    const [loading, setLoading] = useState(true);
    const user = useAuthStore((state: any) => state.user);
    const canManageRepuestos = user?.permisos?.includes('EDITAR_SERVICIOS') && user?.permisos?.includes('EDITAR_SERVICIOS_REPUESTOS');

    const fetchService = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await servicioRepository.obtener(id);
            setServicio(response);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el servicio');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchService(); }, [fetchService]);

    useEffect(() => {
        if (!servicio?.tipo_servicio_id) {
            setTipoServicio(null);
            return;
        }

        TipoServicioRepository.Obtener(servicio.tipo_servicio_id)
            .then(setTipoServicio)
            .catch(console.error);
    }, [servicio?.tipo_servicio_id]);

    if (loading) {
        return (
            <Loading/>
        );
    }

    if (!servicio) {
        return <ErrorPageLoading text='Servicio no encontrado' navigate={() => navigate('/servicios')} />;
    }

    return (
        <Box p={isMobile ? 2 : 4}>
            <Stack spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/servicios')}>
                            <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                        </Link>
                        <Typography color="text.primary">Configuración</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">Servicio #{servicio.id}</Typography>
                </Box>

                <ServiceGeneralInfo servicio={servicio} onEdit={() => navigate(`/servicios/${servicio.id}/editar`)} onMechanicUpdated={(s) => setServicio(s)} />

                {(
                    servicio.estado === ESTADO_SERVICIO.EN_SERVICIO ||
                    servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS ||
                    servicio.estado === ESTADO_SERVICIO.ESPERA_REPUESTOS
                ) && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <Button variant="outlined" onClick={() => navigate(`/servicios/${servicio.id}/progreso`)}>
                            Ver progreso
                        </Button>
                        {canManageRepuestos && (
                            <Button variant="outlined" onClick={() => navigate(`/servicios/${servicio.id}/repuestos`)}>
                                Administrar repuestos
                            </Button>
                        )}
                    </Stack>
                )}

                <ServiceSignatures servicio={servicio} onUpdate={(s) => setServicio(s)} />

                <ServiceChecklist servicio={servicio} onUpdate={(s) => setServicio(s)} />

                {tipoServicio && tipoServicio.opciones.length === 0 && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>Tareas del Servicio</Typography>
                        <Typography variant="body2" color="text.secondary" mb={2}>
                            El tipo de servicio seleccionado no tiene opciones automáticas. Aquí puedes crear y gestionar tareas manuales.
                        </Typography>
                        <ServiceDetailManualTasks servicio={servicio} onUpdate={(s) => setServicio(s)} />
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
            </Stack>
        </Box>
    );
};

export default ServicioCustomPage;
