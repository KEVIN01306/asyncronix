import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Paper, Typography, Grid, Stack, Divider, IconButton, Chip } from '@mui/material';
import { 
    ArrowBack as ArrowBackIcon, 
    Print as PrintIcon,
    KeyboardArrowUp as KeyboardArrowUpIcon,
    CheckCircle, 
    Cancel,
    PointOfSale as CashIcon,
    Label as LabelIcon,
    Layers as LayersIcon
} from '@mui/icons-material';
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
            
            {/* Control Superior */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                <Button 
                    variant="text"
                    color="inherit"
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate('/cajas')} 
                    sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                    Volver al control de cajas
                </Button>
                <Button
                    variant="text"
                    color="secondary"
                    endIcon={<PrintIcon fontSize="small" />}
                    onClick={() => window.print()}
                    sx={{ textTransform: 'none', fontSize: '0.85rem' }}
                >
                    Imprimir arqueo
                </Button>
            </Stack>

            {/* Título de la sección */}
            <Typography variant="h1" mb={4}>
                Detalle de Caja
            </Typography>

            {/* CONTENEDOR PRINCIPAL ESTILO HOME BANKING / MAC OS */}
            <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
                
                {/* Encabezado del contenedor (Mantiene la franja corporativa premium) */}
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
                    <Typography variant="body2" fontWeight={600} sx={{ color: 'inherit', letterSpacing: '0.05em' }}>
                        {caja.tipo?.toUpperCase() || 'CAJA GENERAL'}
                    </Typography>
                    
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                            icon={caja.activo ? <CheckCircle fontSize="small" style={{ color: '#10A37F' }} /> : <Cancel fontSize="small" style={{ color: '#EF4444' }} />}
                            label={caja.activo ? "Abierta" : "Cerrada"}
                            size="small"
                            sx={{ 
                                borderRadius: '6px', 
                                fontWeight: 600, 
                                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                                color: '#FFFFFF',
                                border: 'none',
                                '.MuiChip-icon': { marginLeft: '4px' }
                            }}
                        />
                        <IconButton size="small" sx={{ color: '#FFFFFF' }}>
                            <KeyboardArrowUpIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                </Box>

                {/* Cuerpo de la Información */}
                <Box p={{ xs: 3, md: 4 }}>
                    
                    {/* Información de Identificación */}
                    <Typography 
                        variant="body2" 
                        fontWeight={600} 
                        color="text.secondary" 
                        sx={{ letterSpacing: '0.02em', mb: 3 }}
                    >
                        {caja.nombre}
                    </Typography>

                    {/* Grid de Fondos y Datos Clave */}
                    <Grid container spacing={4} alignItems="flex-start">
                        
                        {/* Importe Principal: Efectivo Disponible */}
                        <Grid size={{ xs: 12, md: 7 }}>
                            <Typography variant="body2" color="text.secondary" mb={0.5}>
                                Efectivo neto disponible
                            </Typography>
                            <Typography 
                                variant="h1" 
                                component="div" 
                                sx={{ 
                                    fontSize: { xs: '2.5rem', md: '3.5rem' }, 
                                    fontWeight: 500,
                                    letterSpacing: '-0.03em',
                                    lineHeight: 1,
                                    color: 'text.primary'
                                }}
                            >
                                {formatMoney(caja.saldo)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                                Fondos físicos en custodia inmediata para operaciones contables
                            </Typography>
                        </Grid>

                        {/* Estructura del Centro de Costo en bloque lateral */}
                        <Grid size={{ xs: 12, md: 5 }}>
                            <Box sx={{ pl: { md: 4 }, borderLeft: { md: `1px solid` }, borderColor: { md: 'divider' } }}>
                                <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={2}>
                                    Información Operacional
                                </Typography>
                                
                                <Stack spacing={2}>
                                    {/* Denominación */}
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <LabelIcon fontSize="small" color="secondary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Denominación</Typography>
                                            <Typography variant="body2" fontWeight={600}>{caja.nombre}</Typography>
                                        </Box>
                                    </Stack>

                                    {/* Categorización */}
                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                        <LayersIcon fontSize="small" color="secondary" />
                                        <Box>
                                            <Typography variant="caption" color="text.secondary" display="block">Asignación de Operación</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {caja.tipo || 'Caja Chica / Operaciones Locales'}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Stack>
                            </Box>
                        </Grid>
                    </Grid>

                    {/* ACCIONES INFERIORES ÚNICAS DE FLUJO DE CAJA */}
                    <Box mt={5} pt={2} borderTop={`1px solid`} borderColor="divider">
                        <Stack 
                            direction="row" 
                            spacing={4} 
                            divider={<Divider orientation="vertical" flexItem />}
                        >
                            <Button 
                                variant="text" 
                                color="primary" 
                                startIcon={<CashIcon fontSize="small" />}
                                sx={{ p: 0, fontSize: '0.9rem', '&:hover': { transform: 'none' }, border: 'none' }}
                            >
                                Ingreso de Efectivo
                            </Button>
                            <Button 
                                variant="text" 
                                color="primary" 
                                startIcon={<CashIcon fontSize="small" />}
                                sx={{ p: 0, fontSize: '0.9rem', '&:hover': { transform: 'none' }, border: 'none' }}
                            >
                                Egreso / Gasto
                            </Button>
                        </Stack>
                    </Box>

                </Box>
            </Paper>

            {/* Identificador técnico */}
            <Typography variant="caption" color="text.disabled" display="block" mt={3} sx={{ fontFamily: 'monospace' }}>
                ID de Registro (UUID): {id}
            </Typography>
        </Box>
    );
}