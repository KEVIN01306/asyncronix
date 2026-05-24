import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { opcionServicioSchema, type OpcionServicioFormValues } from '../../domain/schemas/opcion-servicio.schema';
import { OpcionServicioRepository } from '../../infrastructure/repositories/opcion-servicio.repository';

const OpcionServicioFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<OpcionServicioFormValues>({
        resolver: zodResolver(opcionServicioSchema)
    });

    useEffect(() => {
        if (isEdit && id) {
            OpcionServicioRepository.Obtener(id)
                .then(data => {
                    setValue('nombre', data.nombre);
                    setValue('descripcion', data.descripcion ?? '');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: OpcionServicioFormValues) => {
        try {
            if (isEdit && id) {
                await OpcionServicioRepository.actualizar(id, data);
                toast.success('Opción de servicio actualizada correctamente');
            } else {
                await OpcionServicioRepository.registrar(data);
                toast.success('Opción de servicio creada correctamente');
            }
            navigate('/opciones-servicio');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar la opción de servicio');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box p={4} maxWidth="640px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar opción de servicio' : 'Nueva opción de servicio'}
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
                            label="Descripción"
                            fullWidth
                            multiline
                            minRows={3}
                            {...register('descripcion')}
                            error={!!errors.descripcion}
                            helperText={errors.descripcion?.message}
                        />
                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar cambios' : 'Registrar opción'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default OpcionServicioFormPage;
