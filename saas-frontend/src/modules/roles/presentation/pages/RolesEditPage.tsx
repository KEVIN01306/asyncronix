import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { rolSchema, type RolFormValues } from '../../domain/schemas/rol.schema';
import { RolesRepository } from '../../infrastructure/repositories/rol.repository';
import type { Rol } from '../../domain/interfaces/rol.interface';

const RolesEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<RolFormValues>({
        resolver: zodResolver(rolSchema),
        defaultValues: {
            nombre: '',
            descripcion: null,
        }
    });

    useEffect(() => {
        if (!id) return;

        RolesRepository.obtener(id)
            .then((data: Rol) => {
                setValue('nombre', data.nombre);
                setValue('descripcion', data.descripcion);
            })
            .catch((error) => {
                console.error(error);
                toast.error('No se pudo obtener el rol');
            })
            .finally(() => setLoading(false));
    }, [id, setValue]);

    const onSubmit = async (data: RolFormValues) => {
        if (!id) return;

        try {
            await RolesRepository.actualizar(id, data);
            toast.success('Rol actualizado correctamente');
            navigate('/roles');
        } catch (error) {
            console.error(error);
            toast.error('Error al actualizar el rol');
        }
    };

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

    return (
        <Box p={4} maxWidth="600px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    Editar Rol
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre del rol"
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
                            text="Guardar cambios"
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default RolesEditPage;
