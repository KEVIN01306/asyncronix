import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { rolSchema, type RolFormValues } from '../../domain/schemas/rol.schema';
import { RolesRepository } from '../../infrastructure/repositories/rol.repository';

const RolesCreatePage = () => {
    const navigate = useNavigate();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RolFormValues>({
        resolver: zodResolver(rolSchema)
    });

    const onSubmit = async (data: RolFormValues) => {
        try {
            await RolesRepository.registrar(data);
            toast.success('Rol creado correctamente');
            navigate('/roles');
        } catch (error) {
            console.error(error);
            toast.error('Error al crear el rol');
        }
    };

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
                    Nuevo Rol
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
                            text="Registrar Rol"
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default RolesCreatePage;
