import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { categoriaSchema, type CategoriaFormValues } from '../../domain/schemas/categoria.schema';
import { CategoriaRepository } from '../../infrastructure/repositories/categoria.repository';
import { CategoriaAutocomplete } from '../components/CategoriaAutocomplete';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const CategoriaFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);

    const methods = useForm<CategoriaFormValues>({
        resolver: zodResolver(categoriaSchema)
    });

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = methods;

    useEffect(() => {
        if (isEdit && id) {
            CategoriaRepository.Obtener(id)
                .then(data => {
                    if (data.default_categoria) {
                        toast.error('Esta categoría predeterminada no es modificable');
                        navigate('/categorias');
                        return;
                    }
                    setValue('categoria', data.categoria);
                    setValue('categoria_padre_id', data.categoria_padre_id || '');
                })
                .finally(() => setLoading(false));
        }
    }, [id, isEdit, navigate, setValue]);

    const onSubmit = async (data: CategoriaFormValues) => {
        try {
            if (isEdit && id) {
                await CategoriaRepository.actualizar(id, data);
                toast.success('Categoría actualizada correctamente');
            } else {
                await CategoriaRepository.registrar(data);
                toast.success('Categoría creada correctamente');
            }
            navigate('/categorias');
        } catch (error) {
            console.error(error);
            toast.error('Error al guardar la categoría');
        }
    };

    if (loading) return <Loading />


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

                <FormProvider {...methods}>
                    <Box component={'form'} onSubmit={handleSubmit(onSubmit)}>
                        <Stack spacing={3}>
                            <TextField
                                label="Nombre de la categoría"
                                fullWidth
                                {...register('categoria')}
                                error={!!errors.categoria}
                                helperText={errors.categoria?.message}
                            />

                            <CategoriaAutocomplete 
                                label="Categoría Padre"
                                placeholder="Selecciona una categoría padre..."
                                categoriaActualId={id}
                            />

                            <SubmitButton 
                                isSubmitting={isSubmitting}
                                text={isEdit ? 'Guardar Cambios' : 'Registrar Categoría'}
                                loadingText="Guardando..."
                                icon={<Save />}
                            />
                        </Stack>
                    </Box>
                </FormProvider>
            </Paper>
        </Box>
    );
};

export default CategoriaFormPage;