import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { proveedorSchema, type ProveedorFormValues } from '../../domain/schemas/proveedor.schema';
import { proveedorRepository } from '../../infrastructure/repositories/proveedor.repository';
import { SubmitButton } from '../../../../shared/components/button/SubmitButton';

const ProveedorFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProveedorFormValues>({
        resolver: zodResolver(proveedorSchema)
    });

    useEffect(() => {
        if (isEdit && id) {
            proveedorRepository.Obtener(id)
                .then(data => {
                    setValue('nombre', data.nombre);
                    setValue('telefono', data.telefono);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: ProveedorFormValues) => {
        try {
            if (isEdit && id) {
                await proveedorRepository.actualizar(id, data);
                toast.success('Proveedor actualizado correctamente');
            } else {
                await proveedorRepository.registrar(data);
                toast.success('Proveedor creado correctamente');
            }
            navigate('/proveedores');
        } catch (error) {
            console.error(error);
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
                    {isEdit ? 'Editar Proveedor' : 'Nuevo Proveedor'}
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre del Proveedor"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />

                        <TextField
                            label="Teléfono de Contacto"
                            fullWidth
                            {...register('telefono')}
                            error={!!errors.telefono}
                            helperText={errors.telefono?.message}
                        />

                        <SubmitButton 
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar Cambios' : 'Registrar Proveedor'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProveedorFormPage;