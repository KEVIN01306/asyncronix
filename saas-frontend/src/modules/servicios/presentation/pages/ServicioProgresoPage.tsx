import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, Stack, Typography, useMediaQuery, useTheme, Link, Grid, Paper } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import ServiceGeneralInfo from '../components/ServiceGeneralInfo';
import ServiceChecklist from '../components/ServiceChecklist';
import ServiceProgressImages from '../components/ServiceProgressImages';
import ServiceProgressTasks from '../components/ServiceProgressTasks';
import { ESTADO_SERVICIO, type EstadoServicio } from '../../domain/servicio.constants';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

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

    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [loading, setLoading] = useState(true);
    const [changingState, setChangingState] = useState(false);

    const fetchService = useCallback(async () => {
        if (!id) return;
        try {
            setLoading(true);
            const response = await servicioRepository.obtener(id);
            setServicio(response);
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
                <Paper sx={{ p: 3 }}>
                    <ServiceChecklist servicio={servicio} onUpdate={(s) => setServicio(s)} />
                </Paper>
                <Grid size={ 12 }  alignItems="center">
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
                    </Paper>
                </Grid>

                <Grid container spacing={2}>
                    <Grid size={12}>
                        <Paper sx={{ p: 3 }}>
                            <Typography variant="h6" mb={2}>Tareas de progreso</Typography>
                            <ServiceProgressTasks servicio={servicio} onUpdate={(s) => setServicio(s)} />
                        </Paper>
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
