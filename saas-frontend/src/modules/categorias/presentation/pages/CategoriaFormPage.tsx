import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress, Checkbox, FormControlLabel } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { categoriaSchema, type CategoriaFormValues } from '../../domain/schemas/categoria.schema';
import { CategoriaRepository } from '../../infrastructure/repositories/categoria.repository';

const CategoriaFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<CategoriaFormValues>({
        resolver: zodResolver(categoriaSchema)
    });

    useEffect(() => {
        if (isEdit && id) {
            CategoriaRepository.Obtener(id)
                .then(data => {
                    setValue('categoria', data.categoria);
                    setValue('default_categoria', data.default_categoria ?? false);
                    setValue('activo', data.activo ?? true);
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: CategoriaFormValues) => {
        try {
            const transformedData = {
                ...data,
                default_categoria: data.default_categoria ?? false,
                activo: data.activo ?? true
            };
            if (isEdit && id) {
                await CategoriaRepository.actualizar(id, transformedData);
                toast.success('Categoría actualizada correctamente');
            } else {
                await CategoriaRepository.registrar(transformedData);
                toast.success('Categoría creada correctamente');
            }
            navigate('/categorias');
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
                    {isEdit ? 'Editar Categoría' : 'Nueva Categoría'}
                </Typography>

                <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            label="Nombre de la categoría"
                            fullWidth
                            {...register('categoria')}
                            error={!!errors.categoria}
                            helperText={errors.categoria?.message}
                        />

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                            <FormControlLabel
                                label="Predeterminada"
                                control={<Checkbox {...register('default_categoria')} />}
                            />
                            <FormControlLabel
                                label="Activa"
                                control={<Checkbox {...register('activo')} />}
                            />
                        </Stack>

                        <SubmitButton 
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar Cambios' : 'Registrar Categoría'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default CategoriaFormPage;