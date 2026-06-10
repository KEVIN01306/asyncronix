import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, CardMedia, Chip, CircularProgress, Divider, Grid, Paper, Typography, useMediaQuery, useTheme,Link } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { Servicio } from '../../domain/interfaces/servicio.interface';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { useAuthStore } from '../../../../core/store/authStore';
import { ArrowBack } from '@mui/icons-material';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import ServiceImages from '../components/ServiceImages';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { ESTADO_SERVICIO } from '../../domain/servicio.constants';
import { LinkStyle } from '../../../../shared/components/ui/Links/LinkStyle';
import type { VarianteValor } from '../../../productos/domain/interfaces/producto.interface';

const ServicioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState<Servicio | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useAuthStore((state: any) => state.user);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [showImages, setShowImages] = useState(false);

    const fetchService = useCallback(async () => {
        if (!id) {
            setError('ID de servicio no proporcionado');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await servicioRepository.obtener(id);
            setServicio(response);
        } catch (err) {
            console.error(err);
            setError('No se pudo cargar el servicio');
            toast.error('No se pudo cargar el servicio');
        } finally {
            setLoading(false);
        }
    }, [id]);

    const getEstadoColor = (estadoValue: string) => {
        switch (estadoValue) {
            case ESTADO_SERVICIO.RECEPCION:
                return 'warning';
            case ESTADO_SERVICIO.FINALIZADO:
            case ESTADO_SERVICIO.LISTO_ENTREGA:
                return 'success';
            case ESTADO_SERVICIO.CANCELADO:
                return 'error';
            default:
                return 'info';
        }
    };

    const totalRepuestos = servicio?.repuestos_inventario?.reduce((acc, repuesto) => {
        if (repuesto.precio_venta && repuesto.cantidad) {
            return acc + (repuesto.precio_venta * repuesto.cantidad);
        }
        return acc;
    }, 0) || 0;

    useEffect(() => {
        fetchService();
    }, [fetchService]);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error || !servicio) {
        return (
            <ErrorPageLoading 
                text={error || 'Servicio no encontrado'} 
                navigate={() => navigate('/servicios')} 
            />
        );
    }

    return (
        <Box p={{sm: 2, md: 4 }} maxWidth="1000px" margin="0 auto">
            <Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/servicios')}>
                        <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                    </Link>
                    <Typography color="text.primary">Detalle</Typography>
                </Breadcrumbs>
                <Typography variant="h4" fontWeight={800} color="text.primary">Servicio #{servicio.id}</Typography>
            </Box>
            <Box component={Paper} p={3} >
                <Grid container size={12} spacing={4}>
                    <Grid size={3} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={import.meta.env.VITE_API_URL + "/" + (user?.negocio?.logo_url || "/icons/asyncronix.png")}
                            alt={user?.negocio?.nombre_comercial || "Logo"}
                            sx={{
                                height: 150,
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                            }}
                        />                    
                    </Grid>
                    <Grid size={6} sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Typography textAlign={'center'} variant="h4" fontSize={{ sm: 20, md: 40, xl: 50 }} fontWeight={700} color='primary.main'>{user?.negocio?.nombre_comercial}</Typography>
                    </Grid>
                    <Grid size={3} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={import.meta.env.VITE_API_URL + "/" + (user?.negocio?.logo_url || "/icons/asyncronix.png")}
                            alt={user?.negocio?.nombre_comercial || "Logo"}
                            sx={{
                                height: 150,
                                width: 'auto',
                                maxWidth: '100%',
                                objectFit: 'contain',
                                filter: 'drop-shadow(0px 4px 8px rgba(0,0,0,0.1))'
                            }}
                        />    
                    </Grid>
                </Grid>
                <Grid container size={12} mt={2}>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'end', alignItems: 'end' }}>
                        <Typography color="error" variant="h5" fontWeight={500}>Servicio #{servicio.id.slice(0, 8)}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Fecha:</strong> {new Date(servicio.fecha_entrada ? servicio.fecha_entrada : '').toLocaleDateString()}</Typography>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Fecha Salida:</strong> { servicio.fecha_salida ? new Date(servicio.fecha_salida).toLocaleDateString() : '-' }</Typography>
                            
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography display="flex" gap={1} variant="h6" fontSize={15} fontWeight={200}><strong>Cliente:</strong> <LinkStyle ruta={`/clientes/${servicio.cliente?.id}`} text={servicio.cliente?.nombre ?? '-'} /></Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Documento:</strong> {servicio.cliente?.dpi ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Telefono:</strong> {servicio.cliente?.telefono ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Vehiculo:</strong> {servicio.vehiculo?.modelo?.modelo ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start' }}>
                        <Typography display="flex" gap={1} variant="h6" fontSize={15} fontWeight={200}><strong>Mecanico:</strong> <LinkStyle ruta={`/usuarios/${servicio.mecanico?.id}`} text={servicio.mecanico?.nombre ?? '-'} /></Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Kilometraje:</strong> {(servicio.kilometraje || servicio.kilometraje === 0) ? servicio.kilometraje.toString() + ' km' : '-'}</Typography>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Kilometraje proximo servicio:</strong> {(servicio.kilometraje_proximo || servicio.kilometraje_proximo === 0) ? servicio.kilometraje_proximo.toString() + ' km' : 'No asignado'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography display="flex" gap={1} variant="h6" fontSize={15} fontWeight={200}><strong>Placa:</strong> <LinkStyle ruta={`/vehiculos/${servicio.vehiculo?.id}`} text={servicio.vehiculo?.placa ?? '-'} /></Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Tipo de servicio:</strong> {servicio.tipo_servicio?.nombre ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Descripcion:</strong> {servicio.descripcion ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Diagnostico:</strong> {servicio.diagnostico ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Observaciones:</strong> {servicio.observaciones ?? '-'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Estado:</strong></Typography>
                        <Chip label={servicio.estado ?? '-'} variant="outlined" color={getEstadoColor(servicio.estado)} />
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />
                <Grid container size={12} mt={2} justifyContent="center" alignItems="center">
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Servicio: {servicio.total ? formatMoney(servicio.total) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Repuestos: {totalRepuestos ? formatMoney(totalRepuestos) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total: {formatMoney(servicio.total ? servicio.total + totalRepuestos : totalRepuestos)}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />

                {
                    showImages ? (
                        <>
                        <Button sx={{ margin: 2}} variant="outlined" onClick={() => setShowImages(false)}>
                            Ocultar imágenes
                        </Button>
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, md: 6 }}>
                                <Paper sx={{ p: 3, height: '100%' }}>
                                    <Typography variant="h6" mb={2}>Imágenes del servicio</Typography>
                                    <ServiceImages servicio={servicio} onUpdate={(s) => setServicio(s)} isMobile={isMobile} />
                                </Paper>
                            </Grid>
                        </Grid>
                        </>
                        
                    ) : (
                        <Button sx={{ margin: 2}} variant="outlined" onClick={() => setShowImages(true)}>
                            Ver imágenes
                        </Button>
                    )
                }
                
                <Divider sx={{ my: 3 }} />
                <Grid container size={12} mt={2} justifyContent="center" alignItems="center">
                        <Typography 
                            variant="h6" 
                            component="h2" 
                            textAlign="center"
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Checklist de Recepción
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'item', name: 'Item', format: (value) => value.nombre || '-' },
                                { id: 'estado', name: 'Estado' },
                                { id: 'observaciones', name: 'Observaciones', format: (value) => value || '-' },
                            ]}
                            data={servicio.checklist || []}
                            headerBgColor={'primary.main'}
                            headerTextColor="#fff"
                        />
                </Grid>
                <Grid container size={12} mt={2} justifyContent="start" alignItems="center">
                        <Typography 
                            variant="h6" 
                            component="h2" 
                            textAlign="start"
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            {servicio.tipo_servicio?.nombre}
                        </Typography>
                        <ListTableSimple 
                            columns={[
                                { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                                { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                                { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' },
                            ]}
                            data={servicio.tareas || []}
                            headerBgColor={'primary.main'}
                            headerTextColor="#fff"
                        />
                </Grid>
                <Grid container size={12} mt={2} justifyContent="space-between" alignItems="center">
                    <Grid size={{ xs: 12, sm: 5 }} alignItems="center">
                        <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Repuestos del cliente
                        </Typography>
                        <ListTableSimple 
                            columns={[
                                { id: 'repuesto', name: 'Repuesto' },
                                { id: 'cantidad', name: 'Cantidad' },
                            ]}
                            data={servicio.repuestos || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }} alignItems="center">
                        <Typography 
                            variant="h6" 
                            component="h2" 
                            sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                        >
                            Repuestos del inventario
                        </Typography>
                        <ListTableSimple 
                            columns={[
                                { id: 'variante', name: 'Repuesto', format: (variante) => {
                                    if (!variante) return '-';
                                    const atributos = (variante.valores ?? []).map((v: VarianteValor) => `${v.atributo?.nombre}: ${v.valor}`).join(', ');
                                    return `${variante.producto?.nombre || '-'} ${atributos ? `(${atributos})` : ''}`;
                                }},
                                { id: 'cantidad', name: 'Cantidad' },
                                { id: 'precio_venta', name: 'Precio', format: (value) => value ? formatMoney(value) : '-' },
                                { id: 'total', name: 'Total', format: (_value, row) => {
                                    if (row.precio_venta && row.cantidad) {
                                        return formatMoney(row.precio_venta * row.cantidad);
                                    }
                                    return '-';
                                }}
                            ]}
                            data={servicio.repuestos_inventario || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                </Grid>
                <Grid container size={12} mt={2} justifyContent="center" alignItems="center">
                    <Box>
                        <Box >
                            {
                                servicio.firma_entrada ? (
                                    <CardMedia component="img" image={`${import.meta.env.VITE_API_URL}/${servicio.firma_entrada}`} alt="Firma de entrada" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                ): (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                    </Box>
                                )
                            }
                        </Box>
                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Cliente (Entrada)</Typography>
                    </Box>
                    <Box>
                        <Box >
                            {
                                servicio.firma_salida ? (
                                    <CardMedia component="img" image={`${import.meta.env.VITE_API_URL}/${servicio.firma_salida}`} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                ): (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                    </Box>
                                )
                            }
                        </Box>
                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Cliente (Salida)</Typography>
                    </Box>
                </Grid>
            </Box>
        </Box>
    );
};

export default ServicioDetailPage;
