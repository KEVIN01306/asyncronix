import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, Button, CardMedia, Chip, Divider, Grid, Paper, Typography, useMediaQuery, useTheme, Link } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { useAuthStore } from '../../../../core/store/authStore';
import { ArrowBack } from '@mui/icons-material';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import ServiceImages from '../components/ServiceImages';
import { formatMoney } from '../../../../core/utils/formatMoney';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';
import { LinkStyle } from '../../../../shared/components/ui/Links/LinkStyle';
import type { VarianteValor } from '../../../productos/domain/interfaces/producto.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatImage } from '../../../../core/utils/formatImage';
import { FacturaVentaDocument } from '../../../ventas/presentation/components/FacturaVentaDocument';

const ServicioDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
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
            case ESTADO_SERVICIO_VEHICULO.RECEPCION:
                return 'warning';
            case ESTADO_SERVICIO_VEHICULO.FINALIZADO:
            case ESTADO_SERVICIO_VEHICULO.LISTO_ENTREGA:
                return 'success';
            case ESTADO_SERVICIO_VEHICULO.CANCELADO:
                return 'error';
            default:
                return 'info';
        }
    };

    const totalRepuestos = servicio?.repuestos_inventario?.reduce((acc, repuesto) => {
        return acc + (repuesto.precio_venta * repuesto.cantidad);
    }, 0) || 0;

    const totalRepuestosReparaciones = servicio?.servicioReparacion?.reduce((acc, rep) => {
        const totalRep = rep.servicioRepuestos?.reduce((acc2, r) => {
            return acc2 + (r.precio_venta * r.cantidad);
        }, 0) || 0;
        return acc + totalRep;
    }, 0) || 0;

    const totalReparaciones = servicio?.servicioReparacion?.reduce((acc, rep) => {
        return acc + (rep.total || 0);
    }, 0) || 0;

    const totalCustodias = servicio?.servicioCustodias?.reduce((acc, cust) => {
        return acc + (Number(cust.total) || 0);
    }, 0) || 0;

    const subtotalManoObra = servicio?.subtotal || 0;
    const granTotal = subtotalManoObra + totalRepuestos + totalReparaciones + totalRepuestosReparaciones + totalCustodias;
    const tareasNormales = (servicio?.tareas || []).filter((tarea) => !tarea.extra);
    const tareasExtras = (servicio?.tareas || []).filter((tarea) => tarea.extra);

    useEffect(() => {
        fetchService();
    }, [fetchService]);

    if (loading) {
        return (
            <Loading />
        );
    }

    if (error || !servicio) {
        return (
            <ErrorPageLoading
                text={error || 'Servicio no encontrado'}
                navigate={() => navigate('/servicios-vehiculo')}
            />
        );
    }

    return (
        <Box p={{ sm: 2, md: 4 }} maxWidth="1000px" margin="0 auto">
            <Box>
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 1 }}>
                    <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 0.5 }} onClick={() => navigate('/servicios-vehiculo')}>
                        <ArrowBack sx={{ fontSize: 16 }} /> Servicios
                    </Link>
                    <Typography color="text.primary">Detalle</Typography>
                </Breadcrumbs>
                <Typography variant="body2" color="text.primary">#{servicio.id}</Typography>
            </Box>

            {servicio.factura && (
                <Box mt={2} mb={3}>
                    <FacturaVentaDocument factura={servicio.factura} />
                </Box>
            )}

            <Box component={Paper} p={3} >
                <Grid container size={12} spacing={4}>
                    <Grid size={3} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'center' }}>
                        <Box
                            component="img"
                            src={formatImage(user?.negocio?.logo_url || "/icons/asyncronix.png")}
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
                            src={formatImage(user?.negocio?.logo_url || "/icons/asyncronix.png")}
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
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Fecha Salida:</strong> {servicio.fecha_salida ? new Date(servicio.fecha_salida).toLocaleDateString() : '-'}</Typography>

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
                            Mano de Obra (Subtotal): {subtotalManoObra ? formatMoney(subtotalManoObra) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Reparaciones: {totalReparaciones ? formatMoney(totalReparaciones) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Repuestos: {totalRepuestos ? formatMoney(totalRepuestos) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Repuestos Reparaciones: {totalRepuestosReparaciones ? formatMoney(totalRepuestosReparaciones) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total Custodias: {totalCustodias ? formatMoney(totalCustodias) : '-'}
                        </Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" component="h2" textAlign="center" sx={{ fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                            Total: {formatMoney(granTotal)}
                        </Typography>
                    </Grid>
                </Grid>
                <Divider sx={{ my: 3 }} />

                {
                    showImages ? (
                        <>
                            <Button sx={{ margin: 2 }} variant="outlined" onClick={() => setShowImages(false)}>
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
                        <Button sx={{ margin: 2 }} variant="outlined" onClick={() => setShowImages(true)}>
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
                        Tareas del Servicio {servicio.tipo_servicio?.nombre ? `- ${servicio.tipo_servicio.nombre}` : ''}
                    </Typography>
                    <ListTableSimple
                        columns={[
                            { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                            { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                            { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' },
                        ]}
                        data={tareasNormales}
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
                        Servicios Extras
                    </Typography>
                    <ListTableSimple
                        columns={[
                            { id: 'nombre', name: 'Tarea', format: (value) => value || '-' },
                            { id: 'completado', name: 'Estado', format: (value) => value ? 'Completado' : 'Pendiente' },
                            { id: 'observacion', name: 'Observaciones', format: (value) => value || '-' },
                        ]}
                        data={tareasExtras}
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
                                {
                                    id: 'variante', name: 'Repuesto', format: (variante) => {
                                        if (!variante) return '-';
                                        const atributos = (variante.valores ?? []).map((v: VarianteValor) => `${v.atributo?.nombre}: ${v.valor}`).join(', ');
                                        return `${variante.producto?.nombre || '-'} ${atributos ? `(${atributos})` : ''}`;
                                    }
                                },
                                { id: 'cantidad', name: 'Cantidad' },
                                { id: 'precio_venta', name: 'Precio', format: (value) => value ? formatMoney(value) : '-' },
                                {
                                    id: 'total', name: 'Total', format: (_value, row) => {
                                        if (row.precio_venta && row.cantidad) {
                                            return formatMoney(row.precio_venta * row.cantidad);
                                        }
                                        return '-';
                                    }
                                }
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
                                    <CardMedia component="img" image={formatImage(servicio.firma_entrada)} alt="Firma de entrada" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                ) : (
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
                                    <CardMedia component="img" image={formatImage(servicio.firma_salida)} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                ) : (
                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                        <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                    </Box>
                                )
                            }
                        </Box>
                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Cliente (Salida)</Typography>
                    </Box>
                </Grid>

                <Divider sx={{ my: 3 }} />
                <Grid container size={12} mt={2} justifyContent="start" alignItems="center">
                    <Typography
                        variant="h6"
                        component="h2"
                        textAlign="start"
                        sx={{ width: '100%', fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                    >
                        Reparaciones
                    </Typography>

                    {(!servicio.servicioReparacion || servicio.servicioReparacion.length === 0) ? (
                        <Typography variant="body2" color="text.secondary" mt={2}>No hay reparaciones registradas</Typography>
                    ) : (
                        servicio.servicioReparacion.map((rep, index) => (
                            <>
                                <Box key={rep.id} sx={{ p: 2, mt: 2, width: '100%' }}>
                                    <Typography variant="subtitle1" fontWeight={600} color="primary">Reparación #{index + 1} - Total Labor: {formatMoney(rep.total)}</Typography>
                                    <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                        Entrada: {new Date(rep.fecha_entrada).toLocaleDateString()} {rep.fecha_salida ? `- Salida: ${new Date(rep.fecha_salida).toLocaleDateString()}` : ''}
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="subtitle2" mb={1}>Repuestos Solicitados</Typography>
                                            <ListTableSimple
                                                columns={[
                                                    { id: 'descripccion', name: 'Descripción', format: (val) => val },
                                                    { id: 'cantidad', name: 'Cantidad', format: (val) => val },
                                                    { id: 'procedencia', name: 'Procedencia', format: (val) => val },
                                                    { id: 'entregado', name: 'Estado', format: (val) => val ? 'Entregado' : 'Pendiente' }
                                                ]}
                                                data={rep.servicioReparacionRepuestos || []}
                                                headerBgColor={'primary.main'}
                                                headerTextColor="#fff"
                                            />
                                        </Grid>
                                        <Grid size={{ xs: 12, md: 6 }}>
                                            <Typography variant="subtitle2" mb={1}>Repuestos del Inventario</Typography>
                                            <ListTableSimple
                                                columns={[
                                                    {
                                                        id: 'id', name: 'Producto', format: (_, r: any) => {
                                                            const nombre = r.variante?.producto?.nombre || 'Sin nombre';
                                                            const valores = r.variante?.valores && r.variante.valores.length > 0
                                                                ? r.variante.valores.map((v: any) => `${v.atributo?.nombre}: ${v.valor}`).join(', ')
                                                                : '';
                                                            return `${nombre} ${valores ? `(${valores})` : ''}`;
                                                        }
                                                    },
                                                    { id: 'cantidad', name: 'Cantidad', format: (val) => val },
                                                    { id: 'precio_venta', name: 'Precio', format: (val) => formatMoney(val) },
                                                    { id: 'subtotal', name: 'Subtotal', format: (_, r: any) => formatMoney(r.precio_venta * r.cantidad) }
                                                ]}
                                                data={rep.servicioRepuestos || []}
                                                headerBgColor={'primary.main'}
                                                headerTextColor="#fff"
                                            />
                                        </Grid>
                                    </Grid>

                                    <Grid container size={12} mt={4} justifyContent="center" alignItems="center" gap={4}>
                                        <Box>
                                            <Box>
                                                {rep.firma_entrada ? (
                                                    <CardMedia component="img" image={formatImage(rep.firma_entrada)} alt="Firma de entrada reparación" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                                ) : (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                                        <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Reparación (Entrada)</Typography>
                                        </Box>
                                        <Box>
                                            <Box>
                                                {rep.firma_salida ? (
                                                    <CardMedia component="img" image={formatImage(rep.firma_salida)} alt="Firma de salida reparación" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                                ) : (
                                                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                                        <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                                    </Box>
                                                )}
                                            </Box>
                                            <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Reparación (Salida)</Typography>
                                        </Box>
                                    </Grid>
                                    <Divider sx={{ my: 3 }} />

                                </Box>
                            </>)
                        )
                    )}
                </Grid>

                <Grid container size={12} mt={2} justifyContent="start" alignItems="center">
                    <Typography
                        variant="h6"
                        component="h2"
                        textAlign="start"
                        sx={{ width: '100%', fontWeight: 400, color: 'primary', textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}
                    >
                        Custodias
                    </Typography>

                    {(!servicio.servicioCustodias || servicio.servicioCustodias.length === 0) ? (
                        <Typography variant="body2" color="text.secondary" mt={2}>No hay custodias registradas</Typography>
                    ) : (
                        servicio.servicioCustodias.map((cust, index) => (
                            <Box key={cust.id} sx={{ p: 2, mt: 2, width: '100%', backgroundColor: '#f9f9f9', borderRadius: 2 }}>
                                <Typography variant="subtitle1" fontWeight={600} color="primary">Custodia #{index + 1} - Total: {formatMoney(cust.total)}</Typography>
                                <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                                    Entrada: {new Date(cust.fecha_entrada).toLocaleDateString()} {cust.fecha_salida ? `- Salida: ${new Date(cust.fecha_salida).toLocaleDateString()}` : ''}
                                </Typography>

                                {cust.descripcion && (
                                    <Typography variant="body2" color="text.secondary" mb={2}>
                                        <strong>Descripción:</strong> {cust.descripcion}
                                    </Typography>
                                )}

                                <Grid container size={12} mt={2} justifyContent="center" alignItems="center">
                                    <Box>
                                        <Box>
                                            {cust.firma_salida ? (
                                                <CardMedia component="img" image={formatImage(cust.firma_salida)} alt="Firma de salida custodia" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                            ) : (
                                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                                    <Typography sx={{ height: 150, width: 200, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>F</Typography>
                                                </Box>
                                            )}
                                        </Box>
                                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1}>Firma Custodia (Salida)</Typography>
                                    </Box>
                                </Grid>
                            </Box>
                        ))
                    )}
                </Grid>
            </Box>
        </Box >
    );
};

export default ServicioDetailPage;
