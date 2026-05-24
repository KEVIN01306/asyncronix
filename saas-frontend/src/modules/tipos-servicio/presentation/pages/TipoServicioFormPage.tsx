import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Autocomplete, Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { tipoServicioSchema, type TipoServicioFormValues } from '../../domain/schemas/tipo-servicio.schema';
import { TipoServicioRepository } from '../../infrastructure/repositories/tipo-servicio.repository';
import { OpcionServicioRepository } from '../../../opciones-servicio/infrastructure/repositories/opcion-servicio.repository';
import type { OpcionServicio } from '../../../opciones-servicio/domain/interfaces/opcion-servicio.interface';

const TipoServicioFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [opciones, setOpciones] = useState<OpcionServicio[]>([]);

    const { register, handleSubmit, control, setValue, watch, formState: { errors, isSubmitting } } = useForm<TipoServicioFormValues>({
        resolver: zodResolver(tipoServicioSchema),
        defaultValues: { opciones_ids: [], nombre: '', precio_base: 0 }
    });

    const selectedOptionIds = watch('opciones_ids') || [];

    useEffect(() => {
        OpcionServicioRepository.listar(100, 0)
            .then(response => setOpciones(response.data))
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (isEdit && id) {
            TipoServicioRepository.Obtener(id)
                .then(data => {
                    setValue('nombre', data.nombre);
                    setValue('precio_base', data.precio_base);
                    setValue('opciones_ids', data.opciones.map((opcion) => opcion.id));
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: TipoServicioFormValues) => {
        try {
            if (isEdit && id) {
                await TipoServicioRepository.actualizar(id, data);
                toast.success('Tipo de servicio actualizado correctamente');
            } else {
                await TipoServicioRepository.registrar(data);
                toast.success('Tipo de servicio creado correctamente');
            }
            navigate('/tipos-servicio');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el tipo de servicio');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box p={4} maxWidth="720px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar tipo de servicio' : 'Nuevo tipo de servicio'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />
                        <TextField
                            label="Precio base"
                            type="number"
                            fullWidth
                            inputProps={{ step: 0.01 }}
                            {...register('precio_base', { valueAsNumber: true })}
                            error={!!errors.precio_base}
                            helperText={errors.precio_base?.message}
                        />
                        <Controller
                            name="opciones_ids"
                            control={control}
                            render={() => (
                                <Autocomplete
                                    multiple
                                    options={opciones}
                                    getOptionLabel={(option) => option.nombre}
                                    value={opciones.filter((option) => selectedOptionIds.includes(option.id))}
                                    onChange={(_event, value) => setValue('opciones_ids', value.map(item => item.id), { shouldValidate: true })}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Opciones del servicio"
                                            placeholder="Selecciona opciones"
                                            error={!!errors.opciones_ids}
                                            helperText={errors.opciones_ids?.message as string}
                                        />
                                    )}
                                />
                            )}
                        />
                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar cambios' : 'Registrar tipo'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default TipoServicioFormPage;
