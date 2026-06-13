import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { checklistItemSchema, type ChecklistItemFormValues } from '../../domain/schemas/checklist-item.schema';
import { ChecklistItemRepository } from '../../infrastructure/repositories/checklist-item.repository';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ChecklistItemFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ChecklistItemFormValues>({
        resolver: zodResolver(checklistItemSchema)
    });

    useEffect(() => {
        if (isEdit && id) {
            ChecklistItemRepository.Obtener(id)
                .then(data => {
                    setValue('nombre', data.nombre);
                })
                .catch(console.error)
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: ChecklistItemFormValues) => {
        try {
            if (isEdit && id) {
                await ChecklistItemRepository.actualizar(id, data);
                toast.success('Checklist item actualizado correctamente');
            } else {
                await ChecklistItemRepository.registrar(data);
                toast.success('Checklist item creado correctamente');
            }
            navigate('/checklist');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el checklist item');
        }
    };

    if (loading) return <Loading />


    return (
        <Box p={4} maxWidth="640px" mx="auto">
            <Button startIcon={<ArrowBack />} onClick={() => navigate(-1)} sx={{ mb: 2, textTransform: 'none' }}>
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar checklist item' : 'Nuevo checklist item'}
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
                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar cambios' : 'Registrar item'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ChecklistItemFormPage;
