import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Grid,
    Button,
    Chip,
    Divider,
    Stack,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    Edit,
    SettingsSuggestOutlined,
    ReceiptLong,
    Business,
    Shield,
    CheckCircle,
    Warning
} from '@mui/icons-material';
import { toast } from 'sonner';

import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAuthStore } from '../../../../core/store/authStore';
import { useAbortableFetch, isAbortError } from '../../../../core/hooks/useAbortableFetch';
import { negocioRepository } from '../../../negocio/infrastructure/repositories/negocio.repository';
import { sucursalRepository } from '../../../sucursales/infrastructure/repositories/sucursal.repository';

import { facturacionRepository } from '../../infrastructure/repositories/facturacion.repository';
import type { FacturacionConfigData } from '../../domain/interfaces/factura.interface';
import { FacturaPruebaModal } from '../components/FacturaPruebaModal';

export const FacturacionConfiguracionPage: React.FC = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const user = useAuthStore(state => state.user);

    const canEdit = user?.permisos?.includes('EDITAR_CONFIGURACION_FISCAL') ?? false;

    const [config, setConfig] = useState<FacturacionConfigData | null>(null);
    const [negocio, setNegocio] = useState<any>(null);
    const [sucursal, setSucursal] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [previewOpen, setPreviewOpen] = useState(false);

    const abortableFetch = useAbortableFetch();

    const cargarDatos = useCallback(async (signal?: AbortSignal) => {
        setLoading(true);
        try {
            const [dataConfig, dataNegocio, dataSucursal] = await Promise.all([
                facturacionRepository.obtenerConfiguracion(signal).catch(() => null),
                negocioRepository.obtenerMiNegocio().catch(() => null),
                sucursalRepository.obtenerMiSucursal().catch(() => null)
            ]);

            setConfig(dataConfig);
            setNegocio(dataNegocio);
            setSucursal(dataSucursal);
        } catch (error) {
            if (isAbortError(error)) return;
            console.error('Error al cargar configuración fiscal:', error);
            toast.error('No se pudo cargar la configuración fiscal');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        abortableFetch(cargarDatos);
    }, [abortableFetch, cargarDatos]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" py={8}>
                <Loading />
            </Box>
        );
    }

    const esPeq = config?.afiliacion_iva === 'PEQ';
    const esProduccion = config?.fel_ambiente === 'PRODUCCION';

    return (
        <Box p={isMobile ? 2 : 4}>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            p: 1,
                            borderRadius: 2,
                            backgroundColor: (t) => t.palette.primary.light + '22',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                    >
                        <SettingsSuggestOutlined />
                    </Box>
                    <Box>
                        <Typography variant="h5" fontWeight={700}>
                            Configuración Fiscal
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Parámetros tributarios y credenciales del certificador FEL (Digifact)
                        </Typography>
                    </Box>
                </Box>

                <Stack direction="row" spacing={1.5}>
                    <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ReceiptLong />}
                        onClick={() => setPreviewOpen(true)}
                    >
                        Preview de factura
                    </Button>

                    {canEdit && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={() => navigate('/facturacion/configuracion/editar')}
                        >
                            Editar
                        </Button>
                    )}
                </Stack>
            </Box>

            {!config ? (
                <Paper
                    elevation={0}
                    sx={{
                        p: 6,
                        textAlign: 'center',
                        border: (t) => `1px solid ${t.palette.divider}`,
                        borderRadius: 2
                    }}
                >
                    <Warning sx={{ fontSize: 48, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        No hay configuración fiscal establecida
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
                        Para poder emitir facturas electrónicas DTE certificadas ante la SAT, debes configurar los datos del emisor y credenciales de Digifact.
                    </Typography>
                    {canEdit && (
                        <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Edit />}
                            onClick={() => navigate('/facturacion/configuracion/editar')}
                        >
                            Configurar ahora
                        </Button>
                    )}
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {/* Tarjeta 1: Información del Emisor */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                                height: '100%'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Business color="primary" />
                                <Typography variant="h6" fontWeight={700}>
                                    Datos del Emisor
                                </Typography>
                            </Box>

                            <Stack spacing={2}>
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        NIT Emisor
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {config.nit_emisor || '---'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Nombre o Razón Social
                                    </Typography>
                                    <Typography variant="body1">
                                        {config.nombre_emisor || '---'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Nombre Comercial
                                    </Typography>
                                    <Typography variant="body1">
                                        {config.nombre_comercial || '---'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Correo Electrónico Emisor
                                    </Typography>
                                    <Typography variant="body1">
                                        {config.correo_emisor || '---'}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>

                    {/* Tarjeta 2: Régimen y Certificador FEL */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
                                border: (t) => `1px solid ${t.palette.divider}`,
                                borderRadius: 2,
                                height: '100%'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                                <Shield color="primary" />
                                <Typography variant="h6" fontWeight={700}>
                                    Régimen Fiscal y FEL (Digifact)
                                </Typography>
                            </Box>

                            <Stack spacing={2}>
                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Afiliación IVA
                                        </Typography>
                                        <Typography variant="body1" fontWeight={700}>
                                            {esPeq ? 'Pequeño Contribuyente (PEQ)' : 'Régimen General (GEN)'}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        label={esPeq ? 'DocType: FPEQ (5%)' : 'DocType: FACT (12%)'}
                                        color={esPeq ? 'secondary' : 'primary'}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Tipo de Frase / Escenario SAT
                                    </Typography>
                                    <Typography variant="body1">
                                        Frase: <strong>{config.tipo_frase}</strong> &nbsp;|&nbsp; Escenario: <strong>{config.codigo_escenario}</strong>
                                    </Typography>
                                </Box>

                                <Divider />

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Usuario FEL (Digifact)
                                    </Typography>
                                    <Typography variant="body1" fontFamily="monospace">
                                        {config.fel_username || '---'}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Contraseña FEL
                                    </Typography>
                                    <Typography variant="body1" fontFamily="monospace">
                                        ••••••••••••
                                    </Typography>
                                </Box>

                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Ambiente de Emisión
                                        </Typography>
                                        <Typography variant="body1" fontWeight={600}>
                                            {config.fel_ambiente}
                                        </Typography>
                                    </Box>
                                    <Chip
                                        icon={esProduccion ? <CheckCircle fontSize="small" /> : <Warning fontSize="small" />}
                                        label={esProduccion ? 'Producción Oficial' : 'Ambiente de Pruebas'}
                                        color={esProduccion ? 'success' : 'warning'}
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                            </Stack>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Modal de factura de prueba térmica */}
            <FacturaPruebaModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                configFiscal={config}
                negocio={negocio}
                sucursal={sucursal}
            />
        </Box>
    );
};

export default FacturacionConfiguracionPage;
