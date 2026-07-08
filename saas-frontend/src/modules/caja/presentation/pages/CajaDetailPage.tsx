import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Grid, Stack, Divider, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, PointOfSale, Label, Tag, Layers, CheckCircle, Cancel } from '@mui/icons-material';
import { cajaRepository } from '../../infrastructure/caja.repository';
import type { Caja } from '../../domain/interfaces/caja.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatMoney } from '../../../../core/utils/formatMoney';

export default function CajaDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [caja, setCaja] = useState<Caja | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            cajaRepository.obtener(id)
                .then((res) => setCaja(res.data))
                .catch(() => navigate('/cajas'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    if (loading) return <Box py={8}><Loading /></Box>;
    if (!caja) return <Box p={4}><Typography color="error">Caja de tesorería no localizada.</Typography></Box>;

    return (
        <Box py={4} px={{ xs: 2, md: 4 }} maxWidth="1000px" margin="auto">
            
            {/* Control Superior de Navegación y Estado */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button 
                    variant="text"
                    color="inherit"
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/cajas')} 
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Volver al control de cajas
                </Button>
                
                <Chip
                    icon={caja.activo ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                    label={caja.activo ? "Abierta / Operativa" : "Cerrada / Inactiva"}
                    color={caja.activo ? "success" : "default"}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                />
            </Box>

            {/* Layout en Dos Columnas Asimétricas */}
            <Grid container spacing={3}>
                
                {/* Panel Izquierdo: Resumen de Fondos en Efectivo */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper 
                        variant="outlined"
                        sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '200px',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, fontWeight: 700 }}>
                                    EFECTIVO NETO EN CAJA
                                </Typography>
                                <PointOfSale color="action" fontSize="small" />
                            </Stack>
                            <Typography variant="h3" component="div" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
                                {formatMoney(caja.saldo)}
                            </Typography>
                        </Box>

                        <Box mt={4}>
                            <Typography variant="caption" color="text.disabled" display="block" sx={{ fontFamily: 'monospace' }}>
                                PROPÓSITO / ASIGNACIÓN
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                {caja.tipo?.toUpperCase() || 'CAJA GENERAL'}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Panel Derecho: Metadatos y Desglose Operacional */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={3} color="text.primary">
                            Estructura del Centro de Costo / Caja
                        </Typography>
                        
                        <Stack spacing={2.5}>
                            {/* Nombre de la caja */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Label color="action" sx={{ mt: 0.3 }} fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Denominación de la Caja
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {caja.nombre}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Tipo de flujo contable */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Layers color="action" sx={{ mt: 0.3 }} fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Nivel / Categorización de Operación
                                    </Typography>
                                    <Typography variant="body1" fontWeight={500}>
                                        {caja.tipo || 'Caja Chica / Operaciones Locales'}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            {/* UUID de Registro */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Tag color="action" sx={{ mt: 0.3 }} fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Código Único Interno (UUID)
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                                        {id}
                                    </Typography>
                                </Box>
                            </Box>
                        </Stack>
                    </Paper>
                </Grid>

            </Grid>
        </Box>
    );
}