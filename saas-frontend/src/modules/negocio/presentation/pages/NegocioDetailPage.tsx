import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Button,
    Divider,
    Stack,
    Grid,
    Chip,
    Breadcrumbs,
    Link,
    Avatar,
    Card,
    CardContent,
    Tabs,
    Tab
} from '@mui/material';
import { ArrowBack, Edit, Business, Instagram, Facebook, CurrencyExchange, Info, ShowChart } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';

import { negocioRepository } from '../../infrastructure/repositories/negocio.repository';
import type { Negocio } from '../../domain/negocio.schema';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import CambiarMonedaModal from '../components/CambiarMonedaModal';
import NegocioLimitesTab from '../components/NegocioLimitesTab';
import { formatImage } from '../../../../core/utils/formatImage';


interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function CustomTabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`negocio-tabpanel-${index}`}
            aria-labelledby={`negocio-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ pt: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const NegocioDetailPage = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const [negocio, setNegocio] = useState<Negocio | null>(null);
    const [loading, setLoading] = useState(true);
    const [openCambiarMoneda, setOpenCambiarMoneda] = useState(false);
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabIndex(newValue);
    };

    const logoSource = formatImage(negocio?.logo_url);
    const canCambiarMoneda = user?.permisos.includes('NEGOCIOS_CAMBIAR_MONEDA') ?? false;

    const fetchNegocio = useCallback(async () => {
        try {
            const data = await negocioRepository.obtenerMiNegocio();
            setNegocio(data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el negocio');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNegocio();
    }, [fetchNegocio]);

    if (loading) {
        return <Loading />;
    }

    if (!negocio) {
        return <ErrorPageLoading text='No se encontró el negocio' navigate={() => navigate('/dashboard')} />;
    }

    return (
        <Box p={{ xs: 2, md: 4 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="flex-start" mb={4} spacing={2}>
                <Box>
                    <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }}
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowBack sx={{ fontSize: 16 }} /> Dashboard
                        </Link>
                        <Typography color="text.primary">Detalle del Negocio</Typography>
                    </Breadcrumbs>
                    <Typography variant="h4" fontWeight={800} color="text.primary">
                        {negocio.nombre}
                    </Typography>
                </Box>

                <Button
                    variant="contained"
                    startIcon={<Edit />}
                    onClick={() => navigate('/negocio/editar')}
                >
                    Editar
                </Button>
            </Stack>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                <Tabs value={tabIndex} onChange={handleTabChange} aria-label="negocio tabs">
                    <Tab icon={<Info />} iconPosition="start" label="Información General" />
                    <Tab icon={<ShowChart />} iconPosition="start" label="Límites y Consumos" />
                </Tabs>
            </Box>

            <CustomTabPanel value={tabIndex} index={0}>
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 8 }}>
                        <Paper elevation={0} sx={{ p: { xs: 3, md: 4 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                            <Box display="flex" alignItems="center" gap={3} mb={4}>
                                <Avatar
                                    src={logoSource}
                                    alt={negocio.nombre}
                                    sx={{
                                        bgcolor: logoSource ? 'transparent' : 'primary.main',
                                        width: 64,
                                        height: 64,
                                        borderRadius: 2,
                                        border: logoSource ? '1px solid' : 'none',
                                        borderColor: 'divider',
                                    }}
                                >
                                    {!logoSource && <Business sx={{ fontSize: 35 }} />}
                                </Avatar>
                                <Box>
                                    <Typography variant="overline" color="primary" fontWeight={700}>Módulo de Negocio</Typography>
                                    <Typography variant="h5" fontWeight={700}>{negocio.nombre}</Typography>
                                    <Chip variant='outlined' label={negocio.activo ? 'Activo' : 'Inactivo'} color={negocio.activo ? 'success' : 'error'} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                                </Box>
                            </Box>

                            <Divider sx={{ my: 3 }} />

                            <Grid container spacing={3}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>NOMBRE COMERCIAL</Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                            {negocio.nombre_comercial || 'No especificado'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>PAÍS</Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                            {negocio.pais?.nombre || 'No especificado'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>WA ID</Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                            {negocio.wa_id}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>NIT/RUT</Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                            {negocio.nit_rut || 'No especificado'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>SLOGAN</Typography>
                                        <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                            {negocio.slogan || 'No especificado'}
                                        </Typography>
                                    </Box>
                                </Grid>

                                {negocio.instagram_id && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                                                <Instagram sx={{ fontSize: 16 }} /> INSTAGRAM
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                                {negocio.instagram_id}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}

                                {negocio.facebook_id && (
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom display="flex" alignItems="center" gap={1}>
                                                <Facebook sx={{ fontSize: 16 }} /> FACEBOOK
                                            </Typography>
                                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                                {negocio.facebook_id}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                )}

                                <Grid size={{ xs: 12 }}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>Logo</Typography>
                                        {logoSource ? (
                                            <Box
                                                component="img"
                                                src={logoSource}
                                                alt="Logo del negocio"
                                                sx={{ width: 130, height: 130, objectFit: 'contain', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                                            />
                                        ) : (
                                            <Typography variant="body1" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                                                No especificado
                                            </Typography>
                                        )}
                                    </Box>
                                </Grid>
                            </Grid>
                        </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                        <Stack spacing={3}>
                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom fontWeight={700}>Resumen del Negocio</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={2}>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Estado</Typography>
                                            <Chip variant='outlined' label={negocio.activo ? 'Activo' : 'Inactivo'} color={negocio.activo ? 'success' : 'error'} size="small" sx={{ mt: 0.5, fontWeight: 600 }} />
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Fecha de Registro</Typography>
                                            <Typography variant="body2">{negocio.fecha_registro ? new Date(negocio.fecha_registro).toLocaleDateString() : 'N/A'}</Typography>
                                        </Box>
                                        <Box display="flex" justifyContent="space-between">
                                            <Typography variant="body2" color="text.secondary">Actualizado</Typography>
                                            <Typography variant="body2">{new Date(negocio.updated_at).toLocaleDateString()}</Typography>
                                        </Box>
                                    </Stack>
                                </CardContent>
                            </Card>

                            <Card variant="outlined" sx={{ borderRadius: 2 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" gutterBottom fontWeight={700}>Moneda</Typography>
                                    <Divider sx={{ mb: 2 }} />
                                    <Stack spacing={2}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            <Stack spacing={0.5} flex={1}>
                                                <Typography variant="body2" fontWeight={700}>
                                                    {negocio.moneda?.nombre || 'Sin asignar'}
                                                </Typography>
                                                {negocio.moneda && (
                                                    <Typography variant="caption" color="text.secondary">
                                                        {negocio.moneda.simbolo} ({negocio.moneda.codigo})
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </Box>
                                        {canCambiarMoneda && (
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                startIcon={<CurrencyExchange />}
                                                onClick={() => setOpenCambiarMoneda(true)}
                                                fullWidth
                                            >
                                                Cambiar moneda
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Stack>
                    </Grid>
                </Grid>
            </CustomTabPanel>

            <CustomTabPanel value={tabIndex} index={1}>
                <NegocioLimitesTab />
            </CustomTabPanel>

            <CambiarMonedaModal
                open={openCambiarMoneda}
                onClose={() => setOpenCambiarMoneda(false)}
                onSuccess={() => {
                    fetchNegocio();
                    setOpenCambiarMoneda(false);
                }}
            />
        </Box>
    );
};

export default NegocioDetailPage;