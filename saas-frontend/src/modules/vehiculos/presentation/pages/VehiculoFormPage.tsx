import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Grid, Button, Autocomplete } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { vehiculoSchema, type VehiculoFormValues } from '../../domain/schemas/vehiculo.schema';
import { vehiculoRepository } from '../../infrastructure/vehiculo.repository';
import { vehiculoTipoRepository } from '../../infrastructure/vehiculo-tipo.repository';
import { modelosRepository } from '../../../modelos/infrastructure/modelos.repository';
import type { VehiculoTipo } from '../../domain/interfaces/vehiculo-tipo.interface';
import type { Modelo } from '../../../modelos/domain/interface/modelo.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { useAbortableFetch } from '../../../../core/hooks/useAbortableFetch';
import { useDebounce } from '../../../../core/hooks/useDebounce';
import CreateModeloModal from '../components/CreateModeloModal.tsx';

type CreateModeloOption = Modelo & { isCreate?: boolean };

const VehiculoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [tipos, setTipos] = useState<VehiculoTipo[]>([]);
    const [modelos, setModelos] = useState<Modelo[]>([]);
    const [modelosLoading, setModelosLoading] = useState(false);
    const [modeloInput, setModeloInput] = useState('');
    const [openCrearModelo, setOpenCrearModelo] = useState(false);

    const debouncedModeloInput = useDebounce(modeloInput, 300);
    const abortableFetch = useAbortableFetch();

    const { register, control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<VehiculoFormValues>({
        resolver: zodResolver(vehiculoSchema),
        defaultValues: {
            placa: '',
            modelo_id: '',
            vehiculo_tipo_id: '',
        }
    });

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [tiposRes, modelosRes] = await Promise.all([
                    vehiculoTipoRepository.listar(100, 0),
                    modelosRepository.listar(100, 0),
                ]);
                setTipos(tiposRes.data);
                setModelos(modelosRes.data);

                if (isEdit && id) {
                    const vehiculo = await vehiculoRepository.obtener(id);
                    setValue('placa', vehiculo.placa);
                    setValue('modelo_id', vehiculo.modelo_id);
                    setValue('vehiculo_tipo_id', vehiculo.vehiculo_tipo_id);
                }
            } catch (error) {
                console.error(error);
                toast.error('No se pudieron cargar los datos del formulario');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id, isEdit, setValue]);

    useEffect(() => {
        if (!debouncedModeloInput.trim()) return;
        setModelosLoading(true);

        abortableFetch(async (signal) => {
            try {
                const res = await modelosRepository.listar(50, 0, { q: debouncedModeloInput }, signal);
                setModelos(res?.data ?? []);
            } catch (error) {
                console.error(error);
            } finally {
                setModelosLoading(false);
            }
        });
    }, [abortableFetch, debouncedModeloInput]);

    const onSubmit = async (data: VehiculoFormValues) => {
        try {
            if (isEdit && id) {
                await vehiculoRepository.actualizar(id, data);
                toast.success('Vehículo actualizado correctamente');
            } else {
                await vehiculoRepository.registrar(data);
                toast.success('Vehículo creado correctamente');
            }
            navigate('/vehiculos');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el vehículo');
        }
    };

    if (loading) return <Loading />;

    return (
        <Box p={4} maxWidth="760px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>
            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Vehículo' : 'Nuevo Vehículo'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="vehiculo_tipo_id"
                                control={control}
                                render={({ field }) => (
                                    <Autocomplete
                                        options={tipos}
                                        getOptionLabel={(option) => option.tipo}
                                        value={tipos.find((tipo) => tipo.id === field.value) ?? null}
                                        onChange={(_event, value) => field.onChange(value?.id ?? '')}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Tipo de vehículo"
                                                error={!!errors.vehiculo_tipo_id}
                                                helperText={errors.vehiculo_tipo_id?.message}
                                            />
                                        )}
                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                    />
                                )}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Controller
                                name="modelo_id"
                                control={control}
                                render={({ field }) => {
                                    const createOption: CreateModeloOption = { id: 'create-modelo', modelo: `Crear nuevo modelo "${modeloInput.trim()}"`, anio: 0, marca_id: '', linea_id: '', cilindrada_id: '', created_at: '', updated_at: '', isCreate: true };
                                    const options: CreateModeloOption[] = modeloInput.trim() ? [createOption, ...modelos] : modelos;

                                    return (
                                        <Autocomplete<CreateModeloOption, false, false, false>
                                            options={options}
                                            getOptionLabel={(option) => option.modelo}
                                            value={modelos.find((modelo) => modelo.id === field.value) ?? null}
                                            onChange={(_event, value) => {
                                                if (value?.id === createOption.id) {
                                                    setOpenCrearModelo(true);
                                                    return;
                                                }
                                                field.onChange(value?.id ?? '');
                                            }}
                                            inputValue={modeloInput}
                                            onInputChange={(_event, value, reason) => {
                                                if (reason === 'reset') return;
                                                setModeloInput(value);
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    label="Modelo"
                                                    error={!!errors.modelo_id}
                                                    helperText={errors.modelo_id?.message}
                                                    InputProps={{
                                                        ...params.InputProps,
                                                        endAdornment: (
                                                            <>
                                                                {modelosLoading ? <span>...</span> : null}
                                                                {params.InputProps.endAdornment}
                                                            </>
                                                        )
                                                    }}
                                                />
                                            )}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                        />
                                    );
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <TextField
                                label="Placa"
                                fullWidth
                                {...register('placa')}
                                error={!!errors.placa}
                                helperText={errors.placa?.message}
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                            <SubmitButton
                                isSubmitting={isSubmitting}
                                text={isEdit ? 'Guardar cambios' : 'Registrar vehículo'}
                                loadingText="Guardando..."
                                icon={<Save />}
                            />
                        </Grid>
                    </Grid>
                </Box>
                <CreateModeloModal
                    open={openCrearModelo}
                    onClose={() => setOpenCrearModelo(false)}
                    initialText={modeloInput.trim()}
                    onCreated={(created: Modelo) => {
                        setOpenCrearModelo(false);
                        setValue('modelo_id', created.id);
                        setModelos((current) => [created, ...current]);
                        setModeloInput(created.modelo);
                        toast.success('Modelo creado y seleccionado');
                    }}
                />
            </Paper>
        </Box>
    );
};

export default VehiculoFormPage;
