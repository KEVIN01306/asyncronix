import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import { Box, Breadcrumbs, Button, CircularProgress, Stack, Typography, useMediaQuery, useTheme, Link, Grid, Paper } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import ServiceImages from '../components/ServiceImages';
import ServiceChecklist from '../components/ServiceChecklist';
import ServiceSignatures from '../components/ServiceSignatures';
import ServiceGeneralInfo from '../components/ServiceGeneralInfo';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';

const ServicioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [loading, setLoading] = useState(true);

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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
                <CircularProgress />
            </Box>
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
                        <Typography color="text.primary">Vista Detallada</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">Servicio #{servicio.id}</Typography>
                </Box>

                <ServiceGeneralInfo servicio={servicio} onEdit={() => navigate(`/servicios/${servicio.id}/editar`)} />

                {(
                    servicio.estado === ESTADO_SERVICIO.EN_SERVICIO ||
                    servicio.estado === ESTADO_SERVICIO.EN_PRUEBAS ||
                    servicio.estado === ESTADO_SERVICIO.ESPERA_REPUESTOS
                ) && (
                    <Button variant="outlined" onClick={() => navigate(`/servicios/${servicio.id}/progreso`)}>
                        Ver progreso
                    </Button>
                )}

                <ServiceSignatures servicio={servicio} onUpdate={(s) => setServicio(s)} />

                <ServiceChecklist servicio={servicio} onUpdate={(s) => setServicio(s)} />

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

export default ServicioDetailPage;
