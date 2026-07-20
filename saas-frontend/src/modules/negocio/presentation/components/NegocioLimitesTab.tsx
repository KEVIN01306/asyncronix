import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    LinearProgress,
    Stack,
    Chip,
    Divider,
    Alert,
} from '@mui/material';
import { alpha, type Theme } from '@mui/material/styles';
import {
    Group,
    Store,
    Inventory,
    Category,
    DirectionsCar,
    PointOfSale,
    AccountBalance,
    Info,
} from '@mui/icons-material';
import { negocioRepository } from '../../infrastructure/repositories/negocio.repository';
import type { NegocioLimiteItem } from '../../domain/negocio.schema';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const iconMap: Record<string, React.ReactNode> = {
    USUARIOS: <Group sx={{ fontSize: 20 }} />,
    SUCURSALES: <Store sx={{ fontSize: 20 }} />,
    PRODUCTOS: <Inventory sx={{ fontSize: 20 }} />,
    VARIANTES: <Category sx={{ fontSize: 20 }} />,
    VEHICULOS: <DirectionsCar sx={{ fontSize: 20 }} />,
    CAJAS: <PointOfSale sx={{ fontSize: 20 }} />,
    CUENTAS_BANCARIAS: <AccountBalance sx={{ fontSize: 20 }} />,
};

const labelMap: Record<string, string> = {
    USUARIOS: 'Usuarios',
    SUCURSALES: 'Sucursales',
    PRODUCTOS: 'Productos',
    VARIANTES: 'Variantes',
    VEHICULOS: 'Vehículos',
    CAJAS: 'Cajas',
    CUENTAS_BANCARIAS: 'Cuentas Bancarias',
};

type EstadoLimite = 'NORMAL' | 'ADVERTENCIA' | 'ALERTA' | 'ERROR';

const computeEstado = (porcentaje: number | null, limite_alcanzado: boolean): EstadoLimite => {
    if (limite_alcanzado) return 'ERROR';
    if (porcentaje === null) return 'NORMAL';
    if (porcentaje >= 90) return 'ALERTA';
    if (porcentaje >= 75) return 'ADVERTENCIA';
    return 'NORMAL';
};

const getStatusColor = (estado: EstadoLimite) => {
    switch (estado) {
        case 'NORMAL': return 'success' as const;
        case 'ADVERTENCIA': return 'warning' as const;
        case 'ALERTA': return 'error' as const;
        case 'ERROR': return 'error' as const;
        default: return 'primary' as const;
    }
};

const getProgressBarColor = (porcentaje: number | null, theme: Theme) => {
    if (porcentaje === null) return theme.palette.success.main;
    if (porcentaje <= 50) return theme.palette.success.main;
    if (porcentaje <= 70) return theme.palette.info.main;
    if (porcentaje <= 85) return theme.palette.warning.main;
    if (porcentaje <= 94) return '#ff5722'; // Naranja oscuro / Deep Orange
    return theme.palette.error.main;
};

const getStatusLabelText = (estado: EstadoLimite, disponibles: number | null) => {
    switch (estado) {
        case 'NORMAL': return 'Normal';
        case 'ADVERTENCIA': return `Restan ${disponibles}`;
        case 'ALERTA': return 'Crítico';
        case 'ERROR': return 'Límite alcanzado';
        default: return '';
    }
};

const NegocioLimitesTab: React.FC = () => {
    const [limites, setLimites] = useState<NegocioLimiteItem[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchLimites = async () => {
            try {
                const data = await negocioRepository.obtenerLimites();
                setLimites(Array.isArray(data) ? data : []);
            } catch (err: any) {
                console.error(err);
                setError(err.response?.data?.message || 'Error al cargar los límites del negocio');
            } finally {
                setLoading(false);
            }
        };
        fetchLimites();
    }, []);

    if (loading) return <Box py={6}><Loading /></Box>;
    if (error) return <Alert severity="error" sx={{ borderRadius: 3 }}>{error}</Alert>;
    if (!limites) return null;

    return (
        <Box>
            {/* Encabezado contextual */}
            <Box mb={3}>
                <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}>
                    Suscripción y Recursos
                </Typography>
                <Typography variant="h5" fontWeight={700} color="text.primary" mt={0.5} sx={{ letterSpacing: '-0.02em' }}>
                    Límites y Consumos del Negocio
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                    Monitorea el uso actual de las capacidades de tu plan activo. Los módulos ilimitados se adaptan al crecimiento de tu empresa.
                </Typography>
            </Box>

            {/* Panel Unificado Estilo Apple */}
            <Card>
                <CardContent sx={{ p: { xs: 2, sm: 4 }, '&:last-child': { pb: { xs: 2, sm: 4 } } }}>
                    <Stack spacing={3}>
                        {limites.map((item, index) => {
                            const { nombre, limite, utilizados, porcentaje_utilizado, limite_alcanzado, disponibles, ilimitado } = item;
                            const estado = computeEstado(porcentaje_utilizado, limite_alcanzado);
                            const colorKey = getStatusColor(estado);

                            return (
                                <Box key={nombre}>
                                    <Grid container spacing={2} alignItems="center">

                                        {/* Icono y Nombre del Módulo */}
                                        <Grid size={{ xs: 12, sm: 4, md: 3 }}>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Box sx={{
                                                    display: 'flex',
                                                    p: 1,
                                                    borderRadius: 2,
                                                    bgcolor: (theme) => alpha(theme.palette[colorKey].main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                                                    color: `${colorKey}.main`
                                                }}>
                                                    {iconMap[nombre] || <Info sx={{ fontSize: 20 }} />}
                                                </Box>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                                        {labelMap[nombre] || nombre}
                                                    </Typography>
                                                    {!ilimitado && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {porcentaje_utilizado?.toFixed(0)}% en uso
                                                        </Typography>
                                                    )}
                                                </Box>
                                            </Stack>
                                        </Grid>

                                        {/* Barra de Progreso */}
                                        <Grid size={{ xs: 12, sm: 5, md: 6 }}>
                                            {ilimitado ? (
                                                <Box sx={{
                                                    height: 6,
                                                    borderRadius: 999,
                                                    bgcolor: (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.12 : 0.06)
                                                }} />
                                            ) : (
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Math.min(porcentaje_utilizado || 0, 100)}
                                                    sx={(theme) => {
                                                        const barColor = getProgressBarColor(porcentaje_utilizado, theme);
                                                        return {
                                                            height: 6,
                                                            borderRadius: 999,
                                                            bgcolor: alpha(barColor, theme.palette.mode === 'dark' ? 0.12 : 0.06),
                                                            '& .MuiLinearProgress-bar': {
                                                                borderRadius: 999,
                                                                bgcolor: barColor
                                                            }
                                                        };
                                                    }}
                                                />
                                            )}
                                        </Grid>

                                        {/* Métricas y Badge de Estado */}
                                        <Grid size={{ xs: 12, sm: 3 }}>
                                            <Stack direction="row" justifyContent={{ xs: 'space-between', sm: 'flex-end' }} alignItems="center" spacing={2}>
                                                <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontFamily: 'monospace' }}>
                                                    {utilizados} / {ilimitado ? '∞' : limite}
                                                </Typography>

                                                <Chip
                                                    size="small"
                                                    label={ilimitado ? 'Ilimitado' : getStatusLabelText(estado, disponibles)}
                                                    color={ilimitado ? 'success' : colorKey}
                                                    variant={estado === 'NORMAL' || ilimitado ? 'outlined' : 'filled'}
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        fontWeight: 600,
                                                        fontSize: '0.7rem',
                                                        minWidth: 75,
                                                        height: 24,
                                                        bgcolor: estado !== 'NORMAL' && !ilimitado ? undefined : (theme) => alpha(theme.palette.success.main, theme.palette.mode === 'dark' ? 0.15 : 0.08),
                                                    }}
                                                />
                                            </Stack>
                                        </Grid>

                                    </Grid>

                                    {/* Divisor interno discreto tipo iOS */}
                                    {
                                        index < limites.length - 1 && (
                                            <Divider sx={{ mt: 2.5, mb: 0.5, opacity: 0.6 }} />
                                        )
                                    }
                                </Box>
                            );
                        })}
                    </Stack>
                </CardContent>
            </Card>
        </Box >
    );
};

export default NegocioLimitesTab;