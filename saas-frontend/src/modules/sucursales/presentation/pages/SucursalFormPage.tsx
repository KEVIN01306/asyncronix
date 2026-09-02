import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';
import { useAuthStore } from '../../../../core/store/authStore';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { sucursalSchema, type SucursalFormValues } from '../../domain/schemas/sucursal.schema';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';
import { DepartamentoAutocomplete } from '../../../geografia/presentation/components/DepartamentoAutocomplete';
import { MunicipioAutocomplete } from '../../../geografia/presentation/components/MunicipioAutocomplete';

const SucursalFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const user = useAuthStore((state) => state.user);

    const { register, handleSubmit, reset, watch, setValue, control, formState: { errors, isSubmitting } } = useForm<SucursalFormValues>({
        resolver: zodResolver(sucursalSchema),
        defaultValues: {
            codigo_establecimiento: '1'
        }
    });

    const departamentoId = watch('departamento_id');

    useEffect(() => {
        if (isEdit && id) {
            const fetchSucursal = async () => {
                setLoading(true);
                try {
                    const data = await sucursalRepository.obtener(id);
                    reset({
                        nombre: data.nombre,
                        direccion: data.direccion,
                        codigo_establecimiento: data.codigo_establecimiento || '1',
                        codigo_postal: data.codigo_postal || '',
                        departamento_id: data.division_nivel_2?.division_nivel_1?.id,
                        division_nivel2_id: data.division_nivel2_id || undefined,
                    });
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            };

            fetchSucursal();
        }
    }, [id, isEdit, reset]);

    const onSubmit = async (data: SucursalFormValues) => {
        try {
            if (isEdit && id) {
                await sucursalRepository.actualizar(id, data);
                toast.success('Sucursal actualizada correctamente');
            } else {
                await sucursalRepository.registrar(data);
                toast.success('Sucursal creada correctamente');
            }
            navigate('/sucursales');
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) return <Loading/>;

    return (
        <Box p={2} maxWidth="800px" mx="auto">
            <Button 
                startIcon={<ArrowBack />} 
                onClick={() => navigate(-1)} 
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Sucursal' : 'Nueva Sucursal'}
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre de la Sucursal"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />

                        <TextField
                            label="Dirección"
                            fullWidth
                            {...register('direccion')}
                            error={!!errors.direccion}
                            helperText={errors.direccion?.message}
                        />

                        <Controller
                            name="departamento_id"
                            control={control}
                            render={({ field }) => (
                                <DepartamentoAutocomplete
                                    value={field.value || null}
                                    onChange={(val) => {
                                        field.onChange(val || '');
                                        setValue('division_nivel2_id', ''); // Limpiar municipio al cambiar departamento
                                    }}
                                    paisId={user?.negocio?.pais?.id}
                                />
                            )}
                        />

                        <Controller
                            name="division_nivel2_id"
                            control={control}
                            render={({ field }) => (
                                <MunicipioAutocomplete
                                    value={field.value || null}
                                    onChange={(val) => field.onChange(val || '')}
                                    departamentoId={departamentoId}
                                />
                            )}
                        />
                        {errors.division_nivel2_id && (
                            <Typography color="error" variant="caption">{errors.division_nivel2_id.message}</Typography>
                        )}

                        <TextField
                            label="Código de Establecimiento"
                            fullWidth
                            {...register('codigo_establecimiento')}
                            error={!!errors.codigo_establecimiento}
                            helperText={errors.codigo_establecimiento?.message}
                        />

                        <TextField
                            label="Código Postal"
                            fullWidth
                            {...register('codigo_postal')}
                            error={!!errors.codigo_postal}
                            helperText={errors.codigo_postal?.message}
                        />

                        <SubmitButton 
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar Cambios' : 'Registrar Sucursal'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default SucursalFormPage;