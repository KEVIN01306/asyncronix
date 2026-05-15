import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { sucursalSchema, type SucursalFormValues } from '../../domain/schemas/sucursal.schema';
import { sucursalRepository } from '../../infrastructure/repositories/sucursal.repository';

const SucursalFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<SucursalFormValues>({
        resolver: zodResolver(sucursalSchema)
    });

    useEffect(() => {
        if (isEdit && id) {
            const fetchSucursal = async () => {
                setLoading(true);
                try {
                    const data = await sucursalRepository.obtener(id);
                    reset({
                        nombre: data.nombre,
                        direccion: data.direccion,
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

    if (loading) return <Box display="flex" justifyContent="center" mt={10}><CircularProgress /></Box>;

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