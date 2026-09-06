import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Breadcrumbs, CardMedia, Chip, Divider, Grid, Paper, Typography, useTheme, Link } from '@mui/material';
import { toast } from 'sonner';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import type { ServicioVehiculo } from '../../domain/interfaces/servicio.interface';
import ErrorPageLoading from '../../../../shared/components/ui/errors/errorPageLoading';
import { useAuthStore } from '../../../../core/store/authStore';
import { ArrowBack } from '@mui/icons-material';
import { ListTableSimple } from '../../../../shared/components/ui/tables/ListTableSimple';
import { ESTADO_SERVICIO_VEHICULO } from '../../domain/servicio.constants';
import { HojaServicioPdf } from '../../infrastructure/repositories/HojaServicioPdf';
import { PdfDownloader } from '../../../../shared/components/download/PdfDownloader';
import type { VarianteValor } from '../../../productos/domain/interfaces/producto.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { formatImage } from '../../../../core/utils/formatImage';


const ServicioHojaPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [servicio, setServicio] = useState<ServicioVehiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const user = useAuthStore((state: any) => state.user);
    const theme = useTheme();
    const tareasNormales = (servicio?.tareas || []).filter((tarea) => !tarea.extra);
    const tareasExtras = (servicio?.tareas || []).filter((tarea) => tarea.extra);

    const pdfServicio = servicio ? (
        <HojaServicioPdf
            servicio={servicio}
            user={user}
        />
    ) : null;
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
            {pdfServicio && (
                <Box my={2}>
                    <PdfDownloader
                        document={pdfServicio}
                        fileName={`hoja-servicio-${servicio.id.slice(0, 8)}.pdf`}
                        buttonText="Exportar Hoja a PDF"
                    />
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
                        <Typography display="flex" gap={1} variant="h6" fontSize={15} fontWeight={200}><strong>Cliente:</strong> {servicio.cliente?.nombre ?? '-'}</Typography>
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
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Kilometraje:</strong> {(servicio.kilometraje || servicio.kilometraje === 0) ? servicio.kilometraje.toString() + ' km' : '-'}</Typography>
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Kilometraje proximo servicio:</strong> {(servicio.kilometraje_proximo || servicio.kilometraje_proximo === 0) ? servicio.kilometraje_proximo.toString() + ' km' : 'No asignado'}</Typography>
                    </Grid>
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'start', alignItems: 'start', gap: 1 }}>
                        <Typography display="flex" gap={1} variant="h6" fontSize={15} fontWeight={200}><strong>Placa:</strong> {servicio.vehiculo?.placa ?? '-'}</Typography>
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
                        <Typography variant="h6" fontSize={15} fontWeight={200}><strong>Estado:</strong></Typography>
                        <Chip label={servicio.estado ?? '-'} variant="outlined" color={getEstadoColor(servicio.estado)} />
                    </Grid>
                </Grid>

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
                {tareasExtras.length > 0 && (
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
                )}
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
                            ]}
                            data={servicio.repuestos_inventario || []}
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
                            Cambios de repuestos para el siguiente servicio
                        </Typography>
                        <ListTableSimple
                            columns={[
                                { id: 'item', name: 'Item' }
                            ]}
                            data={servicio.cambios_siguiente_servicio || []}
                            headerBgColor={theme.palette.primary.main}
                            headerTextColor="#fff"
                        />
                    </Grid>
                </Grid>

                <Grid container size={12} mt={4} justifyContent="center" alignItems="center">
                    <Box sx={{ mr: 4 }}>
                        <Box>
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
                        <Box>
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

                {servicio.servicioReparacion && servicio.servicioReparacion.length > 0 && (
                    <Grid container size={12} mt={4}>
                        <Grid size={12} mb={2}>
                            <Typography variant="h6" color="primary" sx={{ textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                Reparaciones Asociadas
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                        </Grid>
                        {servicio.servicioReparacion.map((rep, index) => (
                            <Grid container size={12} key={rep.id} spacing={3} sx={{ borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3 }}>
                                <Grid size={12}>
                                    <Typography variant="h6" color="primary">Reparación #{index + 1}</Typography>
                                    {rep.descripcion && (
                                        <Typography variant="body1" mt={1} color="text.secondary">
                                            <strong>Descripción:</strong> {rep.descripcion}
                                        </Typography>
                                    )}
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" mb={1} fontWeight={600} color="text.secondary" textTransform="uppercase">Repuestos Solicitados</Typography>
                                    <ListTableSimple
                                        columns={[
                                            { id: 'descripccion', name: 'Descripción' },
                                            { id: 'cantidad', name: 'Cant.' },
                                            { id: 'procedencia', name: 'Procedencia' }
                                        ]}
                                        data={rep.servicioReparacionRepuestos || []}
                                        headerBgColor={theme.palette.primary.main}
                                    />
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="subtitle2" mb={1} fontWeight={600} color="text.secondary" textTransform="uppercase">Repuestos de Inventario</Typography>
                                    <ListTableSimple
                                        columns={[
                                            { id: 'id', name: 'Producto', format: (_, r: any) => r.variante?.producto?.nombre || 'Sin nombre' },
                                            { id: 'cantidad', name: 'Cant.' }
                                        ]}
                                        data={rep.servicioRepuestos || []}
                                        headerBgColor={theme.palette.primary.main}
                                    />
                                </Grid>

                                <Grid size={12} mt={2}>
                                    <Typography variant="subtitle1" fontWeight={600} mb={1} textAlign="center">Firmas de la Reparación</Typography>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ width: '100%', maxWidth: 300 }}>
                                        {rep.firma_entrada ? (
                                            <CardMedia component="img" image={formatImage(rep.firma_entrada)} alt="Firma de entrada" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                                <Typography sx={{ height: 150, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                            </Box>
                                        )}
                                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1} mt={1}>Firma Entrada Reparación {index + 1}</Typography>
                                    </Box>
                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ width: '100%', maxWidth: 300 }}>
                                        {rep.firma_salida ? (
                                            <CardMedia component="img" image={formatImage(rep.firma_salida)} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                                <Typography sx={{ height: 150, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                            </Box>
                                        )}
                                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1} mt={1}>Firma Salida Reparación {index + 1}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                )}

                {servicio.servicioCustodias && servicio.servicioCustodias.length > 0 && (
                    <Grid container size={12} mt={4}>
                        <Grid size={12} mb={2}>
                            <Typography variant="h6" color="primary" sx={{ textTransform: 'uppercase', fontSize: '1.1rem', letterSpacing: '0.5px' }}>
                                Custodias Asociadas
                            </Typography>
                            <Divider sx={{ my: 1 }} />
                        </Grid>
                        {servicio.servicioCustodias.map((cust, index) => (
                            <Grid container size={12} key={cust.id} spacing={3} sx={{ borderRadius: 2, p: { xs: 2, md: 3 }, mb: 3 }}>
                                <Grid size={12}>
                                    <Typography variant="h6" color="primary">Custodia #{index + 1}</Typography>
                                    {cust.descripcion && (
                                        <Typography variant="body1" mt={1} color="text.secondary">
                                            <strong>Descripción:</strong> {cust.descripcion}
                                        </Typography>
                                    )}
                                </Grid>

                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="body1" mt={1} color="text.secondary">
                                        <strong>Fecha Entrada:</strong> {new Date(cust.fecha_entrada).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid size={{ xs: 12, md: 6 }}>
                                    <Typography variant="body1" mt={1} color="text.secondary">
                                        <strong>Fecha Salida:</strong> {cust.fecha_salida ? new Date(cust.fecha_salida).toLocaleString() : 'En curso'}
                                    </Typography>
                                </Grid>

                                <Grid size={12} mt={2}>
                                    <Typography variant="subtitle1" fontWeight={600} mb={1} textAlign="center">Firma de Salida Custodia</Typography>
                                </Grid>

                                <Grid size={{ xs: 12 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <Box sx={{ width: '100%', maxWidth: 300 }}>
                                        {cust.firma_salida ? (
                                            <CardMedia component="img" image={formatImage(cust.firma_salida)} alt="Firma de salida" sx={{ height: 150, objectFit: 'contain', p: 1, border: 'none' }} />
                                        ) : (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px dashed #ccc', borderRadius: 1, p: 1 }}>
                                                <Typography sx={{ height: 150, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Sin firma</Typography>
                                            </Box>
                                        )}
                                        <Typography variant="subtitle2" textAlign="center" fontWeight={200} mb={1} mt={1}>Firma Salida Custodia {index + 1}</Typography>
                                    </Box>
                                </Grid>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default ServicioHojaPage;
