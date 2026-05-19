import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Box, Typography, Paper, TextField, Stack, Button, CircularProgress, FormControlLabel, Checkbox, MenuItem } from '@mui/material';
import { ArrowBack, Save } from '@mui/icons-material';
import { toast } from 'sonner';

import { SubmitButton } from '../../../../shared/components/button/SubmitButton';
import { productoSchema, type ProductoFormValues } from '../producto.schema';
import { ProductoRepository } from '../../infrastructure/repositories/producto.repository';
import { CategoriaRepository } from '../../../categorias/infrastructure/repositories/categoria.repository';
import type { Categoria } from '../../../categorias/domain/interfaces/categoria.interface';
import Loading from '../../../../shared/components/ui/Loaders/Loading';

const ProductoFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);
    const [loading, setLoading] = useState(isEdit);
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ProductoFormValues>({
        resolver: zodResolver(productoSchema),
        defaultValues: {
            activo: true,
            precio_sugerido: 0,
            stock_total: 0,
        }
    });

    useEffect(() => {
        CategoriaRepository.listar(100, 0)
            .then((response) => setCategorias(response.data))
            .catch((error) => console.error(error));

        if (isEdit && id) {
            ProductoRepository.obtener(id)
                .then((product) => {
                    setValue('categoria_id', product.categoria_id);
                    setValue('nombre', product.nombre);
                    setValue('codigo', product.codigo ?? '');
                    setValue('precio_sugerido', product.precio_sugerido);
                    setValue('stock_total', product.stock_total);
                    setValue('activo', product.activo);
                })
                .catch((error) => console.error(error))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [id, isEdit, setValue]);

    const onSubmit = async (data: ProductoFormValues) => {
        try {
            if (isEdit && id) {
                await ProductoRepository.actualizar(id, data);
                toast.success('Producto actualizado correctamente');
            } else {
                await ProductoRepository.registrar(data);
                toast.success('Producto registrado correctamente');
            }
            navigate('/productos');
        } catch (error) {
            console.error(error);
            toast.error('Ocurrió un error al guardar el producto');
        }
    };

    if (loading) {
        return <Loading />
    }

    return (
        <Box p={4} maxWidth="700px" mx="auto">
            <Button
                startIcon={<ArrowBack />}
                onClick={() => navigate(-1)}
                sx={{ mb: 2, textTransform: 'none' }}
            >
                Volver
            </Button>

            <Paper sx={{ p: 4, border: (theme) => `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h5" fontWeight={700} mb={3}>
                    {isEdit ? 'Editar Producto' : 'Nuevo Producto'}
                </Typography>

                <Box component="form" onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={3}>
                        <TextField
                            select
                            label="Categoría"
                            fullWidth
                            defaultValue=""
                            {...register('categoria_id')}
                            error={!!errors.categoria_id}
                            helperText={errors.categoria_id?.message}
                        >
                            <MenuItem value="">Selecciona una categoría</MenuItem>
                            {categorias.map((categoria) => (
                                <MenuItem key={categoria.id} value={categoria.id}>
                                    {categoria.categoria}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            label="Nombre"
                            fullWidth
                            {...register('nombre')}
                            error={!!errors.nombre}
                            helperText={errors.nombre?.message}
                        />

                        <TextField
                            label="Código"
                            fullWidth
                            {...register('codigo')}
                            error={!!errors.codigo}
                            helperText={errors.codigo?.message}
                        />

                        <TextField
                            label="Precio sugerido"
                            fullWidth
                            type="number"
                            inputProps={{ min: 0, step: 0.01 }}
                            {...register('precio_sugerido', { valueAsNumber: true })}
                            error={!!errors.precio_sugerido}
                            helperText={errors.precio_sugerido?.message}
                        />

                        <TextField
                            label="Stock total"
                            fullWidth
                            type="number"
                            inputProps={{ min: 0, step: 1 }}
                            {...register('stock_total', { valueAsNumber: true })}
                            error={!!errors.stock_total}
                            helperText={errors.stock_total?.message}
                        />

                        <FormControlLabel
                            control={<Checkbox {...register('activo')} defaultChecked />}
                            label="Activo"
                        />

                        <SubmitButton
                            isSubmitting={isSubmitting}
                            text={isEdit ? 'Guardar cambios' : 'Registrar producto'}
                            loadingText="Guardando..."
                            icon={<Save />}
                        />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ProductoFormPage;
