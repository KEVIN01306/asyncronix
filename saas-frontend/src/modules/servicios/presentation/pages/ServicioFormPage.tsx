import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Controller, useForm } from 'react-hook-form';
import { Box, Button, CircularProgress, FormControl, InputLabel, MenuItem, Paper, Select, Stack, TextField, Typography, useMediaQuery, useTheme } from '@mui/material';
import { Grid } from '@mui/material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';
import { type ServicioFormValues } from '../../domain/schemas/servicio.schema';
import Step1BuscarPlaca from './components/Step1BuscarPlaca';
import { servicioRepository } from '../../infrastructure/repositories/servicio.repository';
import { TipoServicioRepository } from '../../../tipos-servicio/infrastructure/repositories/tipo-servicio.repository';
import { vehiculoRepository } from '../../../vehiculos/infrastructure/vehiculo.repository';
import type { TipoServicio } from '../../../tipos-servicio/domain/interfaces/tipo-servicio.interface';
import type { Vehiculo } from '../../../vehiculos/domain/interfaces/vehiculo.interface';

const ServicioFormPage = () => {
    const navigate = useNavigate();
    const params = useParams();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { user } = useAuthStore();

    const [step, setStep] = useState<'placa' | 'detalles' | 'editar'>('placa');
    const [tipos, setTipos] = useState<TipoServicio[]>([]);
    const [vehiculo, setVehiculo] = useState<Vehiculo | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);

    const { control, register, handleSubmit, reset, formState: { isSubmitting } } = useForm<ServicioFormValues>({
        defaultValues: {
            placa: '',
            vehiculo_id: undefined,
            cliente_id: null,
            tipo_servicio_id: '',
            descripcion: '',
            diagnostico: '',
            kilometraje: null,
            MetodoPago: 'EFECTIVO'
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
                MetodoPago: (response.MetodoPago ?? 'EFECTIVO') as 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO'
            });
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
            MetodoPago: 'EFECTIVO'
        };

        try {
            if (isEdit && params.id) {
                await servicioRepository.actualizar(params.id, payload);
                toast.success('Servicio actualizado correctamente');
                navigate(`/servicios/${params.id}`);
            } else {
                const service = await servicioRepository.registrar(payload);
                toast.success('Servicio creado correctamente');
                navigate(`/servicios/${service.id}`);
            }
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el servicio');
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100%" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <>
        <Box p={isMobile ? 2 : 4}>
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
                                    kilometraje: null
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
                                <Typography><strong>Modelo:</strong> {vehiculo.modelo_nombre ?? vehiculo.modelo_id}</Typography>
                                <Typography><strong>Marca:</strong> {vehiculo.marca ?? 'N/A'}</Typography>
                                <Typography><strong>Línea:</strong> {vehiculo.linea ?? 'N/A'}</Typography>
                                <Typography><strong>Cilindrada:</strong> {vehiculo.cilindrada ?? 'N/A'}</Typography>
                                <Typography><strong>Tipo de vehículo:</strong> {vehiculo.tipo_vehiculo ?? vehiculo.vehiculo_tipo_id}</Typography>
                                <Typography><strong>Cliente asociado:</strong> {vehiculo.cliente ? `${vehiculo.cliente.nombre} (${vehiculo.cliente.nit ?? vehiculo.cliente.dpi ?? 'Sin documento'})` : 'Sin cliente asociado'}</Typography>
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
                                            label="Descripción del problema"
                                            fullWidth
                                            {...register('descripcion')}
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