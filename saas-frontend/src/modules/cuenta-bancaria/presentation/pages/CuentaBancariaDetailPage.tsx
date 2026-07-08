import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Grid, Stack, Divider, Chip } from '@mui/material';
import { ArrowBack as ArrowBackIcon, AccountBalance, Person, Tag, CreditCard, CheckCircle, Cancel } from '@mui/icons-material';
import { cuentaBancariaRepository } from '../../infrastructure/cuenta-bancaria.repository';
import type { CuentaBancaria } from '../../domain/interfaces/cuenta-bancaria.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatMoney } from '../../../../core/utils/formatMoney'; // Asumiendo que reutilizas tu helper

export default function CuentaBancariaDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [cuenta, setCuenta] = useState<CuentaBancaria | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            cuentaBancariaRepository.obtener(id)
                .then((res) => setCuenta(res.data))
                .catch(() => navigate('/cuentas-bancarias'))
                .finally(() => setLoading(false));
        }
    }, [id, navigate]);

    if (loading) return <Box py={8}><Loading /></Box>;
    if (!cuenta) return <Box p={4}><Typography color="error">Instrumento financiero no localizado.</Typography></Box>;

    return (
        <Box py={4} px={{ xs: 2, md: 4 }} maxWidth="1000px" margin="auto">
            
            {/* Control Superior */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Button 
                    variant="text"
                    color="inherit"
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/cuentas-bancarias')} 
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Volver al portafolio de cuentas
                </Button>
                
                <Chip
                    icon={cuenta.activo ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                    label={cuenta.activo ? "Operativa / Activa" : "Inactiva / Suspendida"}
                    color={cuenta.activo ? "success" : "default"}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: '6px', fontWeight: 600 }}
                />
            </Box>

            {/* Grid Principal Estilo Home Banking */}
            <Grid container spacing={3}>
                
                {/* Panel Izquierdo: Resumen de Balance */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper 
                        variant="outlined"
                        sx={{ 
                            p: 3, 
                            borderRadius: 3,
                            background: (theme) => `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                            position: 'relative',
                            overflow: 'hidden',
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
                                    BALANCE DISPONIBLE
                                </Typography>
                                <AccountBalance color="action" fontSize="small" />
                            </Stack>
                            <Typography variant="h3" component="div" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
                                {formatMoney(cuenta.saldo, cuenta.moneda?.codigo)}
                            </Typography>
                        </Box>

                        <Box mt={4}>
                            <Typography variant="caption" color="text.disabled" display="block" sx={{ fontFamily: 'monospace' }}>
                                SUBTIPO DE INSTRUMENTO
                            </Typography>
                            <Typography variant="body2" fontWeight={600} color="text.secondary">
                                {cuenta.tipo?.toUpperCase() || 'CUENTA CORRIENTE'}
                            </Typography>
                        </Box>
                    </Paper>
                </Grid>

                {/* Panel Derecho: Matriz de Especificaciones */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                        <Typography variant="subtitle2" fontWeight={700} mb={3} color="text.primary">
                            Especificaciones Técnicas e Institucionales
                        </Typography>
                        
                        <Stack spacing={2.5}>
                            {/* Titular */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Person color="action" sx={{ mt: 0.3 }} fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Titular Legal de la Cuenta
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600}>
                                        {cuenta.nombre_titular}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            {/* Número de Cuenta */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <CreditCard color="action" sx={{ mt: 0.3 }} fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Número de Identificación Bancaria
                                    </Typography>
                                    <Typography variant="body1" fontWeight={600} sx={{ fontFamily: 'monospace', letterSpacing: 0.5 }}>
                                        {cuenta.numero_cuenta}
                                    </Typography>
                                </Box>
                            </Box>

                            <Divider />

                            {/* ID del Registro */}
                            <Box display="flex" alignItems="flex-start" gap={2}>
                                <Tag color="action" sx={{ mt: 0.3 }} fontSize="small" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" display="block">
                                        Identificador de Auditoría Interna (UUID)
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