import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { type ServicioFormValues } from '../../domain/schemas/servicio.schema';
import { METODO_PAGO } from '../../domain/servicio.constants';
import Step1BuscarPlaca from './components/Step1BuscarPlaca';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import { vehiculoRepository } from '../../../vehiculos/infrastructure/vehiculo.repository';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import type { Vehiculo } from '../../../vehiculos/domain/interfaces/vehiculo.interface';
import { ArrowBack } from '@mui/icons-material';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ServicioFormPage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuthStore();

    const [step, setStep] = useState<'placa' | 'detalles' | 'editar'>('placa');
    const [tipos, setTipos] = useState<TipoServicio[]>([]);
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [servicioClienteId, setServicioClienteId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    const { control, register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ServicioFormValues>({
        defaultValues: {
            placa: '',
            vehiculo_id: undefined,
            cliente_id: null,
            tipo_servicio_id: '',
            descripcion: '',
            diagnostico: '',
            kilometraje: null,
            kilometraje_proximo: null,
            total: null,
            MetodoPago: METODO_PAGO.EFECTIVO
        }
    });

    const fetchTipos = async () => {
        try {
            const response = await TipoServicioRepository.listar(100, 0);
            setTipos(response.data);
        } catch (error) {
            console.error(error);
            toast.error('No se pudieron cargar los tipos de servicio');
        }
    };

    const fetchServicio = async (id: string) => {
        try {
            const response = await servicioRepository.obtener(id);
            const vehiculoData = await vehiculoRepository.obtener(response.vehiculo_id);
            setVehiculo(vehiculoData);
            setIsEdit(true);
            setStep('editar');
            reset({
                placa: vehiculoData.placa,
                vehiculo_id: vehiculoData.id,
                cliente_id: response.cliente_id ?? null,
                tipo_servicio_id: response.tipo_servicio_id ?? '',
                descripcion: response.descripcion ?? '',
                diagnostico: response.diagnostico ?? '',
                    kilometraje: response.kilometraje ?? null,
                    kilometraje_proximo: response.kilometraje_proximo ?? null,
                    total: response.total ?? null,
                MetodoPago: (response.MetodoPago ?? METODO_PAGO.EFECTIVO) as any
            });
            setServicioClienteId(response.cliente_id ?? null);
        } catch (error) {
            console.error(error);
            toast.error('No se pudo cargar el servicio');
            navigate('/servicios');
        
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        Promise.all([fetchTipos()]).then(() => {
            if (params.id) {
                fetchServicio(params.id);
            } else {
                setLoading(false);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params.id]);


    const selectedTipoServicioId = watch('tipo_servicio_id');
    const selectedTipo = tipos.find((tipo) => tipo.id === selectedTipoServicioId);

    const onSubmit = async (data: ServicioFormValues) => {
        if (!user?.sucursal_id) {
            toast.error('No se pudo determinar la sucursal del usuario');
            return;
        }

        if (!vehiculo?.id) {
            toast.error('Necesitas seleccionar un vehículo válido');
            return;
        }

        const payload = {
            sucursal_id: user.sucursal_id,
            vehiculo_id: vehiculo.id,
            cliente_id: vehiculo.cliente_id ?? null,
            tipo_servicio_id: data.tipo_servicio_id || null,
            descripcion: data.descripcion ?? null,
            diagnostico: data.diagnostico ?? null,
            kilometraje: data.kilometraje ?? null,
            kilometraje_proximo: data.kilometraje_proximo ?? null,
            total: data.total ?? null,
            MetodoPago: METODO_PAGO.EFECTIVO
        };

        try {
            if (isEdit && params.id) {
                await servicioRepository.actualizar(params.id, payload);
                toast.success('Servicio actualizado correctamente');
                navigate(`/servicios/${params.id}/configuracion`);
            } else {
                const service = await servicioRepository.registrar(payload);
                toast.success('Servicio creado correctamente');
                navigate(`/servicios/${service.id}/configuracion`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el servicio');
        }
    };

    if (loading) return <Loading />

    return (
        <>
        <Box p={isMobile ? 2 : 4}>
            <Button
                    startIcon={<ArrowBack />}
                    onClick={() => navigate(-1)}
                    sx={{ mb: 2, textTransform: 'none' }}
                >
                    Volver
            </Button>
            <Stack spacing={3}>
                {step === 'placa' && (
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h5" mb={3}>Buscar vehículo</Typography>
                        <Step1BuscarPlaca
                            onVehiculoSeleccionado={(found: any) => {
                                setVehiculo(found);
                                reset({
                                    placa: found.placa,
                                    vehiculo_id: found.id,
                                    cliente_id: found.cliente_id ?? null,
                                    tipo_servicio_id: '',
                                    descripcion: '',
                                    diagnostico: '',
                                    kilometraje: null,
                                    kilometraje_proximo: null
                                });
                                setStep('detalles');
                            }}
                        />
                    </Paper>
                )}

                {(step === 'detalles' || step === 'editar') && vehiculo && (
                    <Box>
                        <Paper sx={{ p: 3, mb: 2 }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h5">Detalles del servicio</Typography>
                                {step === 'detalles' && (
                                    <Button variant="text" onClick={() => setStep('placa')}>
                                        Cambiar vehículo
                                    </Button>
                                )}
                            </Box>
                            <Box sx={{ bgcolor: 'grey.50', p: 2, borderRadius: 1, display: 'grid', gap: 1 }}>
                                <Typography><strong>Placa:</strong> {vehiculo.placa}</Typography>
                                <Typography><strong>Modelo:</strong> {vehiculo.modelo?.modelo ?? vehiculo.modelo_id}</Typography>
                                <Typography><strong>Marca:</strong> {vehiculo.modelo?.marca?.marca ?? 'N/A'}</Typography>
                                <Typography><strong>Línea:</strong> {vehiculo.modelo?.linea?.linea ?? 'N/A'}</Typography>
                                <Typography><strong>Cilindrada:</strong> {vehiculo.modelo?.cilindrada?.cilindrada ?? 'N/A'}</Typography>
                                <Typography><strong>Tipo de vehículo:</strong> {vehiculo.vehiculo_tipo?.tipo ?? 'N/A'}</Typography>
                                    <Box display="flex" alignItems="center" gap={1}>
                                        <Typography><strong>Cliente asociado:</strong> {vehiculo.cliente ? `${vehiculo.cliente.nombre} (${vehiculo.cliente.nit ?? vehiculo.cliente.dpi ?? 'Sin documento'})` : 'Sin cliente asociado'}</Typography>
                                        {isEdit && vehiculo.cliente && servicioClienteId !== vehiculo.cliente.id && params.id && (
                                            <Button size="small" variant="outlined" onClick={async () => {
                                                try {
                                                    const updated = await servicioRepository.asociarCliente(params.id as string);
                                                    setServicioClienteId(updated.cliente_id ?? null);
                                                    setValue('cliente_id', updated.cliente_id ?? null);
                                                    toast.success('Cliente asociado al servicio correctamente');
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('No se pudo asociar el cliente');
                                                }
                                            }}>Asociar cliente</Button>
                                        )}
                                    </Box>
                            </Box>
                        </Paper>

                        <Paper sx={{ p: 3 }}>
                            <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <FormControl fullWidth required>
                                            <InputLabel>Tipo de servicio</InputLabel>
                                            <Controller
                                                name="tipo_servicio_id"
                                                control={control}
                                                render={({ field }) => (
                                                    <Select {...field} label="Tipo de servicio">
                                                        <MenuItem value="">Selecciona un tipo</MenuItem>
                                                        {tipos.map((tipo) => (
                                                            <MenuItem key={tipo.id} value={tipo.id}>{tipo.nombre}</MenuItem>
                                                        ))}
                                                    </Select>
                                                )}
                                            />
                                        </FormControl>
                                        {selectedTipo && selectedTipo.opciones.length === 0 && (
                                            <Box mt={2} p={2} sx={{ bgcolor: 'grey.100', borderRadius: 1 }}>
                                                <Typography variant="subtitle2">Tipo de servicio sin opciones</Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    Este tipo de servicio no generará tareas automáticas. Podrás agregar o actualizar tareas manualmente desde el detalle del servicio.
                                                </Typography>
                                            </Box>
                                        )}
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Kilometraje"
                                            type="number"
                                            fullWidth
                                            {...register('kilometraje')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Kilometraje próximo"
                                            type="number"
                                            fullWidth
                                            {...register('kilometraje_proximo')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Descripción del problema"
                                            fullWidth
                                            {...register('descripcion')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            label="Total"
                                            type="number"
                                            fullWidth
                                            {...register('total')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <TextField
                                            label="Diagnóstico inicial"
                                            fullWidth
                                            multiline
                                            minRows={3}
                                            {...register('diagnostico')}
                                        />
                                    </Grid>
                                    <Grid size={{ xs: 12 }} display="flex" gap={1}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={isSubmitting}
                                            sx={{ flex: 1 }}
                                        >
                                            {isEdit ? 'Actualizar servicio' : 'Crear servicio'}
                                        </Button>
                                        {step === 'detalles' && (
                                            <Button
                                                variant="outlined"
                                                onClick={() => setStep('placa')}
                                                sx={{ flex: 1 }}
                                            >
                                                Volver
                                            </Button>
                                        )}
                                    </Grid>
                                </Grid>
                            </Box>
                        </Paper>
                    </Box>
                )}
            </Stack>
        </Box>

        </>
    );
};

export default ServicioFormPage;