import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Stack, Divider, IconButton, Grid } from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Print as PrintIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    SyncAlt as TransferIcon,
    Atm as WithdrawIcon,
    Person as PersonIcon,
    CreditCard as CardIcon
} from '@mui/icons-material';
import { cuentaBancariaRepository } from '../../infrastructure/cuenta-bancaria.repository';
import type { CuentaBancaria } from '../../domain/interfaces/cuenta-bancaria.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatMoney } from '../../../../core/utils/formatMoney';

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
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Button 
                    variant="text"
                    color="inherit"
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/cuentas-bancarias')} 
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Volver a mis cuentas
                </Button>
                <Button
                    variant="text"
                    color="secondary"
                    endIcon={<PrintIcon fontSize="small" />}
                    onClick={() => window.print()}
                    sx={{ textTransform: 'none', fontSize: '0.85rem' }}
                >
                    Imprimir estado
                </Button>
            </Stack>

            {/* Título de la sección enfocado al detalle */}
            <Typography variant="h1" mb={4}>
                Detalle de Cuenta
            </Typography>

            {/* CONTENEDOR PRINCIPAL ESTILO HOME BANKING */}
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                
                {/* Encabezado del contenedor (Mantiene la franja azul marino premium de la imagen) */}
                <Box 
                    sx={{ 
                        backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#10141E' : '#0A2540',
                        color: '#FFFFFF',
                        px: 3,
                        py: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}
                >
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'inherit' }}>
                        {cuenta.tipo?.toUpperCase() || 'CUENTA CORRIENTE'}
                    </Typography>
                    <IconButton size="small" sx={{ color: '#FFFFFF' }}>
                        <KeyboardArrowUpIcon fontSize="small" />
                    </IconButton>
                </Box>

                {/* Cuerpo de la Información */}
                <Box p={{ xs: 3, md: 4 }}>
                    
                    {/* Información e Identificación del Instrumento */}
                    <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        color="text.secondary" 
                        sx={{ letterSpacing: '0.02em', mb: 3 }}
                    >
                        {cuenta.tipo || 'Cuenta Corriente'} (...{cuenta.numero_cuenta?.slice(-4) || '5678'})
                    </Typography>

                    {/* Grid de Balance y Datos Clave */}
                    <Grid container spacing={4} alignItems="flex-start">
                        
                        {/* Importe Principal */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                Saldo disponible
                            </Typography>
                            <Typography 
                                variant="h1" 
                                component="div" 
                                sx={{ 
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                                    fontWeight: 500,
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1
                                }}
                            >
                                {formatMoney(cuenta.saldo, cuenta.moneda?.codigo)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                Saldo disponible para transacciones
                            </Typography>
                        </Grid>

                        {/* Datos del Titular y Cuenta en el bloque lateral */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ pl: { md: 4 }, borderLeft: { md: `1px solid` }, borderColor: { md: 'divider' } }}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={2}>
                                    Información General
                                </Typography>
                                
                                <Stack spacing={2}>
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <PersonIcon fontSize="small" color="secondary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Titular</Typography>
                                            <Typography variant="body2" fontWeight={600}>{cuenta.nombre_titular}</Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <CardIcon fontSize="small" color="secondary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Número de cuenta</Typography>
                                            <Typography variant="body2" fontWeight={600} sx={{ fontFamily: 'monospace' }}>
                                                {cuenta.numero_cuenta}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* BARRA DE ACCIONES INFERIORES ÚNICAS REQUERIDAS */}
                    <Box mt={5} pt={2} borderTop={`1px solid`} borderColor="divider">
                        <Stack 
                            direction="row" 
                            spacing={4} 
                            divider={<Divider orientation="vertical" flexItem />}
                        >
                            <Button 
                                variant="text" 
                                color="primary" 
                                startIcon={<TransferIcon fontSize="small" />}
                                sx={{ p: 0, fontSize: '0.9rem', '&:hover': { transform: 'none' }, border: 'none' }}
                            >
                                Transferir
                            </Button>
                            <Button 
                                variant="text" 
                                color="primary" 
                                startIcon={<WithdrawIcon fontSize="small" />}
                                sx={{ p: 0, fontSize: '0.9rem', '&:hover': { transform: 'none' }, border: 'none' }}
                            >
                                Retirar a caja
                            </Button>
                        </Stack>
                    </Box>

                </Box>
            </Paper>

            {/* Identificador técnico al final de la página */}
            <Typography variant="caption" color="text.disabled" display="block" mt={3} sx={{ fontFamily: 'monospace' }}>
                ID de Registro (UUID): {id}
            </Typography>
        </Box>
    );
}