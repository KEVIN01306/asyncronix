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
import {
    Group,
    Store,
    Inventory,
    Category,
    DirectionsCar,
    PointOfSale,
    AccountBalance,
    Warning as WarningIcon,
    Error as ErrorIcon,
    CheckCircle as CheckCircleIcon,
    Info,
} from '@mui/icons-material';
import { negocioRepository } from '../../infrastructure/repositories/negocio.repository';
import type { NegocioLimiteItem } from '../../domain/negocio.schema';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const iconMap: Record<string, React.ReactNode> = {
    USUARIOS: <Group />,
    SUCURSALES: <Store />,
    PRODUCTOS: <Inventory />,
    VARIANTES: <Category />,
    VEHICULOS: <DirectionsCar />,
    CAJAS: <PointOfSale />,
    CUENTAS_BANCARIAS: <AccountBalance />,
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
        case 'NORMAL': return 'success';
        case 'ADVERTENCIA': return 'warning';
        case 'ALERTA': return 'error';
        case 'ERROR': return 'error';
        default: return 'primary';
    }
};

const getStatusIcon = (estado: EstadoLimite, fontSize: 'small' | 'medium' = 'small') => {
    switch (estado) {
        case 'NORMAL': return <CheckCircleIcon fontSize={fontSize} color="success" />;
        case 'ADVERTENCIA': return <WarningIcon fontSize={fontSize} color="warning" />;
        case 'ALERTA': return <WarningIcon fontSize={fontSize} color="error" />;
        case 'ERROR': return <ErrorIcon fontSize={fontSize} color="error" />;
        default: return undefined;
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

    if (loading) return <Loading />;
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!limites) return null;

    return (
        <Box>
            <Typography variant="h6" gutterBottom fontWeight={700}>
                Límites y Consumos del Negocio
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
                Aquí puedes visualizar el uso actual de los recursos de tu plan. Si alcanzas el límite en algún módulo, no podrás crear más registros de ese tipo hasta que actualices tu plan.
            </Typography>

            <Grid container spacing={3} mt={1}>
                {limites.map((item) => {
                    const { nombre, limite, utilizados, porcentaje_utilizado, limite_alcanzado, disponibles, ilimitado } = item;
                    const estado = computeEstado(porcentaje_utilizado, limite_alcanzado);

                    return (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={nombre}>
                            <Card variant="outlined" sx={{ height: '100%', borderRadius: 2 }}>
                                <CardContent>
                                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            {iconMap[nombre] || <Info />}
                                            <Typography variant="subtitle1" fontWeight={600}>
                                                {labelMap[nombre] || nombre}
                                            </Typography>
                                        </Stack>
                                        {!ilimitado && (
                                            <Chip
                                                size="small"
                                                label={estado}
                                                color={getStatusColor(estado)}
                                                variant="outlined"
                                                icon={getStatusIcon(estado)}
                                            />
                                        )}
                                    </Stack>

                                    <Divider sx={{ mb: 2 }} />

                                    <Box mb={1}>
                                        <Stack direction="row" justifyContent="space-between" mb={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                Consumo Actual:
                                            </Typography>
                                            <Typography variant="body2" fontWeight={700}>
                                                {utilizados} / {ilimitado ? '∞' : limite}
                                            </Typography>
                                        </Stack>

                                        {!ilimitado && (
                                            <LinearProgress
                                                variant="determinate"
                                                value={Math.min(porcentaje_utilizado || 0, 100)}
                                                color={getStatusColor(estado)}
                                                sx={{ height: 8, borderRadius: 4 }}
                                            />
                                        )}
                                    </Box>

                                    {!ilimitado ? (
                                        <Typography variant="caption" color="text.secondary" display="block" textAlign="right">
                                            {(porcentaje_utilizado || 0).toFixed(1)}% utilizado
                                        </Typography>
                                    ) : (
                                        <Typography variant="caption" color="success.main" display="block" textAlign="right" fontWeight={500}>
                                            Ilimitado
                                        </Typography>
                                    )}

                                    {!ilimitado && disponibles !== null && (
                                        <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                            {disponibles > 0 ? `Quedan ${disponibles} disponibles` : 'Límite alcanzado'}
                                        </Typography>
                                    )}
                                </CardContent>
                            </Card>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
};

export default NegocioLimitesTab;
