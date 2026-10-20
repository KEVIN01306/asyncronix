import { useEffect, useState } from 'react';
import { Box, Typography, Grid, Alert, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { SettingsSuggestOutlined } from '@mui/icons-material';

import Loading from '../../../../../shared/components/ui/Loaders/Loading';
import { negocioFacturacionRepository } from '../../../infrastructure/repositories/negocio-facturacion.repository';
import type { NegocioFacturacionConfig } from '../../../domain/interface/negocio-facturacion.interface';
import { useAuthStore } from '../../../../../core/store/authStore';

export const NegocioFacturacionTab = () => {
    const navigate = useNavigate();
    const user = useAuthStore(state => state.user);
    const [facturacion, setFacturacion] = useState<NegocioFacturacionConfig | null>(null);
    const [loading, setLoading] = useState(true);

    const canManageFacturacion = user?.permisos?.includes('VER_CONFIGURACION_FISCAL') || user?.permisos?.includes('EDITAR_CONFIGURACION_FISCAL');

    const fetchData = async () => {
        setLoading(true);
        try {
            const dataFacturacion = await negocioFacturacionRepository.obtener().catch(() => null);
            setFacturacion(dataFacturacion);
        } catch (error) {
            console.error('Error al cargar información fiscal:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) return <Loading />;

    return (
        <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap" gap={2}>
                <Box>
                    <Typography variant="h6" fontWeight="bold">
                        Información Fiscal (Facturación Electrónica)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Datos del emisor y régimen registrados para la emisión de DTE
                    </Typography>
                </Box>

                {canManageFacturacion && (
                    <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<SettingsSuggestOutlined />}
                        onClick={() => navigate('/facturacion/configuracion')}
                    >
                        Gestionar en Facturación
                    </Button>
                )}
            </Box>

            <Alert severity="info" sx={{ mb: 3 }}>
                La gestión y edición de la configuración fiscal, así como los previews de impresión térmica, se administran de forma centralizada en el módulo de <strong>Facturación &gt; Configuración Fiscal</strong>.
            </Alert>

            {!facturacion ? (
                <Typography color="text.secondary">No hay configuración fiscal establecida.</Typography>
            ) : (
                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">NIT Emisor</Typography>
                        <Typography variant="body1" mb={2} fontWeight={600}>{facturacion.nit_emisor || '---'}</Typography>

                        <Typography variant="subtitle2" color="text.secondary">Nombre Emisor</Typography>
                        <Typography variant="body1" mb={2}>{facturacion.nombre_emisor || '---'}</Typography>

                        <Typography variant="subtitle2" color="text.secondary">Nombre Comercial</Typography>
                        <Typography variant="body1" mb={2}>{facturacion.nombre_comercial || '---'}</Typography>

                        <Typography variant="subtitle2" color="text.secondary">Correo Emisor</Typography>
                        <Typography variant="body1" mb={2}>{facturacion.correo_emisor || '---'}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography variant="subtitle2" color="text.secondary">Afiliación IVA / Régimen</Typography>
                        <Typography variant="body1" mb={2} fontWeight={600}>
                            {facturacion.afiliacion_iva === 'PEQ' 
                                ? 'Pequeño Contribuyente (PEQ) - 5%' 
                                : 'Régimen General (GEN) - 12%'}
                        </Typography>

                        <Typography variant="subtitle2" color="text.secondary">Tipo Frase / Escenario SAT</Typography>
                        <Typography variant="body1" mb={2}>{facturacion.tipo_frase} / {facturacion.codigo_escenario}</Typography>

                        <Typography variant="subtitle2" color="text.secondary">FEL Username</Typography>
                        <Typography variant="body1" mb={2} fontFamily="monospace">{facturacion.fel_username || '---'}</Typography>

                        <Typography variant="subtitle2" color="text.secondary">FEL Password</Typography>
                        <Typography variant="body1" mb={2} fontFamily="monospace">••••••••••••</Typography>

                        <Typography variant="subtitle2" color="text.secondary">Ambiente FEL</Typography>
                        <Typography variant="body1" mb={2}>{facturacion.fel_ambiente}</Typography>
                    </Grid>
                </Grid>
            )}
        </Box>
    );
};
